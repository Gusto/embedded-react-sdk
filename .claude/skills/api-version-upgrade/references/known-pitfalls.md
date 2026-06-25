# Known pitfalls — lessons from prior upgrades

Each upgrade has taught us something. This is the durable list of "things that bit us, don't bite us again."

## v0.13.0 → v2025-11-15 (the original migration)

The first time the SDK moved from the unversioned `@gusto/embedded-api` package to a dated `@gusto/embedded-api-v-<DATE>` package. Reference PR: https://github.com/Gusto/embedded-react-sdk/pull/1814 (kept as fallback, never merged; the migration shipped via per-domain PRs).

**What was breaking (verified against the installed v2025-11-15 package):**

1. `useDataView<T>` needed explicit type-argument at 4 call sites: `RecoveryCasesList`, `PayScheduleList`, `DeductionsList`, `InformationRequestList`. Type-only; verified by typecheck.
2. **Mechanical sweep of ~360 files** to move imports from bare `@gusto/embedded-api` to dated `@gusto/embedded-api-v-2025-11-15`. **This is the dangerous one** — see `codemod-commands.md` for the boundary-anchored sed required when migrating FROM the bare package (a naive global replace corrupts already-dated strings).
3. Cache namespace prefix changes from `['@gusto/embedded-api']` to `['@gusto/embedded-api-v-2025-11-15']` across all hand-written `queryKey` literals.

**Note on historical claims:** earlier versions of this doc claimed `autoPilot` → `autoPayroll` and `PaymentType.Payroll` → lowercase `'payroll'` were breaking changes in this migration. Verifying against the installed v2025-11-15 package: `autoPayroll` is the field name (the rename, if it happened, was earlier or unverifiable from current state); `PaymentType.Payroll` is **still** `"Payroll"` capitalized in both v2025-11-15 and v2026-02-01 (no enum-value change). Treat any historical breaking-change list as a starting point — always re-verify by diffing the installed packages.

**Lessons:**

- **Per-domain PRs are not necessary.** The original migration was sliced into 6 per-domain PRs (Payroll, Employee, Contractor, TimeOff, InformationRequests, plus a Foundation PR). This was driven by uncertainty — we didn't yet know how small the actual breaking surface would be. With hindsight, a single base PR + minimal sub-PRs (only where 🔴 work requires separate review) is the right pattern. **Default to one PR.**
- **The Foundation PR concept.** When 13 cross-cutting files (types, helpers, hooks, shared, partner-hook-utils, Common, Base, factories) all import from the API package, they have to migrate together — a per-domain PR can't split them without breakage. This stays true; the codemod handles them all in one commit, no separate Foundation PR needed.
- **Test/mock files migrate alongside the codemod**, not separately. 30 unit-test MSW mocks in `src/test/mocks/apis/*.ts` are part of the same commit.
- **Boundary-anchored sed is mandatory when migrating from the bare package.** The bare name is a prefix of every dated name. See `codemod-commands.md` § "Migrating FROM the bare/unversioned package".

## v2025-11-15 → v2026-02-01 (the second migration)

Reference PR: https://github.com/Gusto/embedded-react-sdk/pull/2233.

**What was breaking (in the package diff):**

1. `QueryParamSortBy` removed from `putv1...prepare` op → now plain `string`. Real consumer at `usePreparedPayrollData.ts:6`. ✅ Required code fix.
2. `migration_status` shape: `MigrationStatus` enum (`"success"`) → `boolean` on partner-managed `migrate` response. No SDK consumer. ✅ Typecheck verifies.
3. New `migration_blocker` / `migration_warning` categories on `partner_managed_companies/migration_readiness` errors[]. No SDK consumer. ✅ Typecheck verifies.
4. `warnings[]` added to migrate-success response. No SDK consumer. ✅ Typecheck verifies.
5. Payroll version conflict HTTP status 422 → 409. SDK never narrowed on 422. ✅ No-op.
6. Self-onboarding `email` now required at server. SDK's Zod schema already required it client-side. ⚠️ E2E verifies the gate.
7. ToS endpoints require payroll admin; payload simplified. No SDK consumer. ✅ Typecheck verifies.
8. Simple IRA `elective` param now validated. No SDK consumer. ✅.
9. Deprecated `reverse_wire_detail_id` in wait-for-reverse-wire credit blocker. No consumer. ✅.

