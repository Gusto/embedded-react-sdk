---
name: api-version-upgrade
description: >-
  Upgrade the embedded-react-sdk to a new dated `@gusto/embedded-api-v-<YYYY-MM-DD>`
  package end-to-end. Use this skill whenever the user says "upgrade the API",
  "bump to v2026-XX-XX", "do the v<date> upgrade", "migrate to the next API
  version", references a dated API version (e.g. v2026-06-15, v2026-02-01),
  asks to swap `@gusto/embedded-api-v-*` packages, or mentions a SDK-998/SDK-1000
  family Jira ticket. The skill runs the full playbook autonomously:
  side-by-side package diff to enumerate every breaking change, codemod across
  all import paths + cache-key string literals, type-level verification, E2E
  scaffolding for any breaking change with a real SDK consumer, and a draft
  base PR with the breaking-change matrix in the description.
---

# API Version Upgrade

Take the SDK from `@gusto/embedded-api-v-<OLD>` to `@gusto/embedded-api-v-<NEW>` end-to-end, in one autonomous pass.

The Gusto Embedded API releases dated major versions (e.g. `2025-11-15`, `2026-02-01`, `2026-06-15`). Each version is published as its own npm package — the SDK pins to exactly one at a time. Upgrading is a structured workflow with predictable risks; this skill exists to make it boring.

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

The cache-namespace string literal `'@gusto/embedded-api-v-<OLD>'` is a special case — it's both an import path AND a hand-written `queryKey` literal in several screens. Catch all of them with a separate sweep. See `references/codemod-commands.md`.

**Critical lesson — don't conflate concepts.** Two changes can use the same word ("blocker", "migration") on different endpoints. For instance: payroll `submission_blockers[]` and `partner_managed_companies/migration_readiness` errors[] are unrelated despite both rendering as "blockers". Verify each change against the actual API operation it lives on.

### Phase 3: Codemod (base branch)

Create branch `upgrade/api-<NEW>-base`. Apply the mechanical swap:

1. **Import path sweep** — `find src sdk-app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s|@gusto/embedded-api-v-<OLD>|@gusto/embedded-api-v-<NEW>|g" {} +`. **When migrating FROM the bare/unversioned `@gusto/embedded-api` package, use the boundary-anchored regex from `references/codemod-commands.md` instead — a naive global replace corrupts already-dated strings.**
2. **Cache-key string literal sweep** — the same regex catches `queryKey: ['@gusto/embedded-api-v-<OLD>', ...]` literals because they share the version string. **This catches more sites than just `createSdkQueryClient.ts`** — at minimum: `src/contexts/ApiProvider/`, `src/components/TimeOff/`, `src/components/Company/Locations/`, `sdk-app/src/design/prototypes/contractor-management/`. Verify with `grep -rn "<OLD>" src sdk-app`.
3. **🔴 CRITICAL — bare-date `X-Gusto-API-Version` sweep.** `src/contexts/ApiProvider/apiVersionHook.ts:3` carries `const CURRENT_API_VERSION = '<OLD>'` as a **bare date string** (NOT a package path). The package-name sed does NOT catch this. If skipped, the upgrade is a **runtime no-op** — types claim the new version, but the SDK sends the old version on every request. See `references/codemod-commands.md` § "CRITICAL — the bare-date `X-Gusto-API-Version` sweep" for the mandatory sites and verification grep.
4. **Docs + instruction files** — explicitly sed `AGENTS.md`, `CLAUDE.md`, `src/CLAUDE.md`, `docs/hooks/`, `docs/api/`, `docs/reference/`, `build/deriveEndpointInventory.ts`, `e2e/utils/validationErrorCollector.test.ts`. Do NOT touch `CHANGELOG.md` (historical) or `.reports/*` (auto-generated).
5. **`package.json`** — edit the `@gusto/embedded-api-v-<OLD>` dep entry to `@gusto/embedded-api-v-<NEW>` with `^0.0.1` (use the actual lowest published version).
6. **`npm install`** — regenerates `package-lock.json`.

### Phase 4: Type-level verification

Run `npx tsc --noEmit`. This is the empirical proof that the package's type contract is satisfied. Each error here is a real consumer affected by the upgrade. Fix in place if mechanical (e.g., a removed type that's now `string`), or stop and report if the fix requires a design decision.

**Always-do:** if a removed import resolves to a removed-export from the new package, fix the import. Common patterns: `QueryParamSortBy` → `string`; renamed enums; types collapsed to `{}`.

If pre-commit hooks fail on markdownlint (`MD040/fenced-code-language`) for unrelated files touched by the version-string sweep, add a language tag (`text`, `bash`) to fix — these are pre-existing violations surfaced by the touch, not regressions.

### Phase 5: E2E scaffolding for real consumers

For **every** 🔴 / ⚠️ row in the matrix, write an E2E spec that exercises the relevant flow against Demo. These specs land on the BASE branch so the upgrade PR's CI shows the verification trail directly.

**Each spec must actually run, not `test.skip` unless explicitly blocked by missing Demo state.** The E2E suite is the canary for breaking changes that the typecheck cannot catch. A passing spec proves we're fine; a failing spec is real signal.

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
- **Consumer found and shape narrowed or renamed → 🔴 real fix required.** Apply the fix in the codemod commit if mechanical; otherwise stop and report for design input.
- **Removed enum value with no `=== '<removed>'` narrowing in src → ✅.** The enum widening is a no-op.
- **Cache-namespace string sweep is non-negotiable** regardless of how few hits — silent stale-data bugs are the highest-cost failure mode of any upgrade.
- **All PRs open as draft** until the user merges.

## When to break out of full-auto

Stop and report (do not blindly continue) when:

- `npm view <new-package>` shows the package doesn't exist on npm yet (publication slipped).
- `tsc --noEmit` reveals a type error that needs a design decision (e.g., a field was removed from a request body the SDK genuinely needs to send — requires changing the call site's semantics, not just renaming).
- A breaking change touches partner-facing public types (exported from the SDK's own `index.ts`). Those need release-notes coordination beyond the PR body.
- The CI run on the base PR shows real E2E failures that aren't selector brittleness (i.e., the SDK actually regressed). Report which spec, which assertion, and what the failing path implies.

## References

- `references/diff-methodology.md` — exact bash commands for the package diff + how to read the output
- `references/codemod-commands.md` — sed commands, file globs, cache-key sweep specifics
- `references/e2e-patterns.md` — E2E spec patterns, selectors that work, lessons from prior brittleness
- `references/pr-template.md` — PR description template (breaking-change matrix included)
- `references/known-pitfalls.md` — concrete lessons from each prior upgrade

Historical reference PRs:

- v0.13.0 → v2025-11-15: https://github.com/Gusto/embedded-react-sdk/pull/1814 (the original migration; never merged, kept as fallback)
- v2025-11-15 → v2026-02-01: https://github.com/Gusto/embedded-react-sdk/pull/2233
