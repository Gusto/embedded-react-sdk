# SDK conventions checklist

Check every review against this list. Each section says what to flag and how to fix it. Write the findings in plain English, following the rules in [../SKILL.md](../SKILL.md).

Some of these rules are also enforced by ESLint. Mention a rule only when the linter would not catch it, for example in a file the linter skips.

## 1. UI goes through the components context

All UI rendering goes through `useComponentContext()`. SDK components must not import UI primitives directly.

```tsx
const Components = useComponentContext()
return <Components.TextInput {...props} />
```

Flag: a component under `src/components/` that imports a button, input, select, alert, or other primitive straight from its implementation file (for example `src/components/Common/UI/...`) and renders it, instead of rendering it through `Components.*`.

Inside a react-hook-form `FormProvider`, the Field components in `src/components/Common/Fields/` are the right choice. Outside a form, use the primitives from `useComponentContext()`.

## 2. No react-hook-form internals in SDK components

Components consume form hooks only through the hook's documented return value: `data`, `status`, `actions`, `errorHandling`, `form.Fields`, and similar. Flag any new use, inside an SDK component, of:

- `useForm`, `useWatch`, `useFormContext` used to drive logic
- `setValue`, `watch`, `getValues`, `trigger`, `register`, `reset`
- `hookFormInternals.formMethods.*`

The fix is almost always to move the logic into the form hook and expose it through the hook's documented return value. Say so in the finding.

The `startDate` `useForm` in `AdminProfile.tsx` is a known, documented exception. Don't flag it, and don't accept it as a reason for new code to do the same.

For the full hook model, see [hooks.md](hooks.md).

## 3. Date-only values must use the date helpers

The API represents calendar dates (birthdays, effective dates, deadlines) as plain `YYYY-MM-DD` strings. Two raw JavaScript patterns silently shift these dates by one day, depending on the user's timezone:

- `new Date("YYYY-MM-DD")` parses as UTC midnight. Formatting it with local date components then shows the previous day everywhere behind UTC.
- `someDate.toISOString().split('T')[0]` converts a local-midnight date to UTC, which shows the previous day everywhere ahead of UTC.

Flag either pattern when it is applied to a date-only value, including inside Zod preprocessors and transforms. The fix is the helpers in `src/helpers/dateFormatting.ts`:

- `normalizeToDate()` parses a `YYYY-MM-DD` string into a `Date`.
- `formatDateToStringDate()` serializes a `Date` back to `YYYY-MM-DD`.
- `useDateFormatter()` (in `src/hooks/useDateFormatter.ts`) gives locale-aware display formatting.

Timestamps that carry a real time component (for example `created_at`) are fine to pass to `new Date()`.

## 4. i18n

- All user-facing text goes through i18next (`useTranslation`). Flag new hardcoded English strings rendered to users, including `aria-label`, `placeholder`, and alt text.
- A self-contained component owns exactly one translation namespace and reads only from it. Flag a component that reads keys from another component's namespace.
- Only the English source files under `src/i18n/en/` may be edited by hand. Translations under `src/i18n/es_US/` and every other locale come from an automated translation sync. Flag any hand edit to a non-English locale file.
- After changing English strings, `npm run i18n:generate` regenerates the types. If the diff adds or renames keys in `src/i18n/en/` but `src/types/i18nresources.d.ts` is unchanged, mention it.

## 5. Test assertion style

Prefer positive assertions on what something is over negative assertions on what it isn't.

Flag new negative assertions that don't guard a named, observable behavior, for example:

```ts
expect(entry).not.toHaveProperty('format')
expect(rendered).not.toContain('admin')
expect(api).not.toBeUndefined()
```

Suggest a positive shape assertion such as `expect(entry).toMatchObject({ ... })`.

Negative assertions are correct when the absence is the behavior under test, for example `expect(mutationResolver).not.toHaveBeenCalled()` when the test proves an endpoint was not hit, or `expect(screen.queryByRole('dialog')).toBeNull()` when the test proves a modal did not open. Do not flag those.

