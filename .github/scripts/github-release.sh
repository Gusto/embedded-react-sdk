#!/usr/bin/env bash
set -euo pipefail

version="${1:?usage: github-release.sh <version> <notes-file>}"
notes_file="${2:?notes-file required}"
bash "$(dirname "${BASH_SOURCE[0]}")/validate-release-input.sh" semver "$version"

tag="v$version"
error_file=$(mktemp)
trap 'rm -f "$error_file"' EXIT

if gh api "repos/${GH_REPO:?GH_REPO required}/releases/tags/$tag" --silent 2> "$error_file"; then
  exists=true
elif grep -q '(HTTP 404)' "$error_file"; then
  exists=false
else
  cat "$error_file" >&2
  exit 1
fi

if [ "$exists" = true ]; then
  echo "Release $tag already exists, skipping."
else
  gh release create "$tag" --verify-tag --title "$tag" --notes-file "$notes_file"
fi
