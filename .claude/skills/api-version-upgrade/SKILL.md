---
name: api-version-upgrade
description: >-
  Upgrade the embedded-react-sdk to a new dated `@gusto/embedded-api-v-<YYYY-MM-DD>`
  package end-to-end. Use this skill whenever the user says "upgrade the API",
  "bump to v2026-XX-XX", "do the v<date> upgrade", "migrate to the next API
  version", references a dated API version (e.g. v2026-06-15, v2026-02-01),
  asks to swap `@gusto/embedded-api-v-*` packages, or mentions a SDK-998/SDK-1000
  family Jira ticket. The skill runs the full playbook autonomously:
  side-by-side package diff to enumerate every breaking change, a minimal
  version bump, type-level verification, E2E scaffolding for any
  breaking change with a real SDK consumer, and a draft base PR with the
  breaking-change matrix in the description.
---

# API Version Upgrade

Take the SDK from `@gusto/embedded-api-v-<OLD>` to `@gusto/embedded-api-v-<NEW>` end-to-end, in one autonomous pass.

The Gusto Embedded API releases dated major versions (e.g. `2025-11-15`, `2026-02-01`, `2026-06-15`). Each version is published as its own npm package — the SDK pins to exactly one at a time. Upgrading is a structured workflow with predictable risks; this skill exists to make it boring.

**Since SDK-1086, the bump itself is nearly mechanical-free.** Every SDK import routes through the version-agnostic `@gusto/embedded-api` alias (enforced by the `sdk-conventions/use-embedded-api-alias` lint rule), and `src/contexts/ApiProvider/apiVersion.ts` is the single source of truth: `API_VERSION` drives both the `X-Gusto-API-Version` header and `API_QUERY_NAMESPACE` (the TanStack key prefix, which resolves to the real dated package name the library bakes into every query key). Bumping the version = update the alias in `package.json` + set `API_VERSION`. There is **no import-path sweep** and **no scattered cache-key literals** to chase. The real work is the breaking-change analysis (Phase 2) and its verification (Phases 4–5).

## Inputs

The skill expects the user to name:

- **`<OLD>`** — current dated version, e.g. `2025-11-15` (read from `package.json` if not given)
- **`<NEW>`** — target dated version, e.g. `2026-02-01`

Optional:

- **`--dry-run`** — run all analysis + generate diffs + propose PR contents, but do NOT push branches or open PRs. Use for previewing or for skill self-tests.

## The autonomous workflow (six phases)

Each phase **must** self-verify before proceeding. If verification fails, stop and report — do not blindly continue. The Notion plan and PR description carry the breaking-change matrix; do not create separate Notion docs.

### Phase 1: Pre-flight

1. Confirm `package.json` shows the old version. Read its current value if `<OLD>` wasn't named.
2. `git status --short` — abort if working tree is dirty (excluding `.claude/worktrees/`).
3. Note the current branch (`git branch --show-current`) so you can return to it on error.
4. `npm view @gusto/embedded-api-v-<NEW> versions --json` — abort if the new package doesn't exist on npm.
5. `git checkout main && git pull --ff-only`.

### Phase 2: Comprehensive package diff

Install the old package side-by-side at `/tmp/embedded-api-v-<OLD>/` and produce a complete breaking-change matrix. This is the heart of the skill — every later decision depends on this analysis being thorough.

See `references/diff-methodology.md` for the exact commands. The short version:

- `models/components/` diff → behavioral changes vs doc-only changes
- `models/operations/` diff → removed exports + removed request/response fields (ignore the version-header constant rename, which appears in nearly every file and is noise)
- `models/errors/` diff → additions only is safe; removals are breaking
- `react-query/` diff → hook signature changes (look for removed params, widened mutation error unions are fine)

For **every** removed export, removed field, and removed enum value found in the diff, run `grep -rn "<symbol>" src/ sdk-app/` to determine if the SDK has a consumer. Build a matrix:

| Status | Where in diff           | SDK consumer?           | Verification path           |
| ------ | ----------------------- | ----------------------- | --------------------------- |
| 🔴     | `Foo` removed from op X | Yes (file:line)         | Real E2E test required      |
| ⚠️     | Field shape changed     | Yes (file:line)         | E2E or unit test, depending |
| ✅     | Bar removed from comp Y | No (grep returns empty) | Typecheck CI is sufficient  |

