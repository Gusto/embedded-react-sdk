#!/usr/bin/env bash
# knip-fix.sh — run knip --fix and optionally scope changes to target directories
# Usage: knip-fix.sh [target-directory ...]
#
# If one or more target directories are given, any files knip touches outside
# those directories are reverted via `git checkout HEAD --` before lint/format run.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

cd "$REPO_ROOT"

# Collect and normalise all directory arguments.
TARGET_DIRS=()
for arg in "$@"; do
  dir="${arg#./}"  # strip leading ./
  dir="${dir%/}"   # strip trailing /
  TARGET_DIRS+=("$dir")
done

if [[ ${#TARGET_DIRS[@]} -gt 0 ]]; then
  echo "==> Running knip (scoped to: ${TARGET_DIRS[*]})"
else
  echo "==> Running knip (no scope restriction)"
fi

# Returns 0 if the given file path is inside any of the target directories.
in_target_dirs() {
  local file="$1"
  for dir in "${TARGET_DIRS[@]}"; do
    if [[ "$file" == "$dir" || "$file" == "$dir/"* ]]; then
      return 0
    fi
  done
  return 1
}

# Snapshot pre-knip dirty files (sorted, one per line in temp files).
PRE_TRACKED_FILE=$(mktemp)
PRE_UNTRACKED_FILE=$(mktemp)
git diff --name-only HEAD 2>/dev/null | sort >"$PRE_TRACKED_FILE" || true
git ls-files --others --exclude-standard 2>/dev/null | sort >"$PRE_UNTRACKED_FILE" || true

echo "==> Running: npx knip --config .reports/config/knip.json -W . --fix --allow-remove-files"
# knip exits non-zero when unfixable issues remain (unlisted deps, duplicate exports, etc).
# That's expected — --fix applied all auto-fixable changes; continue regardless.
npx knip --config .reports/config/knip.json -W . --fix --allow-remove-files || true

if [[ ${#TARGET_DIRS[@]} -gt 0 ]]; then
  echo "==> Reverting changes outside '${TARGET_DIRS[*]}'..."

  POST_TRACKED_FILE=$(mktemp)
  POST_UNTRACKED_FILE=$(mktemp)
  git diff --name-only HEAD 2>/dev/null | sort >"$POST_TRACKED_FILE" || true
  git ls-files --others --exclude-standard 2>/dev/null | sort >"$POST_UNTRACKED_FILE" || true

  # Files newly modified/deleted by knip (in POST but not in PRE).
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    if ! in_target_dirs "$file"; then
      echo "  reverting: $file"
      git checkout HEAD -- "$file" 2>/dev/null || true
    fi
  done < <(comm -13 "$PRE_TRACKED_FILE" "$POST_TRACKED_FILE")

  # New untracked files created by knip outside the target (rare but possible).
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    if ! in_target_dirs "$file"; then
      echo "  removing:  $file"
      rm -f "$file"
    fi
  done < <(comm -13 "$PRE_UNTRACKED_FILE" "$POST_UNTRACKED_FILE")

  rm -f "$PRE_TRACKED_FILE" "$PRE_UNTRACKED_FILE" "$POST_TRACKED_FILE" "$POST_UNTRACKED_FILE"
else
  rm -f "$PRE_TRACKED_FILE" "$PRE_UNTRACKED_FILE"
fi

echo "==> Running lint --fix..."
npm run lint || true

echo "==> Running format..."
npm run format

echo "==> Done."
