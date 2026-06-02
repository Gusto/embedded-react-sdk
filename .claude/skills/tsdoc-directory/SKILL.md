---
name: tsdoc-directory
description: >-
  Fully document a src/ directory by orchestrating the tsdoc-backfill and
  tsdoc-api-documenter agents. Use when asked to document a directory, expand
  TSDoc coverage, or add a directory to the ESLint allowlist.
argument-hint: '<src-relative path, e.g. src/helpers or src/components/Employee/Dashboard/hooks>'
---

# Document Directory

Orchestrates two agents to fully document a `src/` directory:

1. **`tsdoc-backfill`** — enables strict linting and discovers violations
2. **`tsdoc-api-documenter`** — writes the TSDoc for each symbol

## Argument handling

`$ARGUMENTS` is the target directory. Normalise it: strip leading `./` or trailing `/`. If it doesn't start with `src/`, prepend `src/`.

## Phase 0 — Baseline build and API report

Before doing anything else, run a clean build and derive the current API report:

```bash
npm run build && npm run api-report:derive 2>&1
```

This ensures the API report reflects the current state of the repo before any documentation changes are made. The diff
in Phase 3 will then show only what this run changed.

If the build fails, stop and report the error to the user — do not proceed.

## Phase 1 — Setup and discovery (foreground)

Spawn the `tsdoc-backfill` agent:

- **description**: `"Set up TSDoc linting and discover violations in $TARGET"`
- **prompt**: `"Analyse the directory $TARGET for TSDoc violations. Update eslint.config.ts to enable strict linting for this directory, run ESLint to find all violations, and return the structured violation list."`

Wait for it to complete. Capture the violation list and the eslint.config.ts change it reports.

If it reports zero violations, skip Phase 2, run the final verification below, and return the report.

## Phase 2 — Write documentation (batched, background)

### Batching strategy

Before spawning any agents, group the violations by **immediate parent directory** (the directory containing each file). Files in the same directory share `docs/` and MCP context and should be processed in the same session.

For each directory group:

- **≤5 files**: one batch → one documenter session
- **>5 files**: split into sequential batches of up to 5 files each

Spawn all **first-batch** agents across different directory groups **in parallel** (all `run_in_background: true` at once). Within a single directory group that needs multiple batches, wait for batch N to complete before spawning batch N+1 for that group.

Tell the user: "Phase 1 complete — $N violations found across $M files. Documenting in $K batches across $G directory groups, I'll report back when all are done."

Wait for **all background agents to complete** before proceeding to Phase 3.

### Spawning each batch

For each batch, spawn `tsdoc-api-documenter` with **`run_in_background: true`**:

- **description**: `"Document violations in $DIRECTORY (batch $BATCH_N of $BATCH_TOTAL)"`
- **prompt**:

```

Document the following exported symbols in the embedded-react-sdk repo.
These were discovered by the tsdoc-backfill agent as missing TSDoc in $TARGET.

Violation list:
<paste only the violations for this batch>

Work through each file in order. For each file:

1. Run tsdoc-stub **once** for the whole file using `--all-exports` (or `--symbols` if only a subset needs documenting) to generate all skeletons in a single call. Never call tsdoc-stub once per symbol — each invocation is expensive.
2. Check docs/ for existing prose to adapt before filling in any prose (docs/hooks/ for hooks, docs/integration-guide/ for utilities). For top-level or complex symbols with nothing in docs/, check MCP (Jira, Confluence, Notion) for product context.
3. Fill in prose for all symbols in the file, then write them all to the file (multiple Edit calls in the same turn where possible).
4. After writing all symbols in a file, fix any ESLint errors in a single pass, then run ESLint once to confirm clean before moving to the next file.

For exported **React components**, before writing the events table in `@remarks`:

- Find every `onEvent(companyEvents.*, ...)` call in the component file — including calls inside nested handler functions (e.g. a function like `onXxxFormEvent` that proxies events from a child component's `onEvent`). These bubbled-up events must appear in the table.
- Cross-reference the events table in docs/ to catch any you might have missed.

Return a summary of what was documented and any symbols skipped with reasons.

```

## Phase 3 — Final verification and report (on completion notification)

When the background agent completes, run in sequence:

**Step 1 — ESLint**

```bash
npx eslint '$TARGET' 2>&1
```

**Step 2 — Build and API report**

```bash
npm run build && npm run api-report:derive 2>&1
```

Then diff the report to see what changed:

```bash
git diff .reports/embedded-react-sdk.api.md
```

**Step 3 — Fix forgotten exports**

Scan the diff for `ae-forgotten-export` warnings. For each one:

- Find which barrel file exports the symbol that _references_ the forgotten type (e.g. if `AssignSignatoryProps` is forgotten and `AssignSignatory` is exported from `Company/exports/companyOnboarding.ts`, add `AssignSignatoryProps` there too).
- The type does not need to be re-exported from the top-level `src/index.ts` — the nearest barrel file that already exports the referencing symbol is sufficient.
- Re-run `npm run build && npm run api-report:derive` after making changes to confirm the warning is gone.

**Ignore** `ae-unresolved-link` warnings where the missing symbol comes from `@gusto/embedded-api` — these are known limitations of cross-package `{@link}` references and are not actionable here.

Then relay the combined report to the user:

```
## Documentation run: $TARGET

**eslint.config.ts change:** <from Phase 1>

**Symbols documented:** N across M files

**Files changed:**
- path/to/file.ts — N symbols (symbol1, symbol2, ...)

**API report changes:** <none | list of ae-forgotten-export fixes applied>

**Remaining violations:** <none | list with reason each was skipped>
```
