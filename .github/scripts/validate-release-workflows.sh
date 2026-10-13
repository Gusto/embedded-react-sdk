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

# Extracts the body of every `run: |`/`run: >` block (lines indented
# further than the `run:` key itself) so the checks below only look at
# shell script content, not YAML mapping values like `env:` or `with:`.
run_block_bodies() {
  awk '
    /^[[:space:]]*run:[[:space:]]*[|>]/ {
      match($0, /^[[:space:]]*/); indent = RLENGTH; in_run = 1; next
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
    if [[ "$line" =~ \$\{\{[^}]*(github\.event\.|(^|[^.])inputs\.) ]]; then
      echo "FAIL: $f interpolates an untrusted input/event value directly in a run: script (should go through env:): $line"
      fail=1
    fi
  done < <(run_block_bodies "$f")
done

for f in "${dispatch_workflows[@]}"; do
  if ! grep -q 'validate-release-input.sh' "$f"; then
    echo "FAIL: $f no longer calls validate-release-input.sh"
    fail=1
  fi
done

if [ "$fail" -eq 0 ]; then
  echo "All release-workflow guard checks passed."
fi
exit $fail
