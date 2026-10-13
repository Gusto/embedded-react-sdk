#!/usr/bin/env bash
# Validates a single release-workflow input against an allowlist pattern,
# so untrusted workflow_dispatch values are checked before any workflow
# interpolates them into a shell command. One canonical pattern per kind,
# shared across the publish/unpublish workflows and their test harness.
#
# Usage: validate-release-input.sh <kind> <value>
# Exits 0 if valid, 1 with a message on stderr otherwise.
set -euo pipefail

kind="${1:?usage: validate-release-input.sh <kind> <value>}"
value="${2:-}"

case "$kind" in
  semver)
    pattern='^[0-9]+\.[0-9]+\.[0-9]+(-rc\.[0-9]+)?$'
    ;;
  semver-base)
    pattern='^[0-9]+\.[0-9]+\.[0-9]+$'
    ;;
  commit-sha)
    pattern='^[0-9a-fA-F]{7,40}$'
    ;;
  branch-name)
    pattern='^[A-Za-z0-9][A-Za-z0-9._/-]*$'
    ;;
  rc-number)
    pattern='^[1-9][0-9]*$'
    ;;
  boolean)
    pattern='^(true|false)$'
    ;;
  confirm)
    pattern='^CONFIRM$'
    ;;
  unpublish-type)
    pattern='^(specific_version|latest_rc|all_rc_for_version)$'
    ;;
  *)
    echo "validate-release-input.sh: unknown kind '$kind'" >&2
    exit 1
    ;;
esac

if [[ "$value" =~ $pattern ]]; then
  exit 0
fi

echo "validate-release-input.sh: '$value' is not a valid $kind" >&2
exit 1
