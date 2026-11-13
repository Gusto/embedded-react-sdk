#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

fail=0
registry_workflows=(workflows/publish.yaml workflows/publish-rc.yaml workflows/retire-rc.yaml workflows/publish-manual.yaml)
registry_scripts=(scripts/prepare-rc.sh scripts/retire-rc.sh scripts/validate-release-input.sh scripts/guard-npm-config.sh)
input_consuming_workflows=("${registry_workflows[@]}" workflows/build-sdk.yaml)
dispatch_workflows=(workflows/publish-rc.yaml workflows/retire-rc.yaml workflows/publish-manual.yaml)

# Extracts the shell content of every `run:` step — both block-scalar
# (`run: |`/`run: >`, body = lines indented further than the `run:` key)
# and single-line (`run: <command>`) forms — so the checks below only look
# at shell script content, not YAML mapping values like `env:` or `with:`.
run_block_bodies() {
  awk '
    /^[[:space:]]*(-[[:space:]]+)?run:[[:space:]]*[|>]/ {
      match($0, /^[[:space:]]*/); indent = RLENGTH; in_run = 1; next
    }
    /^[[:space:]]*(-[[:space:]]+)?run:[[:space:]]*[^|>[:space:]]/ {
      sub(/^[[:space:]]*(-[[:space:]]+)?run:[[:space:]]*/, ""); print; next
    }
    in_run {
      if ($0 ~ /^[[:space:]]*$/) { next }
      match($0, /^[[:space:]]*/)
      if (RLENGTH <= indent) { in_run = 0 } else { print }
    }
  ' "$1"
}

for f in "${registry_workflows[@]}"; do
  if grep -q 'uses:.*actions/cache' "$f"; then
    echo "FAIL: $f uses actions/cache in a registry workflow"
    fail=1
  fi
done

for f in "${input_consuming_workflows[@]}"; do
  while IFS= read -r line; do
    # Pull out each ${{ ... }} expression and check its *own* contents for
    # a github.event.*/inputs.* reference at a real token boundary (start
    # of the expression, or preceded by a non-identifier character) —
    # rather than matching against the raw line, which required a
    # boundary character between the `${{` delimiter itself and the
    # identifier and so missed the common no-space form `${{inputs.x}}`.
    while IFS= read -r expr_match; do
      expr="${expr_match#\$\{\{}"
      expr="${expr%\}\}}"
      if [[ "$expr" =~ (^|[^.[:alnum:]_])(github\.event\.|inputs\.) ]]; then
        echo "FAIL: $f interpolates an untrusted input/event value directly in a run: script (should go through env:): $line"
        fail=1
      fi
    done < <(grep -oE '\$\{\{[^}]*\}\}' <<< "$line")
  done < <(run_block_bodies "$f")
done

for f in "${dispatch_workflows[@]}"; do
  if ! grep -v '^[[:space:]]*#' "$f" | grep -q 'validate-release-input\.sh'; then
    echo "FAIL: $f no longer calls validate-release-input.sh"
    fail=1
  fi
done

job_body() {
  awk -v job="$2" '
    /^  [[:alnum:]_-]+:$/ { in_job = ($0 == "  " job ":") }
    in_job && $0 !~ /^[[:space:]]*#/ { print }
  ' "$1"
}

require_job_pattern() {
  if ! job_body "$1" "$2" | grep -qE "$3"; then
    echo "FAIL: $1 job $2 must contain $3"
    fail=1
  fi
}

reject_job_pattern() {
  if job_body "$1" "$2" | grep -qE "$3"; then
    echo "FAIL: $1 job $2 must not contain $3"
    fail=1
  fi
}

# Presence alone doesn't prove a guard runs early enough to matter — a step
# can satisfy require_job_pattern while sitting after the thing it's meant
# to gate. Assert line order within the job body instead.
require_order() {
  local file="$1" job="$2" first_pattern="$3" second_pattern="$4" first_label="$5" second_label="$6"
  local body first_line second_line
  body="$(job_body "$file" "$job")"
  # || true: under pipefail, a pattern with zero matches makes this whole
  # pipeline — and the function's caller, running at top level under set -e
  # — exit right here, silently, skipping every remaining check in the file.
  first_line=$(grep -nE "$first_pattern" <<< "$body" | head -1 | cut -d: -f1) || true
  second_line=$(grep -nE "$second_pattern" <<< "$body" | head -1 | cut -d: -f1) || true
  if [ -z "$first_line" ]; then
    echo "FAIL: $file job $job is missing $first_label"
    fail=1
  elif [ -z "$second_line" ]; then
    echo "FAIL: $file job $job is missing $second_label"
    fail=1
  elif [ "$first_line" -ge "$second_line" ]; then
    echo "FAIL: $file job $job must run $first_label before $second_label"
    fail=1
  fi
}

