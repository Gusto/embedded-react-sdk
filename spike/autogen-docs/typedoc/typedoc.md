# typedoc

`typedoc` reads TypeScript source files directly (not compiled `.d.ts`) and produces HTML or Markdown documentation from JSDoc/TSDoc comments. It has a first-class `typedoc-plugin-markdown` extension that emits Markdown, and a companion Docusaurus integration (`docusaurus-plugin-typedoc` / `typedoc-docusaurus-theme`) that wires the output into a Docusaurus site with an auto-generated sidebar.

Unlike API Extractor, TypeDoc does not produce a machine-readable `.api.json` model or an API surface report (`.api.md`) — its output is documentation markdown, not an intermediate model. It reads from source, so no build step is required to run it.

---

## What it produces

| File / artifact                               | Purpose                                                             |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `*.md` per module / hook / namespace          | Documentation pages with type signatures, prop tables, descriptions |
| `index.md`                                    | Package-level index listing all modules                             |
| `typedoc-sidebar.cjs` (with Docusaurus theme) | Docusaurus sidebar config importable from `sidebars.js`             |

---

## Docusaurus integration

TypeDoc has a purpose-built Docusaurus stack:

- **`typedoc-plugin-markdown`** — swaps the default HTML renderer for Markdown
- **`typedoc-docusaurus-theme`** — post-render hook that generates `typedoc-sidebar.cjs` alongside the docs output
- **`docusaurus-plugin-typedoc`** — Docusaurus plugin that calls TypeDoc as part of `docusaurus build`, placing output in the site's `docs/api/` directory automatically

The integration round-trip:

```js
// docusaurus.config.js
plugins: [
  ['docusaurus-plugin-typedoc', { entryPoints: ['src/index.ts'], tsconfig: 'tsconfig.json' }],
]

// sidebars.js
const typedocSidebar = require('./docs/api/typedoc-sidebar.cjs')
module.exports = { apiSidebar: typedocSidebar }
```

TypeDoc generates the markdown and sidebar config; Docusaurus serves it. The sidebar respects TypeDoc's module hierarchy and labels deprecated items with a CSS class (`typedoc-sidebar-item-deprecated`). No manual sidebar maintenance is required.

Markdown pages have no required frontmatter — Docusaurus picks up the first `#` heading as the page title. The `frontmatterGlobals` option in `typedoc-plugin-markdown` can inject custom frontmatter (e.g. `custom_edit_url: null`) if needed.

---

## Entry point strategies and output granularity

TypeDoc's `entryPointStrategy` controls how entry points map to documentation modules, and therefore to output files.

### `resolve` (default) + `outputFileStrategy: "modules"`

One file per TypeScript namespace or module. All flat exports land in a single root page.

**Result for this SDK:** 11 files — one per component namespace (`EmployeeOnboarding`, `Employee`, `Contractor`, etc.) plus a 7,900-line root `README.md` that contains all hooks, providers, and utilities in a single page. The namespace pages are well-structured (components and their props as subsections), but the root page is unusable as-is.

**Sidebar output:**

```js
{
  items: [
    {
      type: 'category',
      label: 'Namespaces',
      items: [
        { type: 'doc', id: '@gusto/namespaces/EmployeeOnboarding', label: 'EmployeeOnboarding' },
        {
          type: 'doc',
          id: '@gusto/namespaces/Employee',
          label: 'Employee',
          className: 'typedoc-sidebar-item-deprecated',
        },
        // ...
      ],
    },
  ]
}
```

### `resolve` + `outputFileStrategy: "members"`

One file per exported symbol. Components, hooks, types, and interfaces each get their own page.

**Result for this SDK:** 607 files. Same structural problem as `api-documenter` — types split from the hooks that own them, interface properties on separate pages. Unusable for the RFC taxonomy.

### `expand` (per-directory traversal)

TypeDoc creates one module per source file it finds when traversing specified directories. This means test files, schema files, and internal utilities all get documentation pages alongside the public hook.

**Result for this SDK:** Too granular and includes internal files. Pointing at `useEmployeeDetailsForm/` produced pages for `employeeDetailsSchema.md`, `fields.md`, `useEmployeeDetailsForm.test.md`, etc. alongside the hook itself. Not directly usable.

