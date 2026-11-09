#!/usr/bin/env bash
# Rejects source-controlled npm configuration that could redirect or
# intercept credentialed npm traffic: a project .npmrc (registry, proxy,
# strict-ssl, cafile) or a package.json#publishConfig override. Fails
# closed — any error reading the target tree is a rejection, not a pass.
#
# Usage: guard-npm-config.sh [dir]   (default: .)
set -euo pipefail

dir="${1:-.}"

npmrc="$dir/.npmrc"
if [ -e "$npmrc" ] || [ -L "$npmrc" ]; then
  echo "guard-npm-config.sh: refusing to proceed — $npmrc is present (file or symlink)" >&2
  exit 1
fi

package_json="$dir/package.json"
if [ ! -f "$package_json" ]; then
  echo "guard-npm-config.sh: refusing to proceed — $package_json is missing" >&2
  exit 1
fi

if ! jq -e 'type == "object"' "$package_json" >/dev/null 2>&1; then
  echo "guard-npm-config.sh: refusing to proceed — $package_json is not a valid JSON object" >&2
  exit 1
fi

has_publish_config=$(jq 'has("publishConfig")' "$package_json" 2>/dev/null) || {
  echo "guard-npm-config.sh: refusing to proceed — could not evaluate $package_json" >&2
  exit 1
}
if [ "$has_publish_config" = "true" ]; then
  echo "guard-npm-config.sh: refusing to proceed — $package_json sets publishConfig" >&2
  exit 1
fi

echo "guard-npm-config.sh: no source-controlled npm configuration found in $dir"
