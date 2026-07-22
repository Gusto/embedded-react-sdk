---
name: review-pr
description: Review a GitHub pull request. Use when asked to review a PR or pull request.
argument-hint: '<PR number or GitHub URL>'
allowed-tools: [Bash, Read]
---

# PR Review

Review a GitHub pull request and report findings with severity tiers and suggested fixes.

## Arguments

`$ARGUMENTS` — PR number, GitHub URL (`https://github.com/owner/repo/pull/123`), or empty to auto-detect the current branch's open PR.

## Steps

### Step 1: Fetch PR

Parse `$ARGUMENTS`:

- GitHub URL → extract `owner/repo` and number
- Plain number → detect repo via `gh repo view --json nameWithOwner -q .nameWithOwner`
- Empty → use `gh pr view --json number,title,body,author,url,baseRefName,headRefName`

```bash
gh pr view <number> [--repo <owner/repo>] --json number,title,body,author,url,baseRefName,headRefName
gh pr diff <number> [--repo <owner/repo>]
```

### Step 2: Load Learned Rules

Read the rules file at the path of this skill: `rules/learned.md`

Apply every rule in that file to the diff. Each rule has a severity (error → Critical, warning → Important, info → Suggestion).

### Step 3: Review the Diff

Analyze the diff for the following, in addition to the learned rules:

**Always check:**

- Correctness: logic errors, off-by-ones, unhandled promise rejections, missing null checks
- Security: user-controlled input reaching dangerous sinks, missing sanitization, exposed secrets
- TypeScript: the learned rules cover `as` casts; also flag implicit `any` and unsafe non-null assertions
- Tests: the learned rules cover redundancy; also flag new logic with zero test coverage

**Check when relevant (skip if no UI/component files changed):**

- Accessibility: interactive elements missing `aria-label` or role, focus management issues, missing keyboard handlers on clickable non-button elements

**Check when relevant (skip if not an SDK component):**

- Apply the partner-facing API rule from learned rules

---

**Check when any SDK component or hook files are in the diff:**

> **Reference Standards.** When the diff introduces a new partner-facing hook (`use*Form`) or migrates an SDK component to consume one, treat these two docs as the source of truth and validate the diff against them — the rules below are derived from them, but the docs cover details that aren't enumerated as individual rules:
>
> - `.claude/commands/create-hook.md` — canonical scaffolding for new hooks: directory layout, schema/fields/hook/index/test file structure, barrel wiring, and verification steps.
> - `.claude/skills/migrate-sdk-component-to-hooks/SKILL.md` — migration playbook: pre-migration tests, hook-owns-business-logic rule, multi-form composition with `composeSubmitHandler`, `BaseBoundaries`/`BaseLayout` wiring, and the four canonical reference components.
>
> If a partner-facing hook in the diff materially diverges from these specs — different file layout, ad-hoc schema structure, business logic in the component instead of the hook, missing barrel exports, missing TSDoc on the exported symbols (the partner-facing reference under `docs/reference/**` is generated from it) — flag it as `[LEARNED-006]` and cite the relevant section of the canonical doc in the fix. Do not let "different but works" slide; partners depend on the consistency of these patterns.

#### Hook Architecture (component layer)

- **BaseBoundaries, not BaseComponent**: Public components must wrap `BaseBoundaries` and delegate to a `Root` component. Flag any use of `BaseComponent` or `useBase()`.
- **`onEvent` as prop**: `onEvent` must be passed as a prop through to `Root` — never read from `useBase()`.
- **Business logic stays in the hook**: Field visibility, conditional requiredness, derived data, and loading states must come from the hook. Flag `useWatch` usage that gates field rendering or sets requiredness — this logic belongs inside the hook's schema or `Fields` selection.
- **No react-hook-form internals in the component (`[LEARNED-007]`, non-negotiable)**: Hooks are partner-facing; `react-hook-form` is not. Any component-layer use of raw `useForm`, `useWatch`, `setValue`, `watch`, `getValues`, `trigger`, `register`, or access through `hookResult.form.hookFormInternals.formMethods.*` is a **Critical** finding — flag it and surface it explicitly to the user as a non-negotiable issue, regardless of how small the diff looks. Each such site is a signal the hook is missing functionality: either an existing hook return value covers the case (use it) or the hook must be updated to cover it. The only acceptable resolutions are (a) move the logic into the hook, or (b) a written, reviewer-approved justification that no hook can own this case without introducing side effects elsewhere — never a silent merge. `hookFormInternals` exists narrowly as an escape hatch for purely presentational, non-business-logic concerns (see `migrate-sdk-component-to-hooks/SKILL.md → Section 6 → "Watching Form Values"`); even those uses should be reviewed skeptically. Do **not** treat `AdminProfile.tsx`'s `startDate` `useForm` as precedent — it is documented as a non-canonical exception, not a template.
- **Conditional fields via truthiness**: Fields the hook returns as `undefined` when hidden must be rendered with a truthiness guard (`{Fields.SomeField && <Fields.SomeField ... />}`). Flag explicit `if` conditions based on form values.