---

## Sample output: `useEmployeeDetailsForm`

---

## Known type-rendering limitations

### Zod-derived types are not expanded

`EmployeeDetailsFormData` is defined as a mapped type over `fieldValidators` (a Zod object). TypeDoc shows the raw type expression rather than the expanded field-name union:

```ts
// TypeDoc output — shows the expression, not the expansion
type EmployeeDetailsFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

// What partners actually need to see
type EmployeeDetailsFormData = {
  firstName: string
  lastName: string
  dateOfBirth: string
  // ...
}
```

API Extractor resolves this at extraction time against the compiled declarations and emits the fully-expanded shape. TypeDoc reads from source and can only see what the TypeScript compiler emits at the type level — the mapped type expression remains opaque.

**Impact:** Any `z.infer<...>`-derived type appears as its Zod expression. There are ~15 such types across the SDK hooks (every `*FormData` and `*FormOutputs`). Partners can still navigate the type via IDE hover (which does expand the type), but the documentation itself shows the formula, not the result.

### `EmployeeDetailsField` shows `fieldValidators`

`type EmployeeDetailsField = Exclude<keyof typeof fieldValidators, "selfOnboarding">` — the internal `fieldValidators` const is referenced in the type but not exported. TypeDoc shows the expression as written; a partner reading the docs cannot derive the actual field name set without looking at source.

This is a fundamental issue: any type alias that references unexported symbols will be opaque in TypeDoc output. The workaround is to explicitly enumerate the union in the source type, or add a `@remarks` block listing the allowed values.

### Component prop signature bloat

Component function signatures reference a large `dictionary` union type containing all translation keys. This produces multi-line parameter types in the function signature section that obscure the meaningful props. Example in `EmployeeOnboarding.md`:

```ts
function FederalTaxes(__namedParameters): Element
// Parameters:
// __namedParameters: FederalTaxesProps & Pick<BaseComponentInterface<
//   "common" | "Company.Addresses" | "Company.AssignSignatory" | ... (80+ keys)
// >, "FallbackComponent">
```

The `dictionary` prop and the `Pick<BaseComponentInterface<...>, "FallbackComponent">` intersection are internal details that should not appear in the public prop signature. Fixing this requires restructuring the component types so that the `dictionary` intersection does not pollute the publicly visible signature — an SDK architecture change, not a TypeDoc config change.

---

## TSDoc tag support

TypeDoc parses TSDoc comments. Relevant differences from API Extractor:

| Feature                                      | TypeDoc                                                                               | API Extractor                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| `@param`, `@returns`, `@example`, `@remarks` | ✓                                                                                     | ✓                                            |
| `@deprecated`                                | ✓ (renders banner + sidebar CSS class)                                                | ✓                                            |
| `@internal` exclusion                        | `excludeInternal: true` option                                                        | `releaseTagsToTrim` in config                |
| `@public` / `@beta` / `@alpha` release tags  | Parsed but not enforced                                                               | Enforced by `ae-missing-release-tag` warning |
| `@module` / `@mergeModuleWith`               | ✓ — `@module` names a module; `@mergeModuleWith` copies (not moves) symbols to target | No equivalent                                |
| `@packageDocumentation`                      | ✓                                                                                     | ✓                                            |
| Validation of tag syntax                     | No built-in linting                                                                   | `eslint-plugin-tsdoc` (separate tool)        |

TypeDoc does not enforce that every exported symbol has a release tag. It silently documents everything that passes the `excludeInternal`/`excludePrivate` filters. Missing release tags produce no warning. The enforcement layer would still need to be `eslint-plugin-tsdoc`.

---

## `@module` / `@mergeModuleWith` annotation approach

TypeDoc supports file-level annotations to control module assignment. These were applied to the two prototype hooks on this branch to test whether they could replace the proxy entry files.

### The diff

Each hook uses three source files. The main hook file gets `@module` (names the module); the two supporting files get `@mergeModuleWith` (signals they belong to the same module).

