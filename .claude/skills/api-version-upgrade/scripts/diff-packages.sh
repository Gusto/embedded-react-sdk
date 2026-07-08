#!/usr/bin/env bash
# Diff the old vs new API package and emit a structured summary of breaking changes.
# Usage: diff-packages.sh <old-version> <new-version>
# Example: diff-packages.sh 2025-11-15 2026-02-01

set -euo pipefail

OLD="${1:?usage: diff-packages.sh <old-version> <new-version>}"
NEW="${2:?usage: diff-packages.sh <old-version> <new-version>}"

# The old package is installed under its dated name in a scratch dir (see
# install-old-package.sh). The new package resolves through the version-agnostic
# alias — `@gusto/embedded-api` is `npm:@gusto/embedded-api-v-${NEW}`, so after the
# package.json swap + `npm install` its esm output lives at the alias path, not a
# dated one.
OLD_DIR="/tmp/embedded-api-v-${OLD}/node_modules/@gusto/embedded-api-v-${OLD}/esm"
NEW_DIR="node_modules/@gusto/embedded-api/esm"

if [ ! -d "${OLD_DIR}" ]; then
  echo "ERROR: ${OLD_DIR} not found. Run install-old-package.sh ${OLD} first." >&2
  exit 1
fi
if [ ! -d "${NEW_DIR}" ]; then
  echo "ERROR: ${NEW_DIR} not found. Run \`npm install\` after the package.json alias swap." >&2
  exit 1
fi

# The alias always resolves to *something* (it's the only way source imports the
# package), so a bare directory check can't tell whether it points at <NEW> yet.
# Assert the resolved package name to fail loudly if the diff runs before the alias
# has been repointed — otherwise we'd silently diff <OLD> against itself.
RESOLVED_NEW=$(node -p "require('./node_modules/@gusto/embedded-api/package.json').name" 2>/dev/null || true)
if [ "${RESOLVED_NEW}" != "@gusto/embedded-api-v-${NEW}" ]; then
  echo "ERROR: alias resolves to '${RESOLVED_NEW:-<unresolved>}', expected '@gusto/embedded-api-v-${NEW}'." >&2
  echo "Bump the @gusto/embedded-api alias target to v-${NEW} and re-run \`npm install\` before diffing." >&2
  exit 1
fi

echo "================================================================"
echo "Diff: @gusto/embedded-api-v-${OLD} → @gusto/embedded-api-v-${NEW}"
echo "================================================================"

echo ""
echo "=== Components: files removed ==="
diff <(ls "${OLD_DIR}/models/components/" | sort) <(ls "${NEW_DIR}/models/components/" | sort) | grep "^<" || echo "(none)"

echo ""
echo "=== Components: files added ==="
diff <(ls "${OLD_DIR}/models/components/" | sort) <(ls "${NEW_DIR}/models/components/" | sort) | grep "^>" || echo "(none)"

echo ""
echo "=== Components: files with differences (need per-file inspection) ==="
for f in $(ls "${OLD_DIR}/models/components/"*.d.ts 2>/dev/null); do
  fname=$(basename "$f")
  [ -f "${NEW_DIR}/models/components/${fname}" ] || continue
  diff -q "$f" "${NEW_DIR}/models/components/${fname}" > /dev/null 2>&1 || echo "  ${fname}"
done

echo ""
echo "=== Operations: removed exports (real breakages) ==="
for f in $(ls "${OLD_DIR}/models/operations/"*.d.ts 2>/dev/null); do
  fname=$(basename "$f")
  [ -f "${NEW_DIR}/models/operations/${fname}" ] || continue
  OLD_E=$(grep -E "^export (type|declare const|interface) [A-Z]" "$f" | awk '{print $3}' | sort -u)
  NEW_E=$(grep -E "^export (type|declare const|interface) [A-Z]" "${NEW_DIR}/models/operations/${fname}" | awk '{print $3}' | sort -u)
  REMOVED=$(comm -23 <(echo "$OLD_E") <(echo "$NEW_E"))
  if [ -n "$REMOVED" ]; then
    echo "  ${fname}:"
    echo "$REMOVED" | sed 's/^/    removed: /'
  fi
done

echo ""
echo "=== Errors: files added (informational) ==="
diff <(ls "${OLD_DIR}/models/errors/" | sort) <(ls "${NEW_DIR}/models/errors/" | sort) | grep "^>" || echo "(none)"

echo ""
echo "=== Errors: files removed (BREAKING if any) ==="
diff <(ls "${OLD_DIR}/models/errors/" | sort) <(ls "${NEW_DIR}/models/errors/" | sort) | grep "^<" || echo "(none — safe)"

echo ""
echo "=== React-query: hook files with non-version-header diff ==="
count=0
for f in $(ls "${OLD_DIR}/react-query/"*.d.ts 2>/dev/null); do
  fname=$(basename "$f")
  [ -f "${NEW_DIR}/react-query/${fname}" ] || continue
  REAL=$(diff "$f" "${NEW_DIR}/react-query/${fname}" 2>&1 | grep -E "^[<>]" | grep -v "TwoThousandAndTwenty" | grep -v "^[<>] \*" | head -1)
  if [ -n "$REAL" ]; then
    count=$((count + 1))
    echo "  ${fname}"
  fi
done
echo "Total: ${count} hooks with non-version-header changes"

echo ""
echo "================================================================"
echo "Next steps:"
echo "  1. For each component file with differences, run:"
echo "     diff ${OLD_DIR}/models/components/<file> ${NEW_DIR}/models/components/<file>"
echo "  2. For each removed export, grep src/ sdk-app/ for consumers."
echo "  3. Build the breaking-change matrix (🔴 / ⚠️ / ✅)."
echo "================================================================"