#### Multi-Form Composition

- **`composeSubmitHandler` required**: When more than one form hook is used on a screen, errors and submit must be aggregated with `composeSubmitHandler`. Flag any manual error array spreading (e.g. `[...hookA.errorHandling.errors, ...hookB.errorHandling.errors]`).
- **`shouldFocusError: false` on all hooks**: Every hook initialized alongside others must pass `shouldFocusError: false` so `composeSubmitHandler` controls cross-form focus. Flag any hook that omits this when siblings are present.
- **Never memoize `activeForms` or `composeSubmitHandler` result**: Hook return values are not stable references. Flag `useMemo` wrapping either.
- **`composeErrorHandler` for extra queries**: If the component fetches data outside the form hooks (React Query calls alongside hook usage), it must feed them through `composeErrorHandler` — not wire up a separate error display.

#### Loading and Error State

- **Loading gate shape**: The loading branch must use `<BaseLayout isLoading error={errorHandling.errors} />`. Flag `isLoading` rendered without passing `error`, which hides query failures behind an infinite spinner.
- **Ready state error surface**: The ready branch must wrap content in `<BaseLayout error={errorHandling.errors}>`. Flag components that render the form without a `BaseLayout` wrapper or that pass raw error arrays instead of `errorHandling.errors`.

#### SDKFormProvider Rules

- **No nesting**: `SDKFormProvider` must not be nested inside another `SDKFormProvider`. Use sibling providers for fields from different hooks.
- **No cross-hook fields**: Fields from hook B must not be rendered inside an `SDKFormProvider` wrapping hook A's result.
- **Consistent approach per hook**: For each hook result, use either `SDKFormProvider` or the `formHookResult` prop on every field — never both for the same hook.

#### Select Fields with Translated Labels

- **`getOptionLabel` required for translated options**: Select fields with translated option labels must use `getOptionLabel` on the hook's field component combined with `withOptions(baseMetadata.field, options, entries)` in the hook. Flag any raw `<SelectField>` inside an `SDKFormProvider` used as a workaround for missing translated labels.
- **Translations never in hooks**: Hooks must not call `useTranslation` or `t()`. Display labels belong in the component.

#### Validation Messages

- **All error codes covered**: Every rendered field must have `validationMessages` covering all error codes that can realistically fire. The field's type definition in `fields.tsx` distinguishes required vs optional keys — TypeScript enforces the required ones but won't catch missing optional ones. Flag fields rendered without `validationMessages` unless the field's error codes can never fire (e.g. boolean fields, fields with `requiredFieldsConfig: 'never'` and no format validator).

#### Event Payloads (see also LEARNED-005)

- **API response data in `onEvent`**: Any `onEvent` call following a mutation must include the API response as payload. This applies to all event types — not just `_DONE`. Pass the inner data value (e.g. `result.data`), not the top-level mutation result which includes `httpMeta`.
- **Preserve existing event surface on migrations**: Migrations must not remove, rename, or change the payload shape of any event the pre-migration component emitted. Flag any `onEvent` call that was present before and is absent or altered in the diff.

#### Partial Update Recovery (create mode)

- **`resolvedId` state on partial failure only**: In create-mode multi-hook forms, a new entity ID must only be captured in component state if a downstream hook fails (recovery path). Flag code that stores a created ID in state on success — this triggers a re-render mid-submission that can unmount the form.

---

**Check when any hook implementation files are changed (`use*Form.tsx`, `*Schema.ts`, `fields.tsx`):**

#### Schema

