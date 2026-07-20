#!/usr/bin/env bash
set -euo pipefail

# Decides whether to create or refresh the versioned docs snapshot in the
# downstream embedded-sdk-docs repo, then performs the file operations.
#
# Extracted from publish-docs.yaml so the logic can be exercised locally
# without triggering a full CI sync. In CI the workflow handles cloning,
# wiping, copying fresh source, staging, and pushing; this script only owns
# the snapshot decision and file operations.
#
# Usage:
#   .github/scripts/sync-snapshot.sh --downstream <path-to-embedded-sdk-docs>
#                                     [--trigger workflow_run|workflow_dispatch|push]
#                                     [--version <x.y.z>]
#                                     [--dry-run]
#
# --downstream  Path to the local embedded-sdk-docs checkout. Required.
# --trigger     Simulates the GitHub Actions event name. Defaults to
#               workflow_dispatch (equivalent to a manual run: creates a
#               snapshot if missing, skips refresh).
# --version     Override the SDK version. Defaults to package.json.
# --dry-run     Print what would happen without touching any files.
#
# Snapshot action matrix:
#   workflow_run,      minor missing  -> create
#   workflow_run,      minor present  -> refresh
#   workflow_dispatch, minor missing  -> create
#   workflow_dispatch, minor present  -> (no-op — manual runs don't refresh)
#   push                              -> (no-op — push path never touches snapshots)
#
# For the create action the script copies docs/ into the downstream's docs/
# and then runs `npx docusaurus docs:version`. Run `npm ci` in the downstream
# docs-site/ first if node_modules is absent.

DOWNSTREAM=""
TRIGGER="workflow_dispatch"
VERSION=""
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --downstream) DOWNSTREAM="$2"; shift 2 ;;
    --trigger)    TRIGGER="$2";    shift 2 ;;
    --version)    VERSION="$2";    shift 2 ;;
    --dry-run)    DRY_RUN=1;       shift   ;;
    *) echo "Unknown argument: $1" >&2; exit 64 ;;
  esac
done

if [[ -z "$DOWNSTREAM" ]]; then
  echo "Error: --downstream <path> is required" >&2
  exit 64
fi
if [[ ! -d "$DOWNSTREAM" ]]; then
  echo "Error: downstream path does not exist: $DOWNSTREAM" >&2
  exit 1
fi

# Resolve to the repo root of the SDK (the directory containing docs/ and package.json).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if [[ -z "$VERSION" ]]; then
  VERSION=$(node -p "require('${SDK_ROOT}/package.json').version")
fi
MINOR=$(echo "$VERSION" | cut -d. -f1,2)

echo "SDK version : ${VERSION} (minor ${MINOR})"
echo "Downstream  : ${DOWNSTREAM}"
echo "Trigger     : ${TRIGGER}"
[[ "$DRY_RUN" -eq 1 ]] && echo "(dry run — no files will be changed)"
echo ""

# ---- Decide snapshot action ----
MINOR_IN_VERSIONS=false
VERSIONS_JSON="${DOWNSTREAM}/docs-site/versions.json"
if [[ -f "$VERSIONS_JSON" ]] \
   && jq -e --arg key "${MINOR}" 'index($key) != null' "$VERSIONS_JSON" > /dev/null 2>&1; then
  MINOR_IN_VERSIONS=true
fi

SNAPSHOT_ACTION=none
if [[ "$TRIGGER" == "workflow_run" ]] || [[ "$TRIGGER" == "workflow_dispatch" ]]; then
  if [[ "$MINOR_IN_VERSIONS" == "false" ]]; then
    SNAPSHOT_ACTION=create
  elif [[ "$TRIGGER" == "workflow_run" ]]; then
    SNAPSHOT_ACTION=refresh
  fi
fi
echo "Snapshot action: ${SNAPSHOT_ACTION}"
echo ""

if [[ "$SNAPSHOT_ACTION" == "none" ]]; then
  echo "Nothing to do."
  exit 0
fi

VERSIONED_DIR="${DOWNSTREAM}/docs-site/versioned_docs/version-${MINOR}"

# ---- Create ----
if [[ "$SNAPSHOT_ACTION" == "create" ]]; then
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "Would copy ${SDK_ROOT}/docs/ -> ${DOWNSTREAM}/docs/"
    echo "Would run: npx docusaurus docs:version ${MINOR} (in ${DOWNSTREAM}/docs-site)"
  else
    cp -R "${SDK_ROOT}/docs/." "${DOWNSTREAM}/docs/"
    (
      cd "${DOWNSTREAM}/docs-site"
      [[ ! -d node_modules ]] && npm ci
      npx docusaurus docs:version "${MINOR}"
    )
    echo "Created snapshot version-${MINOR}."
  fi
  exit 0
fi

# ---- Refresh ----
if [[ ! -d "$VERSIONED_DIR" ]]; then
  echo "Error: ${MINOR} is in versions.json but ${VERSIONED_DIR}/ is missing." >&2
  exit 1
fi

updated=0
orphan=0
added=0

# Update files already in the snapshot.
while IFS= read -r snap_file; do
  rel="${snap_file#${VERSIONED_DIR}/}"
  live="${SDK_ROOT}/docs/${rel}"
  if [[ -f "$live" ]]; then
    [[ "$DRY_RUN" -eq 0 ]] && cp "$live" "$snap_file"
    updated=$((updated + 1))
  else
    echo "  orphan (no live counterpart): ${rel}"
    orphan=$((orphan + 1))
  fi
done < <(find "$VERSIONED_DIR" -type f | sort)

# Add files present in live docs/ but absent from the snapshot.
while IFS= read -r live_file; do
  rel="${live_file#${SDK_ROOT}/docs/}"
  snap="${VERSIONED_DIR}/${rel}"
  if [[ ! -f "$snap" ]]; then
    echo "  add (missing from snapshot): ${rel}"
    if [[ "$DRY_RUN" -eq 0 ]]; then
      mkdir -p "$(dirname "$snap")"
      cp "$live_file" "$snap"
    fi
    added=$((added + 1))
  fi
done < <(find "${SDK_ROOT}/docs" -type f | sort)

echo ""
echo "Refreshed ${updated} file(s) in version-${MINOR}; ${added} added; ${orphan} orphan(s) left as-is."

if [[ "${added}" -gt 0 ]] || [[ "${orphan}" -gt 0 ]]; then
  echo ""
  echo "WARNING: structural changes detected — ${added} file(s) added, ${orphan} orphan(s)."
  echo "Verify that version-${MINOR} snapshot looks correct before merging."
fi