The cache-namespace string is no longer scattered: hand-written `queryKey` literals read `API_QUERY_NAMESPACE` from `apiVersion.ts`, which derives from `API_VERSION`. There is nothing to sweep — the diff only needs to surface _behavioral_ changes. (As a safety check, confirm no stray dated string literals crept back into source; see `references/codemod-commands.md`.)

**Critical lesson — don't conflate concepts.** Two changes can use the same word ("blocker", "migration") on different endpoints. For instance: payroll `submission_blockers[]` and `partner_managed_companies/migration_readiness` errors[] are unrelated despite both rendering as "blockers". Verify each change against the actual API operation it lives on.

### Phase 3: Version bump (base branch)

Create branch `upgrade/api-<NEW>-base`. Since SDK-1086 this is a handful of edits, **not** a ~360-file sweep. See `references/codemod-commands.md` for exact commands and verification greps.

1. **Source of truth** — edit `src/contexts/ApiProvider/apiVersion.ts`: set `API_VERSION = '<NEW>'`. This one line drives the `X-Gusto-API-Version` header **and** `API_QUERY_NAMESPACE`, so the request header and every hand-written `queryKey` move together.
2. **`package.json` alias** — update the `@gusto/embedded-api` alias target to `npm:@gusto/embedded-api-v-<NEW>@^<ver>`, and keep the direct `@gusto/embedded-api-v-<NEW>` dep entry in sync (look up the real lowest published version with `npm view`). Use `Edit`, not sed (JSON comma rules).
3. **`npm install`** — installs the new package under the alias and regenerates `package-lock.json`.
4. **Regenerate derived models** — `npm run models:derive` rewrites `src/models/external.ts` against the new package. Never hand-edit that file.
5. **Test assertions + doc dates** — a few tests hardcode the version as a **bare date** (`apiVersionHook.test.ts`, `ApiProvider.test.tsx` assert the `X-Gusto-API-Version` value), and `CLAUDE.md` / `AGENTS.md` name the pinned version in prose. Update those explicitly.

**No import-path sweep, no cache-key sweep.** Imports use the `@gusto/embedded-api` alias (the `sdk-conventions/use-embedded-api-alias` lint rule keeps them there); hand-written cache keys read `API_QUERY_NAMESPACE` (the `sdk-conventions/no-literal-api-query-namespace` lint rule bans stray dated literals). If `tsc` or lint surfaces a dated import specifier or namespace literal, that's a stray to fix at the source — not a sweep to run.

**Do NOT touch** `CHANGELOG.md` (historical) or `.reports/*` (auto-generated; regenerates via `npm run derive`).

### Phase 4: Type-level verification

Run `npx tsc --noEmit`. This is the empirical proof that the package's type contract is satisfied. Each error here is a real consumer affected by the upgrade. Fix in place if mechanical (e.g., a removed type that's now `string`), or stop and report if the fix requires a design decision.

**Always-do:** if a removed import resolves to a removed-export from the new package, fix the import. Common patterns: `QueryParamSortBy` → `string`; renamed enums; types collapsed to `{}`.

If pre-commit hooks fail on markdownlint (`MD040/fenced-code-language`) for unrelated files touched by the version-string sweep, add a language tag (`text`, `bash`) to fix — these are pre-existing violations surfaced by the touch, not regressions.

### Phase 5: E2E scaffolding for real consumers

For **every** 🔴 / ⚠️ row in the matrix, write an E2E spec that exercises the relevant flow against Demo. These specs land on the BASE branch so the upgrade PR's CI shows the verification trail directly.

**Each spec must actually run, not `test.skip` unless explicitly blocked by missing Demo state.** The E2E suite is the canary for breaking changes that the typecheck cannot catch. A passing spec proves we're fine; a failing spec is real signal.

**Don't write E2Es to verify the error pipeline.** If the only thing the upgrade changed is _server-side validation tightening_ — a field that already existed is now stricter, or a conditional requirement is now enforced at the API — that flows through the SDK's existing error rendering path unchanged. The server returns 422 with field errors, `normalizeToSDKError` shapes them, the form hook surfaces them, the UI renders them. The UX is identical to a client-side gate. Adding an E2E for this case is testing the SDK's own error pipeline, not the upgrade. See the "Server-side validation tightening" decision rule below.

See `references/e2e-patterns.md` for proven patterns and brittleness avoidance (chiefly: prefer label-text clicks over `getByRole('switch')` for SDK custom controls — the underlying input is visually-hidden and role-based click can hang on actionability checks).