**Lessons:**

- **`migration_status` is not on Company — it's on the migrate response.** This caused a wasted scaffold (the original `03-migration-status-boolean.spec.ts` was scoped to the Company entity, but `migration_status` lives on `PartnerManagedCompanyMigrateResponse`). Always trace a breaking change to the actual API operation before reasoning about consumers.
- **`migration_blocker` / `migration_warning` are NOT payroll submission_blockers.** They live on `partner_managed_companies/migration_readiness` errors[]. Same word, different endpoint, no shared rendering. Document this explicitly so future-you doesn't conflate them again.
- **Hardcoded `queryKey` literals are everywhere.** 19 sites (13 files) carry `'@gusto/embedded-api-v-2025-11-15'` as a string literal, spread across `createSdkQueryClient.ts` (4 sites), `ApiProvider.tsx` (1 docstring), TimeOff (~5 sites), Company/Locations (1 site), sdk-app contractor-management (~8 sites). A codemod that only updates import paths leaves these on the old namespace and silently breaks query invalidation. The sed regex catches them because they share the version string, but the failure mode is so high-cost that the verification step (`grep -rln "<OLD>"` after sweep) is non-negotiable. **Don't anchor expectations on a specific count** — re-run the count for each upgrade because the site list drifts as code changes.
- **🔴 The bare-date `X-Gusto-API-Version` constant.** This is the most dangerous miss of the upgrade. `src/contexts/ApiProvider/apiVersionHook.ts:3` holds `const CURRENT_API_VERSION = '<OLD>'` as a plain date string — NOT inside a package path. The package-name sed sweep does NOT match it. Skipping this site means the SDK sends the OLD version on every HTTP request despite the bumped types: the server answers with old schemas, typecheck and unit tests pass, partners hit production with the wrong API contract. **This was missed in the v2025-11-15 → v2026-02-01 execution and caught only by the api-version-upgrade skill's iteration-2 eval.** Always flip explicitly per `codemod-commands.md` § "CRITICAL — the bare-date X-Gusto-API-Version sweep" and verify with `grep -rn "'<OLD>'" src/ sdk-app/ e2e/`.
- **Don't author sub-PRs for verify-only items.** The original plan was 4 sub-PRs (one per breaking change). 3 of 4 ended up empty after the E2E specs were consolidated onto the base. The 4th had only a docstring update. Time wasted on PR creation + closure.
- **`getByRole('switch')` hangs on SDK custom controls.** SwitchHookField renders the input as visually-hidden; role-based click hangs on actionability checks. Click the visible label text instead.
- **`git add -A` picks up `.claude/worktrees/` as submodules.** Use `git add -u` for the codemod commit, or stage files explicitly.
- **The pre-commit hook may surface unrelated lint failures** (e.g. markdownlint `MD040` for code fences without language tags in AGENTS.md / src/CLAUDE.md). These are pre-existing violations; fix them in the codemod commit and note as a drive-by.

## v2026-06-15 (anticipated; reimbursement removal)

The pending v2026-06-15 upgrade removes reimbursements from `fixed_compensation_types` (payroll responses) and `fixed_compensations` (company responses); they remain only in the dedicated `reimbursements[]` array.

**The hidden risk — off-cycle payrolls bypass the new shape:**

Off-cycle payrolls in the SDK explicitly route through the legacy `fixed_compensations` lookup, **not** the `compensation.reimbursements[]` array. See `src/components/Payroll/PayrollEditEmployee/PayrollEditEmployeePresentation.tsx` (search for off-cycle / itemized handling). The reason is a server-side flag — `emb_off_cycle_disable_named_reimbursements`, default-on until ~2026-09-01 — that rejects itemized writes on off-cycle payrolls.

This means `getReimbursements()` in `helpers.ts:198-214` (which prefers `compensation.reimbursements[]` and falls back to the named `fixedCompensations` row) is forward-compatible **only for regular payrolls**. If v2026-06-15 also strips the legacy `fixed_compensations`-named "Reimbursement" row from **off-cycle** responses, off-cycle reimbursement displays silently render `$0.00` with no typecheck error. **Add an off-cycle E2E spec for this upgrade.** Typecheck cannot catch it; only a real Demo run against an off-cycle payroll can.

