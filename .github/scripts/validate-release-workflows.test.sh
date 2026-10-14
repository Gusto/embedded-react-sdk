#!/usr/bin/env bash
# Guards the npm publish/unpublish release workflows against regressions
# this hardening pass fixed: a cache action reintroduced into an
# NPM_TOKEN-bearing job, an untrusted dispatch input/event value
# interpolated directly into a shell script instead of passed through
# `env:`, or a workflow that stops calling the input validator.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

fail=0
# Workflows that hold NPM_TOKEN at some point (directly, or via a job in
# the same file) — the cache-poisoning risk this guards against.
token_bearing_workflows=(workflows/publish.yaml workflows/publish-rc.yaml workflows/unpublish.yaml workflows/unpublish-rc.yaml)
# Also includes build-sdk.yaml: it's secret-less, but it still consumes an
# untrusted-ish `ref` input forwarded from publish-rc.yaml, so a future
# edit that starts interpolating it directly into a run: script instead of
# via env:/action inputs is still worth catching here.
input_consuming_workflows=("${token_bearing_workflows[@]}" workflows/build-sdk.yaml)
dispatch_workflows=(workflows/publish-rc.yaml workflows/unpublish.yaml workflows/unpublish-rc.yaml)

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

for f in "${token_bearing_workflows[@]}"; do
  if grep -q 'uses:.*actions/cache' "$f"; then
    echo "FAIL: $f uses actions/cache in an NPM_TOKEN-bearing workflow"
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

for workflow_job in 'publish.yaml npm-publish' 'publish-rc.yaml publish'; do
  read -r workflow job <<< "$workflow_job"
  f="workflows/$workflow"
  require_job_pattern "$f" "$job" '^    runs-on: ubuntu-latest$'
  require_job_pattern "$f" "$job" '^      contents: read$'
  require_job_pattern "$f" "$job" '^      id-token: write$'
  require_job_pattern "$f" "$job" 'NODE_AUTH_TOKEN:.*secrets.NPM_TOKEN'
  require_job_pattern "$f" "$job" 'npm publish .*--ignore-scripts'
  reject_job_pattern "$f" "$job" 'contents: write|actions/cache'
  reject_job_pattern "$f" "$job" '^[[:space:]]*(- run: )?(git push|npm ci|npm install)([[:space:]]|$)'
done

require_job_pattern workflows/publish.yaml npm-publish '^    needs: build$'
require_job_pattern workflows/publish.yaml tag '^    needs: npm-publish$'
require_job_pattern workflows/publish.yaml tag '^      group: gusto-ubuntu-default$'
require_job_pattern workflows/publish.yaml tag '^      contents: write$'
require_job_pattern workflows/publish.yaml tag 'git push origin'
reject_job_pattern workflows/publish.yaml tag 'NPM_TOKEN|NODE_AUTH_TOKEN|id-token:|npm publish'

if [ "$fail" -eq 0 ]; then
  echo "All release-workflow guard checks passed."
fi
exit $fail