for f in "${registry_workflows[@]}" "${registry_scripts[@]}"; do
  if grep -v '^[[:space:]]*#' "$f" | grep -qE 'NPM_TOKEN|NODE_AUTH_TOKEN|npm (unpublish|deprecate)|github-release.sh delete'; then
    echo "FAIL: $f contains reusable npm authentication or unsupported registry operations"
    fail=1
  fi
done

for f in workflows/unpublish.yaml workflows/unpublish-rc.yaml; do
  if [ -e "$f" ]; then
    echo "FAIL: obsolete workflow $f must be removed"
    fail=1
  fi
done

for workflow_job in 'publish.yaml npm-publish' 'publish-rc.yaml publish' 'retire-rc.yaml retire' 'publish-manual.yaml npm-publish'; do
  read -r workflow job <<< "$workflow_job"
  f="workflows/$workflow"
  require_job_pattern "$f" "$job" '^    runs-on: ubuntu-latest$'
  require_job_pattern "$f" "$job" '^      contents: read$'
  require_job_pattern "$f" "$job" '^      id-token: write$'
  require_job_pattern "$f" "$job" 'npm install --global npm@11.21.0 --ignore-scripts'
  require_job_pattern "$f" "$job" 'package-manager-cache: false'
  reject_job_pattern "$f" "$job" 'contents: write|actions/cache|secrets\.'
  reject_job_pattern "$f" "$job" 'git push'
  if job_body "$f" "$job" | grep -E '^[[:space:]]*((- )?run: )?npm (ci|install)|(&&|;|[|])[[:space:]]*npm (ci|install)' | grep -vE '^[[:space:]]+run: npm install --global npm@11[.]21[.]0 --ignore-scripts$'; then
    echo "FAIL: $f job $job installs dependencies beyond the pinned npm CLI"
    fail=1
  fi
done

require_job_pattern workflows/publish.yaml npm-publish '^    environment: npm-release$'
require_job_pattern workflows/publish-rc.yaml publish '^    environment: npm-release-manual$'
require_job_pattern workflows/retire-rc.yaml retire '^    environment: npm-release-manual$'
require_job_pattern workflows/publish-manual.yaml npm-publish '^    environment: npm-release-manual$'

for workflow_job in 'publish.yaml npm-publish' 'publish-rc.yaml publish' 'publish-manual.yaml npm-publish'; do
  read -r workflow job <<< "$workflow_job"
  require_job_pattern "workflows/$workflow" "$job" 'uses: actions/download-artifact@'
done

for workflow_job in 'publish-rc.yaml publish' 'retire-rc.yaml retire'; do
  read -r workflow job <<< "$workflow_job"
  require_job_pattern "workflows/$workflow" "$job" '^      group: npm-rc$'
  require_job_pattern "workflows/$workflow" "$job" '^      cancel-in-progress: false$'
done

require_job_pattern workflows/publish-manual.yaml npm-publish '^      group: npm-publish-manual$'
require_job_pattern workflows/publish-manual.yaml npm-publish '^      cancel-in-progress: false$'

# Scripts invoked by the credentialed jobs are part of the same permission boundary.
for f in "${registry_scripts[@]}"; do
  if grep -v '^[[:space:]]*#' "$f" | grep -qE '(^|[;&|])[[:space:]]*(npm (ci|install|exec)|npx |git push)|\$\{\{'; then
    echo "FAIL: $f executes dependencies, writes GitHub state or embeds Actions expressions"
    fail=1
  fi
done
require_job_pattern workflows/publish.yaml npm-publish 'npm publish .*--ignore-scripts'
require_job_pattern workflows/publish-manual.yaml npm-publish 'npm publish .*--ignore-scripts'
require_job_pattern workflows/publish-rc.yaml publish 'bash [.]release-workflow/[.]github/scripts/prepare-rc[.]sh'
require_job_pattern workflows/publish-rc.yaml publish 'npm publish .*--tag rc --ignore-scripts'
require_job_pattern workflows/publish-rc.yaml publish '^          path: [.]release-workflow$'
require_job_pattern workflows/publish-rc.yaml publish '^          ref: \$\{\{ github.sha \}\}$'
require_job_pattern workflows/publish-rc.yaml publish '^          persist-credentials: false$'
require_job_pattern workflows/publish.yaml release 'release-changelog[.]sh'
require_job_pattern workflows/publish.yaml release 'release-summary[.]sh'
require_job_pattern workflows/publish.yaml release 'release-notification[.]sh'

