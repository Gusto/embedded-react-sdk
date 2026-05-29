---
name: document-directory
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

## Phase 1 — Setup and discovery

Spawn the `tsdoc-backfill` agent:

- **description**: `"Set up TSDoc linting and discover violations in $TARGET"`
- **prompt**: `"Analyse the directory $TARGET for TSDoc violations. Update eslint.config.ts to enable strict linting for this directory, run ESLint to find all violations, and return the structured violation list."`

Wait for it to complete and capture the violation list and the eslint.config.ts change it reports.

If the backfill agent reports zero violations, skip Phase 2 and go straight to the final report.

## Phase 2 — Write documentation

Spawn the `tsdoc-api-documenter` agent with the full violation list:

- **description**: `"Document violations in $TARGET"`
- **prompt**:

```
Document the following exported symbols in the embedded-react-sdk repo.
These were discovered by the tsdoc-backfill agent as missing TSDoc in $TARGET.

Violation list:
<paste the full violation list from Phase 1>

Work through each file in order. For each symbol:
- Check docs/ for existing prose to adapt (docs/hooks/ for hooks, docs/integration-guide/ for utilities)
- If docs/ has nothing and this is a top-level or complex symbol, check MCP (Jira, Confluence, Notion) for product context
- Use the write-tsdoc skill to generate the skeleton and fill in prose
- Run ESLint on the file after completing it; fix any errors before moving on

Return a summary of what was documented and any symbols skipped with reasons.
```

## Phase 3 — Final verification

After the api-documenter agent completes, run:

```bash
npx eslint '$TARGET' 2>&1
```

## Report

Return a combined report:

```
## Documentation run: $TARGET

**eslint.config.ts change:** <from Phase 1>

**Symbols documented:** N across M files

**Files changed:**
- path/to/file.ts — N symbols (symbol1, symbol2, ...)

**Remaining violations:** <none | list with reason each was skipped>
```