- **4-part schema structure**: Every schema file must follow the `ErrorCodes → fieldValidators → requiredFieldsConfig → schema factory (buildFormSchema)` structure. Flag schemas that hardcode validation logic inline without this structure.
- **Boolean fields excluded from `requiredFieldsConfig`**: Boolean fields (`z.boolean()`) always have a value — they must never appear in `requiredFieldsConfig`. Flag any boolean field listed there.
- **`values` + `resetOptions` on `useForm`, not `useEffect` + `reset()`**: Form defaults must be synced via `values: resolvedDefaults` and `resetOptions: { keepDirtyValues: true }`. Flag any `useEffect` that calls `reset()`.
- **Schema memoized**: `create*Schema(...)` call must be inside `useMemo`. Flag schema creation outside of `useMemo` at the hook top level.

#### Return Shape

- **Discriminated union with `errorHandling` in both branches**: The hook must return `{ isLoading: true as const, errorHandling }` in the loading branch and `{ isLoading: false as const, ..., errorHandling }` in the ready branch. Flag hooks where `errorHandling` is only available in the ready branch.
- **`HookSubmitResult<Entity>` return type**: `onSubmit` must return `HookSubmitResult<TEntity>`. Flag submit handlers that return `void` or a raw API response.
- **No `*SubmitCallbacks` on single-mutation hooks**: Hooks that fire exactly one mutation per submit (including create-or-update routing) must not add a callbacks parameter — partners read `result.data`. Only hooks chaining multiple sequential mutations in one submit (like `useEmployeeDetailsForm`) should accept callbacks.

#### Hook Placement

- **`shared/use*Form/` directory**: Hooks must live at `src/components/<Domain>/<Feature>/shared/use<Name>Form/`. Flag hooks created elsewhere in the component tree.
- **Five-file structure**: Each hook directory must contain `use*Form.tsx`, `*Schema.ts`, `fields.tsx`, `index.ts`, and `use*Form.test.tsx`. Flag directories missing any of these files.
- **Barrel exports**: New hooks must be exported from the feature-level barrel and, if partner-facing, from `src/index.ts`. Flag hooks added without barrel updates.

---

**Check when test files are in the diff:**

- **`HttpResponseResolver` generic on `vi.fn`**: Any `vi.fn()` wrapping an MSW resolver must be typed as `vi.fn<HttpResponseResolver>`. Without it, `request` is inferred as `any` and `request.json()` / `request.url` are unsafe. Flag untyped resolver mocks.
- **`mock.invocationCallOrder` for ordering assertions**: Cross-endpoint call order must be asserted via `resolver.mock.invocationCallOrder[0]`. Flag tests that try to assert ordering via timing, counters, or manual flags.
- **`npm run test -- --run`**: Any test command in comments, README additions, or CI config must include `--run`. Flag `npm run test` without `--run` (starts watch mode, hangs in CI).

---

**Check when CSS/SCSS files are in the diff:**

- **No `!important`**: Flag any `!important` declaration — use CSS specificity instead.
- **No `@use` for auto-injected modules**: Do not add `@use` imports for modules globally available via Vite (e.g. `@/styles/Helpers` is auto-injected). Flag redundant imports.

---

**Check when any commit message or PR title convention may be violated:**

- **Conventional commits**: Commits must use `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, etc. Breaking changes use `feat!:` or `fix!:`. Flag PR titles that don't match this format.

### Step 4: Output

````markdown
# PR Review: <title>

**PR:** #<number> · **Author:** <author> · **Branch:** `<head>` → `<base>`

---

## Critical

<!-- Must fix before merge: bugs, security issues, broken a11y on interactive elements -->

- **[rule or category]** `path/to/file.tsx:42` — <what's wrong and why it matters>
  ```ts
  // Fix:
  <corrected snippet>
  ```

## Important

<!-- Significant quality concerns: unsafe types, missing tests on non-trivial code, API design issues -->

- **[rule or category]** `path/to/file.ts:88` — <description>
  ```ts
  // Fix:
  <corrected snippet>
  ```

## Suggestions

<!-- Nice-to-have: minor improvements that aren't blocking -->

- **[rule or category]** `path/to/file.ts:12` — <description>

## Strengths

<!-- What's well done — always include at least one observation -->

---

## Assessment

<One paragraph: what the PR accomplishes, main quality signal, merge recommendation.>
````

## Rules

- Include a fix snippet for every Critical and Important finding
- Cite `file:line` for every finding — no vague descriptions
- If the diff is large (600+ lines), focus on Critical and Important only
- Never omit the Strengths section
- Tag each finding with the LEARNED-NNN rule ID when one applies (e.g., `[LEARNED-002]`)
