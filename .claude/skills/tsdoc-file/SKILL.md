---
name: tsdoc-file
description: >-
  Write a valid TSDoc comment for an exported SDK symbol. Use when adding
  documentation to a new export, documenting an existing export, or when a
  symbol is missing a TSDoc block. Only applies to exported symbols in src/
  that are not test, fixture, story, or mock files.
---

# Write TSDoc

Only invoke this skill for **exported symbols** in **`src/**\/\*.{ts,tsx}`\*\*, excluding:

- `**/*.stories.{ts,tsx}`
- `**/*.test.{ts,tsx}`
- `**/__fixtures__/**`

Do not invoke for files in `build/`, `sdk-app/`, `e2e/`, `eslint-rules/`, or any other non-library directory.

## 1. Generate the skeleton

If any segment of the file path is `shared` or `helpers`, pass `--default-release internal`; otherwise omit it.

**Each `tsdoc-stub` invocation is expensive — never call it more than once per file.**

- When documenting multiple symbols from the same file, always generate all skeletons in a single call.
- Use `--all-exports` when you need every exported symbol in the file (e.g. working from a violation list that covers the whole file).
- Use `--symbols` when you have a known subset.
- Only use `--symbol` (singular) when there is exactly one symbol to document in the file.

**All exported symbols in a file (use when the violation list covers most or all of a file):**

```bash
npx tsx build/tsdoc-stub.ts --file <path> --all-exports [--default-release internal]
```

**A specific subset of symbols from the same file:**

```bash
npx tsx build/tsdoc-stub.ts --file <path> --symbols Name1,Name2,Name3 [--default-release internal]
```

**Single symbol (only when there is exactly one symbol to document in this file):**

```bash
npx tsx build/tsdoc-stub.ts --file <path> --symbol <name> [--default-release internal]
```

Single-symbol output varies by case — do not read the source file:

- **No existing comment**: `LINE:N` then `DECLARATION:...\n---` then (optionally) `EVENTS:...\n---` then skeleton. Insert the finished comment before line N.
- **Existing comment, not aligned**: `LINE:N`, `DELETE_THROUGH:M`, `OLD_COMMENT:...\n---`, `DECLARATION:...\n---`, then (optionally) `EVENTS:...\n---`, then skeleton with summary pre-filled. Use the OLD_COMMENT text + first line of the declaration as the Edit `old_string`; replace with the finished comment + that same first line.
- **Existing comment, already aligned**: nothing emitted (stderr message, exit 0) — skip. Aligned means: has a release tag, correct `@param` names matching the signature exactly, `@returns` present iff the function has a non-void return, and correct `@typeParam` names.

Batch output (`--symbols` / `--all-exports`) prefixes each symbol with `SYMBOL: NAME\n`, then either the same block as single mode or `SKIP\n` if already aligned.

**`EVENTS:` section** — present on component/function symbols that accept `onEvent`. Each line is `KEY string-value` (e.g. `TIME_OFF_CREATE_POLICY timeOff/createPolicy`). Use this directly to build the `@remarks` events table — no additional file reads or greps needed.

## 2. Fill in the prose

**Summary** — one sentence after `/**`. Active verb for functions (`Formats…`, `Returns…`); shape description for types/interfaces. Under ~100 characters.

**`@typeParam T -`** — one clause naming what the type parameter represents (e.g. `The shape of the form values`, `The entity type being listed`). Don't restate the constraint already in the signature.

**`@param name -`** — one clause; don't restate the type. For complex params with discriminated unions, link the types directly: `{@link CreateProps} or {@link UpdateProps}`.

**`@returns`** — what the value is, not its type. For loading-state hooks describe both branches: `A {@link HookLoadingResult} while loading, or a {@link UseXxxReady} once ready.`

**`@remarks`** (optional) — behavioral notes, edge cases, or constraints that don't fit the summary. Place between summary and the param group.

For exported **React components**, `@remarks` must include an events table listing every `onEvent` payload the component can emit. When the stub emitted an `EVENTS:` section, use those entries directly as the row list — do not grep for events. When the stub emitted no `EVENTS:` section, the component does not use `onEvent` and no table is needed.

```
| Event | Description | Data |
| ----- | ----------- | ---- |
| `event/string/value` | What triggers it | {@link DataType} or — |
```

Use `{@link TypeName}` (importing the type if needed) for the Data column when a type from `@gusto/embedded-api/models/components/` matches. Use `—` when the event carries no data.

**`@example`** (optional) — when a snippet meaningfully clarifies usage. **Skip for React components already documented in `docs/`** — the docs page is the canonical example. Import from the published package, not internal paths.

**`@see`** (optional) — `{@link TypeName}` references for closely related symbols.

## 3. Tag order

````
/**
 * Summary.
 *
 * @remarks
 * Optional extended prose.
 *
 * @typeParam T - description
 * @param name - description
 * @returns description
 * @public
 *
 * @example
 * ```ts
 * // code
 * ```
 */
````

- One blank line between summary and tag group
- `@remarks` is its own group (blank lines before and after)
- `@typeParam`, `@param`, `@returns`, `@deprecated`, and the release tag are one group — no blank lines between them
- Each `@example` is its own group

## 4. Write to file

Use the Edit tool to write the finished comment to the source file:

- **Insert**: `old_string` = first line of declaration; `new_string` = finished comment + `\n` + that line.
- **Replace**: `old_string` = OLD_COMMENT text + `\n` + first line of declaration; `new_string` = finished comment + `\n` + that line.