**The fixture-refactor question:**

Earlier analysis of `helpers.test.ts` claimed ~28 test sites using `{ name: 'Reimbursement', amount: ... }` fixtures inside `fixedCompensations` would all need rewriting. **Re-verify before treating as mandatory work.** The Eval 3 analysis found that most of those sites test helper behavior (filter / exclusion / fallback) rather than wire shape — they assert valid contracts regardless of whether real responses still carry the legacy entry. Treat the refactor as ⚠️ optional cleanup unless inspection shows the test bodies actually depend on the wire-shape detail being present.

## Trust the error pipeline

**The most important conceptual rule.** Many "breaking changes" in API changelogs are forms of **server-side validation tightening** — a field that was always supported is now validated more strictly, a conditional rule (e.g. "X required if Y is true") is now enforced at the server, an obscure combination of inputs now returns a 422 where it previously sailed through.

**These are not breaking changes for the SDK.** The SDK has a complete error-display pipeline that handles them automatically:

1. Server returns `422` with `{ errors: [{ errorKey: "<field>", category: "invalid_attribute_value", message: "<reason>" }] }`
2. `normalizeToSDKError` in `src/types/sdkError.ts:247` shapes the response into `SDKError.fieldErrors[]`
3. Form hooks expose `errorHandling.error` containing those field errors
4. UI renders the field-level message next to the input (e.g. `validationErrorCollector` machinery)

**The UX is identical** to a client-side gate. The only difference: one extra HTTP round-trip. This is exactly the pattern the SDK uses for pay-schedule date constraints, frequency rules, payroll-version conflicts, federal-tax narrowing, garnishment cap validation, and dozens of other fields the SDK doesn't try to encode client-side. We let the server validate and surface the error.

**Concrete examples that look scary in changelogs but are ✅ for the SDK:**

- "Field X now required if Y=true" — server returns 422 with `errorKey: "x"`, message renders.
- "Endpoint Z now rejects format A; only accepts format B" — server returns 422 with the right errorKey.
- "Validation rule N is now enforced for status=Q" — same.

**The only time server-side validation tightening becomes a real concern:**

- The **error key** the server returns doesn't match a field name the form was binding (causing the message to render in a generic banner instead of inline). Verify this against actual demo response for any new validation rule.
- The SDK has its own **custom Zod refinement** that pre-validates the same thing client-side, and the refinement disagrees with the new server rule. Then it's a 🔴 — fix the custom refinement so the two stay in sync.
- The new validation **silently strips data** instead of returning a 422 (e.g., server accepts the request but stores something different). Truly rare; would need to be flagged in the changelog.

If you find yourself proposing an E2E that asserts "the error renders" or "the form doesn't advance" for a validation rule that didn't exist before, **stop**. You're testing the SDK's error pipeline, not the upgrade. The upgrade just changed which validation rules the server enforces.

## General durable pitfalls

These apply to every upgrade:

- **Don't trust scope memory across upgrades.** Counts of consumers (296 files, 17 cache-key sites, etc.) change each release. Re-run the diff and re-count for every upgrade.
- **Don't skip the empirical grep.** A breaking change "looks unconsumed" is not the same as "grep confirmed unconsumed." Always run the grep and paste the result into the matrix.
- **Don't write E2E specs that can't run.** A `test.skip` placeholder is dead weight that hides a coverage gap. If a spec needs a new scenario, file a ticket and skip — but include the ticket number in the skip reason.
- **Don't conflate naming.** Same word can mean different things on different endpoints. Trace the change to the operation, then to the endpoint URL, then to consumers.
- **Typecheck CI is the strongest verification of the type contract.** Many "breaking changes" in changelogs are reshape additions that the regenerated Zod schemas accept transparently. Don't write E2Es to verify something the typecheck already proves.
- **The cache-namespace sweep is non-negotiable.** Even if the diff shows zero shape changes, the cache namespace MUST flip. A missed flip causes silent stale-data bugs that take hours to diagnose post-merge.
- **Default to a single base PR.** Sub-PRs are justified only when ≥2 distinct 🔴 items each warrant separate review focus. Empty sub-PRs are negative-value.