```diff
--- a/src/components/Employee/Profile/shared/useEmployeeDetailsForm/useEmployeeDetailsForm.tsx
+++ b/src/components/Employee/Profile/shared/useEmployeeDetailsForm/useEmployeeDetailsForm.tsx
@@ -1,3 +1,4 @@
+/** @module Employee/useEmployeeDetailsForm */
 import { useMemo } from 'react'

--- a/src/components/Employee/Profile/shared/useEmployeeDetailsForm/fields.tsx
+++ b/src/components/Employee/Profile/shared/useEmployeeDetailsForm/fields.tsx
@@ -1,3 +1,4 @@
+/** @mergeModuleWith Employee/useEmployeeDetailsForm */
 import type { EmployeeDetailsErrorCodes } from './employeeDetailsSchema'

--- a/src/components/Employee/Profile/shared/useEmployeeDetailsForm/employeeDetailsSchema.ts
+++ b/src/components/Employee/Profile/shared/useEmployeeDetailsForm/employeeDetailsSchema.ts
@@ -1,3 +1,4 @@
+/** @mergeModuleWith Employee/useEmployeeDetailsForm */
 import { z } from 'zod'
```

Same pattern for `useCompensationForm`. Six files changed: two `@module`, four `@mergeModuleWith`. `typedoc.json` uses `entryPointStrategy: "expand"` pointed at the two hook directories, with tests and index files excluded.

### What this actually produces

Running `npm run typedoc:spike` with these annotations generates **eight files**, not two:

```
docs/Employee/useEmployeeDetailsForm.md          ← the merged page ✓
docs/Employee/useCompensationForm.md             ← the merged page ✓
docs/Profile/shared/useEmployeeDetailsForm/employeeDetailsSchema.md  ✗ leftover
docs/Profile/shared/useEmployeeDetailsForm/fields.md                 ✗ leftover
docs/Compensation/shared/useCompensationForm/compensationSchema.md   ✗ leftover
docs/Compensation/shared/useCompensationForm/fields.md               ✗ leftover
docs/index.md
docs/typedoc-sidebar.cjs
```

`@mergeModuleWith` **copies** symbols from the source file into the target module — it does not **move** them. The secondary files (`fields.tsx`, `employeeDetailsSchema.ts`) still get their own pages with full content, and those pages also appear in the sidebar. The hook page and the schema/fields pages both exist, both populated.

**Sidebar output (condensed):**

```js
items: [
  {
    type: 'category',
    label: 'Compensation',
    items: [
      {
        label: 'shared',
        items: [
          {
            label: 'useCompensationForm',
            items: [
              { type: 'doc', id: 'Compensation/shared/useCompensationForm/compensationSchema' },
              { type: 'doc', id: 'Compensation/shared/useCompensationForm/fields' },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Employee',
    items: [
      { type: 'doc', id: 'Employee/useCompensationForm' },
      { type: 'doc', id: 'Employee/useEmployeeDetailsForm' },
    ],
  },
  {
    type: 'category',
    label: 'Profile',
    items: [
      {
        label: 'shared',
        items: [
          {
            label: 'useEmployeeDetailsForm',
            items: [
              { type: 'doc', id: 'Profile/shared/useEmployeeDetailsForm/employeeDetailsSchema' },
              { type: 'doc', id: 'Profile/shared/useEmployeeDetailsForm/fields' },
            ],
          },
        ],
      },
    ],
  },
]
```

The `Employee/` category is what we want. The `Compensation/` and `Profile/` categories are noise from the unmerged secondary files.

### Why the secondary pages remain

The `@mergeModuleWith` tag in TypeDoc 0.28 is a **copy** operation, not a **move**. TypeDoc discovers each file via the `expand` entry point strategy, creates a module for it, then applies the `@mergeModuleWith` redirect. The redirect adds the symbols to the target module but doesn't suppress the original module's output.

### What would make it work

True single-page-per-hook output with source annotations requires either:

1. **Consolidate the source files**: if all of `useEmployeeDetailsForm.tsx`, `fields.tsx`, and `employeeDetailsSchema.ts` were one file, a single `@module Employee/useEmployeeDetailsForm` would produce exactly one page with no leftovers. This is a source architecture decision independent of documentation tooling — there may be good reasons to keep the files separate.