When a test checks outgoing HTTP requests, it should wrap the MSW resolver in `vi.fn<HttpResponseResolver>(...)`. Flag new custom request-spy utilities, and `vi.fn` resolvers without the `HttpResponseResolver` generic.

Flag groups of near-identical test cases that only vary the input data and assert the same behavior. One representative case is enough.

## 6. API and data layer

- API calls go through the `@gusto/embedded-api` alias, never a dated `@gusto/embedded-api-v-<date>` import path.
- Do not call `queryClient.invalidateQueries(...)` after a successful `@gusto/embedded-api` mutation. The SDK's query client already invalidates every SDK query on mutation success. Flag manual invalidation added after such a mutation.
- An `onEvent` call that follows a mutation includes the API response as its payload, as the inner data value (for example `result.data`), not the full mutation result with transport fields.
- Non-form data hooks return the `HookLoadingResult | BaseHookReady<...>` union from `src/partner-hook-utils/types.ts`.

## 7. Public API surface

- Standalone, publicly exported components take entity IDs (for example `employeeId`) and fetch their own data, rather than receiving full entity objects as props.
- Public component props stay minimal. Flag new props that expose internal details: sub-component props, internal state shapes, or handler signatures that only make sense inside the SDK.
- Event names are unique and scoped to the component that fires them. Flag reuse of another flow's event name.
- Every new export needs TSDoc. Flag new exported symbols with no TSDoc comment.
- Work that belongs to a larger unreleased feature ships behind an `@alpha` TSDoc tag and an `UnstableFeatures` flag, so integrators can't reach it by accident. If the diff adds a new, clearly unfinished public capability with neither, mention it as a question, not a defect.

## 8. State machines

A public, standalone component with its own robot3 state machine must not model completion as a final state (`final()`, or a `state()` with no transitions). If the host app keeps the component mounted after completion, a final state leaves a screen that looks interactive but ignores every input. Completion should bubble up through `onEvent` without moving the local machine into a dead state. Top-level guided `*Flow` orchestrators are allowed to use a final state.

## 9. Code style

- No `!important` in CSS or SCSS.
- No `as SomeType` casts where a type guard, discriminated-union narrowing, or a generic would work.
- No `!` non-null assertions, in source or in tests.
- No `useMemo`, `useCallback`, or `React.memo` without a demonstrated or obvious performance problem.
- No comments other than TSDoc on exports, TODO/FIXME for temporary workarounds, and legal notices.
- Do not add `@use` imports in `.module.scss` files for modules that the build injects globally (for example `@/styles/Helpers`).

## 10. Partner-facing documentation

Files under `docs/` are read by developers integrating the SDK.

- The reader is the integrator. Flag text that refers to "partners" in the third person. Second person ("you") or neutral wording is right.
- Flag text that speculates about the integrator's app or workflow ("in your onboarding wizard", "captured on a previous step").
- Code samples must compile against the published package only. Flag `@/` import aliases or internal helpers in samples.

## 11. Public repository hygiene

This repository is public. Flag any added content that should not be public:

- Real-looking personal data in fixtures, stories, or tests: names paired with SSNs, EINs, bank or card numbers, dates of birth, wages, home addresses, phone numbers, or personal email addresses. Synthetic data that is obviously fake is fine.
- Secrets: API keys, tokens, passwords, private keys, connection strings.
- Names of the company's customers or business partners, internal hostnames, or links to internal-only tools and repositories.

Treat findings in this section as the highest severity. Do not quote the sensitive value in your review. Name the file and line only.

## What not to flag

- Formatting, import order, or anything Prettier or ESLint already enforces.
- Type errors the compiler will catch.
- Style preferences that are not in the list above.
- Generated files, lockfiles, and snapshots.
- Anything you can't tie to a specific added or changed line.

If you are not confident that a convention is broken, leave it out. A finding that turns out to be wrong costs the author more time than a missed nit.
