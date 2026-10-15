#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

fail=0
registry_workflows=(workflows/publish.yaml workflows/publish-rc.yaml workflows/retire-rc.yaml)
registry_scripts=(scripts/prepare-rc.sh scripts/retire-rc.sh scripts/validate-release-input.sh)
input_consuming_workflows=("${registry_workflows[@]}" workflows/build-sdk.yaml)
dispatch_workflows=(workflows/publish-rc.yaml workflows/retire-rc.yaml)

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

for workflow_job in 'publish.yaml npm-publish' 'publish-rc.yaml publish' 'retire-rc.yaml retire'; do
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
require_job_pattern workflows/publish-rc.yaml publish '^    environment: npm-release-rc$'
require_job_pattern workflows/retire-rc.yaml retire '^    environment: npm-release-rc$'

for workflow_job in 'publish.yaml npm-publish' 'publish-rc.yaml publish'; do
  read -r workflow job <<< "$workflow_job"
  require_job_pattern "workflows/$workflow" "$job" 'uses: actions/download-artifact@'
done

for workflow_job in 'publish-rc.yaml publish' 'retire-rc.yaml retire'; do
  read -r workflow job <<< "$workflow_job"
  require_job_pattern "workflows/$workflow" "$job" '^      group: npm-rc$'
  require_job_pattern "workflows/$workflow" "$job" '^      cancel-in-progress: false$'
done

# Scripts invoked by the credentialed jobs are part of the same permission boundary.
for f in "${registry_scripts[@]}"; do
  if grep -v '^[[:space:]]*#' "$f" | grep -qE '(^|[;&|])[[:space:]]*(npm (ci|install|exec)|npx |git push)|\$\{\{'; then
    echo "FAIL: $f executes dependencies, writes GitHub state or embeds Actions expressions"
    fail=1
  fi
done
require_job_pattern workflows/publish.yaml npm-publish 'npm publish .*--ignore-scripts'
require_job_pattern workflows/publish-rc.yaml publish 'bash [.]release-workflow/[.]github/scripts/prepare-rc[.]sh'
require_job_pattern workflows/publish-rc.yaml publish 'npm publish .*--tag rc --ignore-scripts'
require_job_pattern workflows/publish-rc.yaml publish '^          path: [.]release-workflow$'
require_job_pattern workflows/publish-rc.yaml publish '^          ref: \$\{\{ github.sha \}\}$'
require_job_pattern workflows/publish-rc.yaml publish '^          persist-credentials: false$'
require_job_pattern workflows/publish.yaml release 'release-changelog[.]sh'
require_job_pattern workflows/publish.yaml release 'release-summary[.]sh'
require_job_pattern workflows/publish.yaml release 'release-notification[.]sh'

require_job_pattern workflows/retire-rc.yaml retire 'retire-rc[.]sh'
require_job_pattern workflows/publish.yaml npm-publish '^    needs: build$'
require_job_pattern workflows/publish.yaml release '^    needs: npm-publish$'
require_job_pattern workflows/publish.yaml release 'tag-release[.]sh'
require_job_pattern workflows/publish.yaml release 'github-release[.]sh'

require_job_pattern workflows/publish.yaml release '^      group: gusto-ubuntu-default$'
require_job_pattern workflows/publish.yaml release '^      contents: write$'
reject_job_pattern workflows/publish.yaml release 'environment:|NPM_TOKEN|NODE_AUTH_TOKEN|id-token:|npm publish'

reject_job_pattern workflows/build-sdk.yaml build 'environment:|secrets\.|id-token:|contents: write'

if [ "$fail" -eq 0 ]; then
  echo "All release-workflow guard checks passed."
fi
exit $fail
