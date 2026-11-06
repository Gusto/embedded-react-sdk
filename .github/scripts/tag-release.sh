#!/usr/bin/env bash
# Push an annotated tag for package.json, or verify the existing remote tag.
# Usage: bash .github/scripts/tag-release.sh (from the release checkout)
set -euo pipefail

version=$(jq -er '.version' package.json)
script_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
bash "$script_directory/validate-release-input.sh" semver "$version"
tag="v$version"

if git ls-remote --exit-code origin "refs/tags/$tag" >/dev/null; then
  git fetch origin "refs/tags/$tag"
  if [ "$(git rev-parse 'FETCH_HEAD^{commit}')" != "$(git rev-parse HEAD)" ]; then
    echo "Tag $tag already points to a different commit." >&2
    exit 1
  fi
  echo "Tag $tag already exists at this commit, skipping."
else
  status=$?
  if [ "$status" -ne 2 ]; then
    exit "$status"
  fi
  git config user.name 'github-actions[bot]'
  git config user.email 'github-actions[bot]@users.noreply.github.com'
  git tag -a "$tag" -m "Release $tag"
  git push origin "refs/tags/$tag"
fi