Specs should be **minimal** — assert only the contract under test. Filling out an entire form to test one Zod gate introduces brittleness from unrelated controls (date pickers, comboboxes). The Zod gate fires on submit regardless of other field state; you only need to assert the form did not advance.

### Phase 6: Commit, push, draft PR

1. `git add -u` (do NOT use `git add -A` — it picks up `.claude/worktrees/`).
2. Commit with `feat!: bump @gusto/embedded-api to v<NEW>`. If the pre-commit hook reverts and reports a real lint failure, fix and re-commit (never `--no-verify`).
3. `git push -u origin upgrade/api-<NEW>-base`.
4. `gh pr create --draft` with the breaking-change matrix in the body (see `references/pr-template.md`).
5. Skip sub-PRs unless the matrix surfaced ≥2 distinct 🔴 items that warrant separate review focus. With one or zero 🔴 items, everything lives on the base PR.
6. Report the PR URL.

**Stacking sub-PRs is rarely justified.** Our experience across three upgrades is that breaking changes either (a) have no SDK consumer (typecheck verifies) or (b) need a small E2E scaffold (which lives on the base). The historical pattern of opening 4-5 sub-PRs and then closing 3-4 because they ended up empty is a waste of review attention. Default to a single base PR.

## Decision rules (encoded)

These are the rules the skill follows without asking:

- **No consumer → typecheck verifies, no E2E needed.** Record in the matrix as ✅. Do not write a placeholder E2E.
- **Consumer found but field is wider/optional now → ⚠️ verify-only.** Typecheck verifies the consumer still compiles; E2E optional.
- **Consumer found and shape narrowed or renamed → 🔴 real fix required.** Apply the fix in the version-bump commit if mechanical; otherwise stop and report for design input.
- **Removed enum value with no `=== '<removed>'` narrowing in src → ✅.** The enum widening is a no-op.
- **Server-side validation tightening (field exists in both versions, just stricter now) → ✅ trust the error pipeline.** The SDK's `normalizeToSDKError` (`src/types/sdkError.ts`) converts server 422 responses into `SDKError.fieldErrors[]`; form hooks expose them via `errorHandling.error`; the UI renders the field-level message next to the input. UX is identical to a client-side gate — just one extra HTTP round-trip. This is the same pattern as pay-schedule date constraints, frequency rules, etc. Don't write an E2E to verify the error pipeline works; that's not what the upgrade is changing. See `references/known-pitfalls.md` § "Trust the error pipeline" for the full reasoning.
- **`API_VERSION` must equal the alias's dated target.** The one invariant: `apiVersion.ts`'s `API_VERSION`, the `@gusto/embedded-api` alias target in `package.json`, and therefore `API_QUERY_NAMESPACE` must all name the same date. A mismatch is the highest-cost failure mode — the SDK would send one version's header while keying caches under another, causing silent stale-data bugs. Verify with the greps in `references/codemod-commands.md`.
- **All PRs open as draft** until the user merges.

## When to break out of full-auto

Stop and report (do not blindly continue) when:

- `npm view <new-package>` shows the package doesn't exist on npm yet (publication slipped).
- `tsc --noEmit` reveals a type error that needs a design decision (e.g., a field was removed from a request body the SDK genuinely needs to send — requires changing the call site's semantics, not just renaming).
- A breaking change touches partner-facing public types (exported from the SDK's own `index.ts`). Those need release-notes coordination beyond the PR body.
- The CI run on the base PR shows real E2E failures that aren't selector brittleness (i.e., the SDK actually regressed). Report which spec, which assertion, and what the failing path implies.

## References

- `references/diff-methodology.md` — exact bash commands for the package diff + how to read the output
- `references/codemod-commands.md` — the exact version-bump edits (`apiVersion.ts`, `package.json` alias, derived models, test/doc dates) + verification greps
- `references/e2e-patterns.md` — E2E spec patterns, selectors that work, lessons from prior brittleness
- `references/pr-template.md` — PR description template (breaking-change matrix included)
- `references/known-pitfalls.md` — concrete lessons from each prior upgrade

Historical reference PRs:

- v0.13.0 → v2025-11-15: https://github.com/Gusto/embedded-react-sdk/pull/1814 (the original migration; never merged, kept as fallback)
- v2025-11-15 → v2026-02-01: https://github.com/Gusto/embedded-react-sdk/pull/2233
