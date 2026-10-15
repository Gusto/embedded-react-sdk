#!/usr/bin/env bash
# Publish the prepared RC, optionally as a dry run.
# Usage: RC_VERSION=1.2.3-rc.1 bash .github/scripts/publish-rc.sh <true|false>
set -euo pipefail

dry_run="${1:?dry-run boolean required}"
script_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
bash "$script_directory/validate-release-input.sh" boolean "$dry_run"
bash "$script_directory/validate-release-input.sh" rc-version "${RC_VERSION:?RC_VERSION required}"

if [ "$dry_run" = true ]; then
  npm publish --access public --tag rc --ignore-scripts --dry-run
  echo "Dry run only — $RC_VERSION was NOT published"
else
  npm publish --access public --tag rc --ignore-scripts
  echo "Published RC version: $RC_VERSION"
fi
printf 'Install with: npm install @gusto/embedded-react-sdk@%s\n' "$RC_VERSION"
