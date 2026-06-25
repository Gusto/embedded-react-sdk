---
name: tsdoc
description: >-
  Write TSDoc for exported symbols. Use after writing new code or when an export
  is missing documentation. For auditing drift across many files after a refactor,
  use the tsdoc-auditor agent instead.
argument-hint: '[file path or symbol name — omit to document what was just written]'
---

# Write TSDoc

Write TSDoc for exported symbols. You are already in context with the code — use what you know.

## Scope

If `$ARGUMENTS` is provided, use it as the target (file path or symbol name). Otherwise, document the exported symbols from the code most recently written in this conversation.

Document **exported** symbols only: components, hooks, types, interfaces, enums, utilities, context values. Skip non-exported symbols, test helpers, Storybook-only code, and anonymous components.

## Generating skeletons (optional but recommended)

When documenting a file you didn't just write, generate stubs first to catch all exports and get correct `@param` names:

```bash
# All exports in a file
npx tsx build/tsdoc-stub.ts --file <path> --all-exports

# Specific symbols
npx tsx build/tsdoc-stub.ts --file <path> --symbols Name1,Name2
```

Output format: `SYMBOL: NAME\n<skeleton>` per symbol, or `SKIP` if already aligned. For code you just wrote, you can write TSDoc directly — the stub is optional but guards against missed exports.

## Core standards

**Required tags by symbol type:**

| Tag                  | Required when                              |
| -------------------- | ------------------------------------------ |
| Summary (first line) | Always                                     |
| `@param name -`      | Every parameter — names must match exactly |
| `@typeParam T -`     | Every type parameter                       |
| `@returns`           | Any non-void return                        |
| Release tag          | Every export — exactly one                 |

**Tag order:**

````ts
/**
 * Summary.
 *
 * @remarks
 * Extended prose.
 *
 * @components
 * {@link ChildBlock} - what it contributes.
 *
 * @typeParam T - description
 * @param name - description
 * @returns description
 * @public
 *
 * @example
 * ```tsx
 * // code
 * ```
 */
````

One blank line between summary and tag group. `@remarks` is its own group (blank lines before and after). `@components` is its own group (after `@remarks`, before `@param`). Each `@example` is its own group.

**`@components` tag:** A registered block tag listing the sub-components/hooks a composing symbol pulls together — one `{@link Name} - description` per line. The doc engine renders these as a "Sub-components" table on the generated page. Used mainly on flows (see the flows guide); skip it on leaf components that compose nothing.

**`@group` tags:** Optional, but expected on `@public` exports so TypeDoc organizes the sidebar. When present, the value **must** come from this fixed set (`tsdoc-coverage/valid-group` errors otherwise) — match the existing siblings in the barrel rather than inventing a label:

| `@group` value                                | Use for                                           |
| --------------------------------------------- | ------------------------------------------------- |
| `Flow Components` / `Block Components`        | Flow orchestrators / standalone block components  |
| `Form Hooks` / `Data Hooks` / `Utility Hooks` | `useXxxForm` / data-fetching hooks / helper hooks |
| `Component Props`                             | Component and hook props interfaces               |
| `Utility Types`                               | Exported helper/return types                      |
| `Events`                                      | Exported event-name constants/types               |

**Style rules:**

- Summary: one sentence, active verb for functions, shape description for types. Under ~100 chars.
- Don't restate the type in prose — describe meaning, not type
- No `@/` aliases or internal paths in examples
- Second person, not "partners should…"
- `@remarks` for `@public` symbols: observable behavior only, never implementation details

## Choosing a release tag

1. Check `.reports/embedded-react-sdk.api.md` — if the symbol appears there or is referenced by a `@public` export → `@public`
2. Named in `docs/` as a partner-facing API → `@public`
3. Default: `@internal` (easier to promote than demote)

Always `@internal`, no prose needed: `createXxxSchema`, `XxxSchemaOptions`, `XxxMetadataConfig`, raw factory functions that have a `useXxx` wrapper.

## Type-specific guidance

For more depth, Read the relevant guide before writing:

| Symbol type                        | When to load                                           |
| ---------------------------------- | ------------------------------------------------------ |
| `.claude/doc-guides/hooks.md`      | Any hook, hook props, hook return types, form fields   |
| `.claude/doc-guides/components.md` | React components — events table format, @example rules |
| `.claude/doc-guides/flows.md`      | Flow components and FlowComponents props               |

Load the guide when you'd otherwise be guessing: hook field patterns, events table format, what belongs in `@remarks` vs. what to skip.

## When to ask instead of guessing

Stop and ask before writing `@remarks` for a hook or flow if:

- No ticket, PR description, or `docs/workflows-overview/` page covers this feature
- A business rule or error code meaning isn't clear from the code
- You're unsure whether a symbol should be `@public` vs. `@beta`

Write the structural parts (`@param`, `@returns`, release tag) and note what's missing rather than inventing product behavior.

## ESLint check

After writing, verify:

```bash
npx eslint <file-path> 2>&1
```

Fix any `tsdoc/` or `tsdoc-coverage/` errors. Tag-order issues auto-fix with `--fix`. Missing tags and wrong `@param` names need manual correction.
