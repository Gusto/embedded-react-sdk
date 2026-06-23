#!/usr/bin/env bash
# Side-by-side install of the old API package for diffing.
# Usage: install-old-package.sh <old-version> [<version-spec>]
# Example: install-old-package.sh 2025-11-15 ^0.0.2

set -euo pipefail

OLD="${1:?usage: install-old-package.sh <old-version> [<version-spec>]}"
SPEC="${2:-latest}"
DEST="/tmp/embedded-api-v-${OLD}"

if [ -d "${DEST}/node_modules/@gusto/embedded-api-v-${OLD}" ]; then
  echo "Already installed at ${DEST}"
  exit 0
fi

mkdir -p "${DEST}"
npm install "@gusto/embedded-api-v-${OLD}@${SPEC}" --no-save --prefix "${DEST}" 2>&1 | tail -5

echo "Installed to ${DEST}/node_modules/@gusto/embedded-api-v-${OLD}"
