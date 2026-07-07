# Package diff methodology

This is the core analysis step. The goal: build an exhaustive list of every shape change between `@gusto/embedded-api-v-<OLD>` and `@gusto/embedded-api-v-<NEW>`, classify each as breaking or non-breaking, and grep the SDK for consumers.

## Setup — side-by-side install

Install the old version to a scratch location so you can diff against the new one already in `node_modules/`:

```bash
npm install @gusto/embedded-api-v-<OLD>@^0.0.X --no-save --prefix /tmp/embedded-api-v-<OLD>
```

After this, you have:

- `node_modules/@gusto/embedded-api/esm/` — the new version, resolved through the alias post-codemod (the alias is `npm:@gusto/embedded-api-v-<NEW>`; there is no dated `node_modules/@gusto/embedded-api-v-<NEW>` path)
- `/tmp/embedded-api-v-<OLD>/node_modules/@gusto/embedded-api-v-<OLD>/esm/` — the side-by-side reference

This layout — new via the alias, old in `/tmp` — is what `diff-packages.sh` expects, so run it after the codemod (it asserts the alias resolves to `<NEW>`). If you diff BEFORE the codemod by hand, the alias still points at `<OLD>`, so put the new package in `/tmp` and read the old one from `node_modules/@gusto/embedded-api/esm/` instead.

## Diff each layer

The package has four layers worth diffing. They have different failure modes.

### 1. `models/components/` — entity shape changes

```bash
OLD=/tmp/embedded-api-v-<OLD>/node_modules/@gusto/embedded-api-v-<OLD>/esm/models/components
NEW=node_modules/@gusto/embedded-api/esm/models/components
for f in $(ls $OLD/*.d.ts); do
  fname=$(basename $f)
  [ -f "$NEW/$fname" ] || continue
  diff -q "$f" "$NEW/$fname" > /dev/null 2>&1 || echo "$fname"
done
```

For each changed file, run `diff "$OLD/$f" "$NEW/$f"` and classify:

- **Doc-comment-only diffs** (lines starting with `*` inside JSDoc) → no behavioral change, skip.
- **Field added (`>` with `?:`)** → additive, safe.
- **Field removed (`<` without matching `>`)** → breaking IF the field was required. `grep` src/ for the field name.
- **Field type changed (e.g. `string | null` → `boolean`)** → breaking. Grep for consumers.
- **Enum value removed** (`readonly Foo: "foo"` disappeared) → breaking IF any consumer narrows on the literal. Grep for `'foo'` as a quoted string.
- **Enum value added** → safe.
- **Required → optional** → safe (widening).
- **Optional → required** → breaking (narrowing). Rare in practice.

### 2. `models/operations/` — endpoint contract changes

200+ operation files will change because every operation has an `xGustoAPIVersion` constant whose value bumps each release. **That's noise.** Filter it out.

What's actually breaking:

```bash
# Removed exports (renamed or deleted symbols)
for f in $(ls $OLD/*.d.ts); do
  fname=$(basename $f)
  [ -f "$NEW/$fname" ] || continue
  OLD_E=$(grep -E "^export (type|declare const|interface) [A-Z]" "$f" | awk '{print $3}' | sort -u)
  NEW_E=$(grep -E "^export (type|declare const|interface) [A-Z]" "$NEW/$fname" | awk '{print $3}' | sort -u)
  REMOVED=$(comm -23 <(echo "$OLD_E") <(echo "$NEW_E"))
  [ -n "$REMOVED" ] && echo "$fname removed: $REMOVED"
done
```

Common pattern: a named type like `QueryParamSortBy` collapses to a plain `string`. The import breaks. Fix at the call site by replacing the type with `string`.

```bash
# Removed Request body / Response shape fields
# (compare field declarations line-by-line, excluding ones that just got marked optional)
```

For each removed export, grep src/ AND sdk-app/:

```bash
grep -rn "import.*<RemovedSymbol>.*from '@gusto/embedded-api" src/ sdk-app/
```

If grep returns empty: ✅ no consumer. If it returns hits: 🔴 fix required.

### 3. `models/errors/` — error type changes

Errors layer is almost always additive (new error types added, none removed). A removed error type is breaking, but rare.

```bash
diff <(ls $OLD/errors/ | sort) <(ls $NEW/errors/ | sort)
```

If only `>` (additions): safe.

### 4. `react-query/` — hook signature changes

This is where downstream consumers see the changes most directly. Per-hook diff:

```bash
for f in $(ls $OLD/*.d.ts); do
  fname=$(basename $f)
  [ -f "$NEW/$fname" ] || continue
  REAL=$(diff "$f" "$NEW/$fname" | grep -E "^[<>]" | grep -v "TwoThousandAndTwenty" | grep -v "^[<>] \*")
  [ -n "$REAL" ] && echo "=== $fname ===" && echo "$REAL"
done
```

Patterns to recognize:

- **Removed hook param** (e.g., `sortBy?: QueryParamSortBy` disappears) → breaking IF any call site passes that param. Grep usePayrollsGetSuspense calls etc.
- **Mutation error union widened** (now includes `NotFoundErrorObject | UnprocessableEntityError`) → safe. Consumers handle the union; widening is non-breaking unless code narrows on the specific union, which is rare.
- **Hook renamed/removed** → breaking. Grep import sites.
- **`VersionHeader` import removed** in favor of operation-specific `HeaderXGustoAPIVersion` → safe if SDK doesn't import `VersionHeader` (we don't).
- **Hooks marked deprecated** (the JSDoc adds `@deprecated`) → not breaking but worth flagging in release notes.

## Don't conflate concepts

A breaking change's name may overlap with unrelated SDK code. For example, "migration_blocker" categories in v2026-02-01 live on `partner_managed_companies/migration_readiness` errors[] — totally unrelated to the SDK's payroll `submission_blockers[]` whitelist (which uses `'fast_ach_threshold_exceeded'` and `'needs_earned_access_for_fast_ach'`). Always trace a breaking change to the **actual API operation** before reasoning about consumers.

The diagnostic: find the operation file in `models/operations/` that defines the changed type, look at its endpoint path, then grep for that path in `src/`:

```bash
# Example: which operation has migration_blocker?
grep -rn "MigrationBlocker\|migration_blocker" node_modules/@gusto/embedded-api/esm/models/ | head -5
# → operations/postpartnermanagedcompaniescompanyuuidaccepttermsofservice.ts etc.
# → endpoint: /v1/partner_managed_companies/:uuid/...
# Now grep src/ for that endpoint or the operation name
grep -rn "partnerManagedCompanies\|partner_managed_companies" src/
```

If src/ doesn't reference the endpoint at all, the breaking change has no SDK impact regardless of how scary the diff looks.

## Final output: the matrix

After diffing all four layers, produce a single matrix the PR description will carry:

| Status | Breaking change                | SDK consumer  | Verification      |
| ------ | ------------------------------ | ------------- | ----------------- |
| 🔴     | `<symbol>` removed from `<op>` | `<file:line>` | E2E `<spec name>` |
| ⚠️     | `<symbol>` shape changed       | `<file:line>` | Typecheck + unit  |
| ✅     | `<symbol>` enum removed        | none          | Typecheck CI      |

This matrix is the source of truth for the upgrade. Every row maps to a verification — no row is left as "we'll see what CI says."