# The RC validate job only has one working tree, and it's overwritten by the
# untrusted-ref checkout — same isolation as the publish job's helpers, so
# the guard script it calls can't be the RC source's own copy of itself.
require_job_pattern workflows/publish-rc.yaml validate '^          path: [.]release-workflow$'
require_job_pattern workflows/publish-rc.yaml validate '^          ref: \$\{\{ github.sha \}\}$'
require_job_pattern workflows/publish-rc.yaml validate '^          persist-credentials: false$'
require_order workflows/publish-rc.yaml validate '^          path: [.]release-workflow$' 'guard-npm-config[.]sh' \
  'the trusted-helper checkout' 'the npm-config guard'

# workflow_dispatch runs whatever copy of this file lives on the ref the
# dispatcher picked — refuse to run privileged steps from anywhere but main.
require_job_pattern workflows/publish-rc.yaml validate "if: github.ref == 'refs/heads/main'"

# Guard invocations must be pinned end-to-end, including the trailing
# argument — a guard pointed at an always-clean path (e.g. the trusted
# .release-workflow checkout instead of the untrusted tree at ".") would
# still satisfy a pattern that only matches the script path.
for workflow_job in 'publish.yaml npm-publish' 'publish-manual.yaml npm-publish'; do
  read -r workflow job <<< "$workflow_job"
  require_job_pattern "workflows/$workflow" "$job" 'NPM_CONFIG_REGISTRY: https://registry[.]npmjs[.]org/?$'
  require_job_pattern "workflows/$workflow" "$job" "NPM_CONFIG_PROXY: 'null'"
  require_job_pattern "workflows/$workflow" "$job" "NPM_CONFIG_HTTPS_PROXY: 'null'"
  require_job_pattern "workflows/$workflow" "$job" "NPM_CONFIG_STRICT_SSL: 'true'"
  require_order "workflows/$workflow" "$job" 'guard-npm-config[.]sh' 'uses: actions/setup-node@' \
    'the npm-config guard' 'setup-node'
done

# publish.yaml's checkout is always a fresh CI-green main tip, so the bare
# script path is already trusted there.
require_job_pattern workflows/publish.yaml npm-publish 'bash [.]github/scripts/guard-npm-config[.]sh [.]$'

# publish-manual.yaml's target commit can be any already-merged release
# commit, not necessarily one that contains this script — same isolation
# as publish-rc.yaml's jobs below, for the same reason.
require_job_pattern workflows/publish-manual.yaml npm-publish 'bash [.]release-workflow/[.]github/scripts/guard-npm-config[.]sh [.]$'
require_job_pattern workflows/publish-manual.yaml npm-publish '^          path: [.]release-workflow$'
require_job_pattern workflows/publish-manual.yaml npm-publish '^          ref: \$\{\{ github.sha \}\}$'
require_job_pattern workflows/publish-manual.yaml npm-publish '^          persist-credentials: false$'
require_order workflows/publish-manual.yaml npm-publish '^          path: [.]release-workflow$' 'guard-npm-config[.]sh' \
  'the trusted-helper checkout' 'the npm-config guard'

require_job_pattern workflows/publish-rc.yaml publish 'bash [.]release-workflow/[.]github/scripts/guard-npm-config[.]sh [.]$'
require_job_pattern workflows/publish-rc.yaml publish 'NPM_CONFIG_REGISTRY: https://registry[.]npmjs[.]org/?$'
require_job_pattern workflows/publish-rc.yaml publish "NPM_CONFIG_PROXY: 'null'"
require_job_pattern workflows/publish-rc.yaml publish "NPM_CONFIG_HTTPS_PROXY: 'null'"
require_job_pattern workflows/publish-rc.yaml publish "NPM_CONFIG_STRICT_SSL: 'true'"
require_order workflows/publish-rc.yaml publish 'guard-npm-config[.]sh' 'uses: actions/setup-node@' \
  'the npm-config guard' 'setup-node'
# setup-node precedes download-artifact today, but that's incidental — the
# property that actually matters is the guard running before the artifact
# extraction itself, which is the step a separate, already-known symlink
# issue in this job can abuse to swap out trusted helpers.
require_order workflows/publish-rc.yaml publish 'guard-npm-config[.]sh' 'uses: actions/download-artifact@' \
  'the npm-config guard' 'the artifact download'

# A second, post-extraction re-check — nothing else between the artifact
# download and the credentialed npm calls below proves the root tree is
# still clean.
require_order workflows/publish-rc.yaml publish 'uses: actions/download-artifact@' 'Re-check npm configuration' \
  'the artifact download' 'the post-extraction npm-config re-check'
require_order workflows/publish-rc.yaml publish 'Re-check npm configuration' 'bash [.]release-workflow/[.]github/scripts/prepare-rc[.]sh' \
  'the post-extraction npm-config re-check' 'prepare-rc.sh'

