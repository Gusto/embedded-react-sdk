#!/usr/bin/env bash
# Remove the npm rc tag only if it matches the expected version.
# Usage: bash .github/scripts/retire-rc.sh <expected-rc-version> <dry-run:true|false>
set -euo pipefail

expected_version="${1:?expected RC version required}"
dry_run="${2:?dry-run boolean required}"
script_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
bash "$script_directory/validate-release-input.sh" rc-version "$expected_version"
bash "$script_directory/validate-release-input.sh" boolean "$dry_run"

package_name='@gusto/embedded-react-sdk'
tags=$(npm view "$package_name" dist-tags --json)
current_version=$(jq -er '
  if type != "object" then error("Expected dist-tag object")
  elif has("rc") then
    .rc | if type == "string" and length > 0 then . else error("Invalid rc tag") end
  else ""
  end
' <<< "$tags")

if [ -z "$current_version" ]; then
  echo 'The rc tag is already absent; nothing to retire.'
  exit 0
fi

if [ "$current_version" != "$expected_version" ]; then
  echo "Expected rc to point to $expected_version, but found $current_version. Refusing retirement." >&2
  exit 1
fi

if [ "$dry_run" = true ]; then
  echo "Would remove the rc tag pointing to $current_version. Exact-version installs remain available."
else
  npm dist-tag rm "$package_name" rc
  echo "Removed the rc tag pointing to $current_version. Exact-version installs remain available."
fi
