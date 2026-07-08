# Base PR description template

The base PR's description is where the breaking-change matrix lives. Reviewers should be able to scan it and immediately understand: what changed in the API, what affects us, what's verified, and what's not.

## Template

```markdown
## Summary

Base PR for the v<OLD> → v<NEW> API upgrade. Tracks Jira **[SDK-XXXX](https://gustohq.atlassian.net/browse/SDK-XXXX)**.

Every breaking change in v<NEW> is either:

- handled by existing client-side defenses (Zod schemas, typecheck) — verified by E2E or by the typecheck CI step
- on an endpoint with no SDK consumer — typecheck is the contract

## Breaking changes & how this PR verifies them

> **Legend:** 🔴 = SDK code change required · ⚠️ = verify-only / test fixture update · ✅ = no impact

| Status | Change                       | Where verified                                          |
| ------ | ---------------------------- | ------------------------------------------------------- |
| 🔴     | `<symbol> removed from <op>` | `e2e/tests/<domain>/<spec>.spec.ts` — <what it asserts> |
| ⚠️     | `<symbol> shape changed`     | Typecheck CI + `e2e/tests/<domain>/<spec>.spec.ts`      |
| ✅     | `<symbol> enum removed`      | Typecheck CI — no consumer in `src/`                    |
| ✅     | `<endpoint> not consumed`    | Typecheck CI                                            |

## What's in this PR

- `src/contexts/ApiProvider/apiVersion.ts`: `API_VERSION` → v<NEW> (drives the `X-Gusto-API-Version` header and `API_QUERY_NAMESPACE`).
- `package.json` + `package-lock.json`: update the `@gusto/embedded-api` alias (and direct dated dep) to v<NEW>.
- `src/models/external.ts`: regenerated via `npm run models:derive`.
- Bare-date test assertions updated (`apiVersionHook.test.ts`, `ApiProvider.test.tsx`) + pinned-version prose in `CLAUDE.md` / `AGENTS.md`.
- [list any real type fixes — e.g., `usePreparedPayrollData.ts`: removed `QueryParamSortBy` import (no longer exported)].
- Drive-by: [list any pre-existing lint fixes surfaced by the touch].
- N new E2E specs that exercise the breaking-change consumer paths against Demo.

_No import-path or cache-key sweep: imports route through the `@gusto/embedded-api` alias (enforced by the `sdk-conventions/use-embedded-api-alias` lint rule) and cache keys derive from `API_QUERY_NAMESPACE`._

## Deprecations to flag to partners

[Only if applicable]

- `<hookName>` — deprecated in favor of `<replacement>`. Not used by SDK; flag in release notes for partner integrations.

## Test plan

- [ ] All CI green (unit + e2e + typecheck + lint + build)
- [ ] `<spec name>` green against Demo
- [ ] `API_VERSION` in `apiVersion.ts` matches the `@gusto/embedded-api` alias target in `package.json`
- [ ] No stray dated import specifiers in source (grep + `sdk-conventions/use-embedded-api-alias` lint clean)
- [ ] No bare-date `<OLD>` left in runtime code or header test assertions (Storybook date fixtures excepted)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Notes on writing the matrix

**Be specific about consumers.** "Foo removed → no consumer" should always include the grep that produced that conclusion. The matrix is the audit trail; future engineers reading the PR should be able to reproduce the check.

**Don't list non-breaking additive changes** (new optional fields, new operations, new error types). They're not material to whether the upgrade is safe.

**Doc-only changes are not breaking.** A JSDoc comment update or a renamed `xGustoAPIVersion` constant is noise, not a change worth a matrix row.

**Pair every 🔴 with an E2E spec.** No 🔴 row should be verified only by typecheck — by definition a real consumer exists, so a real test must exercise the new behavior.

**Default to ✅ when no consumer is found.** Don't speculate about "what if a hidden consumer exists" — the empirical grep is the truth. If you're worried about coverage, add the E2E to confirm; don't downgrade the matrix to ⚠️ as hedge.

## Commit messages

The commit message format mirrors the matrix:

```text
feat!: bump @gusto/embedded-api to v<NEW>

Update the @gusto/embedded-api alias + API_VERSION source of truth to
v<NEW>; regenerate derived models and the lockfile. Imports route through
the alias, so there is no per-file sweep.

Type fixups required for the bump to compile:
- <file:line>: <what changed and how it was fixed>

[Optional] Drive-by: fixed pre-existing <lint rule> violations in
<files> surfaced by the touch.

See base PR description for the full breaking-change matrix and
verification trail.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Use `feat!:` to signal a breaking API version bump. Under 0.x.x semver, `feat!:` triggers a MINOR bump.

E2E specs added to the base get their own commit (separate from the codemod), so reviewers can scan them in isolation:

```text
test: scaffold E2E coverage for v<NEW> breaking changes

Adds E2E specs covering each ⚠️/🔴 breaking change in the upgrade. They
live on the base branch so the upgrade PR's CI shows the verification
trail directly.

Specs added:
- e2e/tests/<domain>/<spec>.spec.ts (<status> SDK-XXXX)
- ...

Each spec carries a JSDoc explaining what real regression a failure
points to.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```
