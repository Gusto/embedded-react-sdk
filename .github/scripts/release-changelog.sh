#!/usr/bin/env bash
# Extract this version's changelog; writes version, notes_file and content outputs.
# Usage: GITHUB_OUTPUT=/tmp/outputs bash .github/scripts/release-changelog.sh
set -euo pipefail

version=$(jq -er '.version' package.json)
script_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
bash "$script_directory/validate-release-input.sh" semver "$version"
notes_file=$(mktemp)
awk -v version="$version" 'index($0, "## [" version "]") == 1 {found=1; next} /^## \[/ {if(found) exit} found {print}' CHANGELOG.md > "$notes_file"
if ! grep -q '[^[:space:]]' "$notes_file"; then
  rm -f "$notes_file"
  echo "No changelog entry for $version" >&2
  exit 1
fi

# Random delimiters keep changelog text from terminating the Actions output early.
delimiter="CHANGELOG_$(openssl rand -hex 16)"
{
  printf 'version=%s\nnotes_file=%s\n' "$version" "$notes_file"
  echo "content<<$delimiter"
  cat "$notes_file"
  echo "$delimiter"
} >> "${GITHUB_OUTPUT:?GITHUB_OUTPUT required}"