2. **Proxy entry files** (the `entries/` directory approach): define the public surface per hook in a re-export file in the tooling directory, use `entryPointStrategy: "resolve"` with `alwaysCreateEntryPointModule: true`. Each proxy file → one doc page, no secondary files, sidebar is clean. The tradeoff is that the proxy files must be kept in sync with `src/index.ts`.

**Tradeoff comparison:**

|                                    | `@module` + `@mergeModuleWith`           | Proxy entry files                                |
| ---------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| Source changes required            | Yes — one comment per source file        | None                                             |
| Achieves one page per hook cleanly | Only if source files are consolidated    | Yes, always                                      |
| Taxonomy defined in                | Source files                             | Tooling directory (`entries/`)                   |
| Maintenance surface                | Source files are authoritative           | Proxy files must mirror `src/index.ts` additions |
| Source drift risk                  | Low — comment lives next to the code     | Higher — separate file to maintain               |
| Secondary file noise               | Yes (leftover pages) unless consolidated | None                                             |

---

## CI integration

TypeDoc does not have a built-in `--verify` mode. There is no equivalent to `api-extractor run` (which exits non-zero if the report differs from checked-in). Options for CI:

1. **Commit generated output + `git diff` check**: Run TypeDoc in CI and fail if the output differs from the committed files. This is the common approach for generated docs. Requires committing the output directory.

2. **Hash comparison**: Generate output to a temp directory and compare file hashes against the committed version. More portable but requires a small CI script.

3. **No verification**: Only run TypeDoc as part of the docs build step (e.g., `docusaurus build`). No PR-time signal that the docs surface changed.

Option 1 parallels the current `api-report:verify` pattern: commit the output, run derive locally, fail CI on diff.

---

## Relationship to other tools in the spike

- **`eslint-plugin-tsdoc`** remains the enforcement layer. TypeDoc consumes TSDoc comments; the ESLint plugin ensures those comments exist and are syntactically valid before TypeDoc runs.
- **`api-extractor`** is the better fit for the API surface report (`.api.md` diff in PRs). TypeDoc does not produce this artifact. The two tools can coexist: API Extractor for the surface report + TypeDoc for the browsable docs.
- **`@microsoft/api-extractor-model`** as a custom emitter base: still viable if TypeDoc's output doesn't meet the taxonomy requirements. But the proxy entry files approach shows TypeDoc can hit the RFC taxonomy without a custom emitter.

---

## Evaluation summary

| Criterion                                    | Assessment                                                                   |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| Criterion                                    | Assessment                                                                   |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| Produces one page per hook                   | ✓ via proxy entry files; `@module`+`@mergeModuleWith` leaves secondary pages |
| Produces one page per component namespace    | ✓ out of the box (TypeScript namespaces → one page)                          |
| Related types as subsections                 | ✓ within the same module page                                                |
| Domain-based taxonomy (Employee, Company, …) | ✓ via directory structure of proxy entry files                               |
| Docusaurus integration                       | ✓ first-class — sidebar auto-generated                                       |
| Reads inline JSDoc                           | ✓                                                                            |
| TSDoc tag support                            | ✓                                                                            |
| Expands Zod-derived types                    | ✗ shows type expression, not expansion                                       |
| CI surface-change verification               | Possible but requires setup (no built-in verify mode)                        |
| Source read (no build step)                  | ✓ reads TypeScript source directly                                           |
| `@internal` exclusion                        | ✓ via `excludeInternal` option                                               |
| Source modifications required                | No (proxy files) / Yes with leftover-page caveat (`@module` annotations)     |

The core limitation is **Zod type expansion**: any `z.infer<...>`-derived type appears as its source-level formula in the docs. For the SDK's `*FormData` and `*FormOutputs` types, this means the concrete field shapes are not visible in the generated output. Whether this is acceptable depends on how central those types are to partner-facing reference docs.

Everything else — structure, granularity, Docusaurus integration, TSDoc compatibility — works at the level the RFC requires, and the integration path is straightforward.
