---
name: write-tsdoc
description: >-
  Write a valid TSDoc comment for an exported SDK symbol. Use when adding
  documentation to a new export, documenting an existing export, or when a
  symbol is missing a TSDoc block. Only applies to exported symbols in src/
  that are not test, fixture, story, or mock files.
---

# Write TSDoc

Only invoke this skill for **exported symbols** in **`src/**/\*.{ts,tsx}`\*\*, excluding:

- `**/*.stories.{ts,tsx}`
- `**/*.test.{ts,tsx}`
- `**/__fixtures__/**`

Do not invoke for files in `build/`, `sdk-app/`, `e2e/`, `eslint-rules/`, or any other non-library directory.

## 1. Generate the skeleton

If any segment of the file path is `shared` or `helpers`, pass `--default-release internal`; otherwise omit it.

```bash
npx tsx build/tsdoc-stub.ts --file <path> --symbol <name> [--default-release internal]
```

The output varies by case — do not read the source file:

- **No existing comment**: `LINE:N` then `DECLARATION:...\n---` then skeleton. Insert the finished comment before line N.
- **Existing comment, not aligned**: `LINE:N`, `DELETE_THROUGH:M`, `OLD_COMMENT:...\n---`, `DECLARATION:...\n---`, then skeleton with summary pre-filled. Use the OLD_COMMENT text + first line of the declaration as the Edit `old_string`; replace with the finished comment + that same first line.
- **Existing comment, already aligned**: nothing emitted (stderr message, exit 0) — skip. Aligned means: has a release tag, correct `@param` names matching the signature exactly, `@returns` present iff the function has a non-void return, and correct `@typeParam` names.

## 2. Fill in the prose

**Summary** — one sentence after `/**`. Active verb for functions (`Formats…`, `Returns…`); shape description for types/interfaces. Under ~100 characters.

**`@typeParam T -`** — one clause naming what the type parameter represents (e.g. `The shape of the form values`, `The entity type being listed`). Don't restate the constraint already in the signature.

**`@param name -`** — one clause; don't restate the type. For complex params with discriminated unions, link the types directly: `{@link CreateProps} or {@link UpdateProps}`.

**`@returns`** — what the value is, not its type. For loading-state hooks describe both branches: `A {@link HookLoadingResult} while loading, or a {@link UseXxxReady} once ready.`

**`@remarks`** (optional) — behavioral notes, edge cases, or constraints that don't fit the summary. Place between summary and the param group.

**`@example`** (optional) — when a snippet meaningfully clarifies usage. Import from the published package, not internal paths.

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
