#!/usr/bin/env bash
# Choose the next free RC version and update package.json; writes version to GITHUB_OUTPUT.
# Usage: GITHUB_OUTPUT=/tmp/outputs bash .github/scripts/prepare-rc.sh [starting-rc-number]
set -euo pipefail

rc_number="${1:-1}"
script_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
bash "$script_directory/validate-release-input.sh" rc-number "$rc_number"
current_version=$(jq -er '.version' package.json)
if ! [[ "$current_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Expected a stable base version, found $current_version" >&2
  exit 1
fi

# Read the version list once: a failed registry request must never mean available.
versions=$(npm view '@gusto/embedded-react-sdk' versions --json)
jq -e 'type == "array" and all(.[]; type == "string")' <<< "$versions" >/dev/null

while true; do
  if [ "${#rc_number}" -gt 3 ] || [ "$rc_number" -gt 100 ]; then
    echo 'RC number exceeded 100; refusing to continue.' >&2
    exit 1
  fi
  rc_version="${current_version}-rc.${rc_number}"
  if ! jq -e --arg version "$rc_version" 'index($version) != null' <<< "$versions" >/dev/null; then
    break
  fi
  rc_number=$((rc_number + 1))
done

npm version "$rc_version" --no-git-tag-version --ignore-scripts
printf 'version=%s\n' "$rc_version" >> "${GITHUB_OUTPUT:?GITHUB_OUTPUT required}"
echo "Prepared RC version: $rc_version"
