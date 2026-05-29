---
name: write-tsdoc
description: >-
  Write a valid TSDoc comment for an exported SDK symbol. Use when adding
  documentation to a new export, documenting an existing export, or when a
  symbol is missing a TSDoc block.
---

# Write TSDoc

## 1. Generate the skeleton

If any segment of the file path is `shared` or `helpers`, pass `--default-release internal`; otherwise omit it.

```bash
npx tsx build/tsdoc-stub.ts --file <path> --symbol <name> [--default-release internal]
```

The output is two parts: a `LINE:N` header giving the line number of the declaration, then the comment skeleton. Parse `N` — you will insert the finished comment immediately before that line. If the release tag is `@internal`, prose is optional — `/** @internal */` alone is sufficient, but document the symbol if it is non-obvious or complex.

## 2. Fill in the prose

**Summary** — one sentence after `/**`. Active verb for functions (`Formats…`, `Returns…`); shape description for types/interfaces. Under ~100 characters.

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

## 4. Output

Print the comment block. Do not write it to the file.