require_job_pattern workflows/publish-rc.yaml validate 'bash [.]release-workflow/[.]github/scripts/guard-npm-config[.]sh [.]$'
require_order workflows/publish-rc.yaml validate 'guard-npm-config[.]sh' 'GITHUB_STEP_SUMMARY' \
  'the npm-config guard' 'the approval summary'

require_job_pattern workflows/retire-rc.yaml retire 'retire-rc[.]sh'
require_job_pattern workflows/publish.yaml npm-publish '^    needs: build$'
require_job_pattern workflows/publish.yaml release '^    needs: npm-publish$'
require_job_pattern workflows/publish.yaml release 'tag-release[.]sh'
require_job_pattern workflows/publish.yaml release 'github-release[.]sh'

require_job_pattern workflows/publish.yaml release '^      group: gusto-ubuntu-default$'
require_job_pattern workflows/publish.yaml release '^      contents: write$'
reject_job_pattern workflows/publish.yaml release 'environment:|NPM_TOKEN|NODE_AUTH_TOKEN|id-token:|npm publish'

reject_job_pattern workflows/build-sdk.yaml build 'environment:|secrets\.|id-token:|contents: write'

# publish-manual.yaml: same shape as publish.yaml's build/npm-publish/release
# chain, but gated by an explicit main-ref guard and a validated, already-
# merged commit input instead of a workflow_run trigger.
require_job_pattern workflows/publish-manual.yaml validate "if: github.ref == 'refs/heads/main'"
require_job_pattern workflows/publish-manual.yaml validate 'validate-release-input\.sh commit-sha'
require_job_pattern workflows/publish-manual.yaml validate 'merge-base --is-ancestor'
require_job_pattern workflows/publish-manual.yaml validate 'chore: release'
reject_job_pattern workflows/publish-manual.yaml validate 'contents: write|secrets\.|id-token:|git push'

require_job_pattern workflows/publish-manual.yaml npm-publish '^    needs: \[validate, build\]$'
require_job_pattern workflows/publish-manual.yaml release '^    needs: \[validate, npm-publish\]$'
require_job_pattern workflows/publish-manual.yaml release 'tag-release[.]sh'
require_job_pattern workflows/publish-manual.yaml release 'github-release[.]sh'
require_job_pattern workflows/publish-manual.yaml release '^      group: gusto-ubuntu-default$'
require_job_pattern workflows/publish-manual.yaml release '^      contents: write$'
reject_job_pattern workflows/publish-manual.yaml release 'environment:|NPM_TOKEN|NODE_AUTH_TOKEN|id-token:|npm publish'

# guard-npm-config.sh: built and discarded at run time. A committed fixture
# with a working proxy override would look exactly like the thing this
# guard exists to catch.
clean_fixture=$(mktemp -d)
printf '{"name":"x","version":"1.0.0"}' > "$clean_fixture/package.json"

npmrc_fixture=$(mktemp -d)
printf '{"name":"x","version":"1.0.0"}' > "$npmrc_fixture/package.json"
printf 'registry=https://attacker.example/\n' > "$npmrc_fixture/.npmrc"

symlink_fixture=$(mktemp -d)
printf '{"name":"x","version":"1.0.0"}' > "$symlink_fixture/package.json"
ln -s /nonexistent-target "$symlink_fixture/.npmrc"

publish_config_fixture=$(mktemp -d)
printf '{"name":"x","version":"1.0.0","publishConfig":{"registry":"https://attacker.example/"}}' \
  > "$publish_config_fixture/package.json"

if ! bash scripts/guard-npm-config.sh "$clean_fixture" >/dev/null; then
  echo "FAIL: guard-npm-config.sh rejected a clean source tree"
  fail=1
fi

if bash scripts/guard-npm-config.sh "$npmrc_fixture" >/dev/null 2>&1; then
  echo "FAIL: guard-npm-config.sh accepted a tree with a committed .npmrc"
  fail=1
fi

if bash scripts/guard-npm-config.sh "$symlink_fixture" >/dev/null 2>&1; then
  echo "FAIL: guard-npm-config.sh accepted a tree with a symlinked .npmrc"
  fail=1
fi

if bash scripts/guard-npm-config.sh "$publish_config_fixture" >/dev/null 2>&1; then
  echo "FAIL: guard-npm-config.sh accepted a package.json with publishConfig"
  fail=1
fi

rm -rf "$clean_fixture" "$npmrc_fixture" "$symlink_fixture" "$publish_config_fixture"

if [ "$fail" -eq 0 ]; then
  echo "All release-workflow guard checks passed."
fi
exit $fail
