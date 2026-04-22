---
name: migrate-sdk-component-to-hooks
description: >-
  Migrate existing SDK components to the hook-based architecture. Use when
  refactoring a component to use form hooks (useEmployeeDetailsForm,
  useHomeAddressForm, useWorkAddressForm, useCompensationForm, etc.),
  composing multiple hooks in a single component, or wiring up BaseBoundaries,
  BaseLayout, SDKFormProvider, and composeSubmitHandler.
---

# Migrating SDK Components to Hook-Based Architecture

Reference implementation: `PayScheduleForm` — PR #1545 or branch `sdk-774-pay-schedule-hook`. For hook composition, error aggregation, and `composeSubmitHandler` patterns, `AdminProfile` / `EmployeeProfile` on PR #1570 / branch `sdk-777-profile-hook-migration` are also useful.

Hooks reference: `.claude/hooks-implementation.md` — covers schema, fields, hook internals, error handling, and exports in detail. Read it before starting a migration.

## Core Principle: The Hook Owns the Business Logic

Before writing any logic in the component, read the hook. Hooks encapsulate field visibility, conditional requiredness, derived data, loading states, and submit behavior. The component is a thin rendering layer around whatever the hook already exposes.

Common anti-patterns to avoid:

- Reaching for `useWatch` to gate field visibility when the hook already returns the field as `undefined` when it shouldn't be shown
- Duplicating the hook's requiredness logic via component-level conditionals
- Querying an entity in the component when the hook is already fetching and exposing it via `data` or `status`
- Computing derived values (e.g. "is this schedule in create vs edit mode") in the component when the hook surfaces them

**Rule of thumb**: if you're writing business logic in the component that every partner using the hook would also need, that logic belongs in the hook. Stop, move it into the hook, and re-export it via the hook's return shape. The SDK component and partner code should look identical in terms of which fields are shown and when.

## 1. Component Structure

### Entry Point

The public component wraps `BaseBoundaries` and delegates to a single `Root` component that initializes the hook(s) and renders the form. `onEvent` is passed as a prop — do NOT use `BaseComponent` or `useBase()`. When admin and self-service flows diverge, create two separate public components rather than forking internally.

```tsx
interface MyComponentProps extends UseMyFormProps {
  onEvent: OnEventType<EventType, unknown>
}

export function MyComponent({ onEvent, ...hookProps }: MyComponentProps) {
  return (
    <BaseBoundaries componentName="Domain.MyComponent">
      <MyComponentRoot onEvent={onEvent} {...hookProps} />
    </BaseBoundaries>
  )
}

function MyComponentRoot({ onEvent, ...hookProps }: MyComponentProps) {
  const form = useMyForm(hookProps)
  // ...loading gate, handlers, render
}
```

`BaseBoundaries` provides:

- `QueryErrorResetBoundary` — resets React Query errors on retry
- `ErrorBoundary` — catches render errors, shows `FallbackComponent` if supplied
- `Suspense` — shows a loading indicator while suspense hooks (like `useI18n` / `useTranslation`) resolve

Unlike `BaseComponent`, `BaseBoundaries` does NOT provide `BaseContext`. This means:

- `onEvent` is passed as a prop through to the `Root` component, not accessed via `useBase()`
- Error state is managed by the hooks' `errorHandling` bags, not `BaseContext`
- `BaseLayout` is used explicitly inside `Root` for loading/error display

### Suspense Boundary

`BaseBoundaries` provides a `Suspense` boundary. This is needed for `useI18n` / `useTranslation` and similar hooks that suspend. Prefer non-suspense queries for data fetching — the form hooks use regular queries internally and manage their own loading states via `isLoading`.

## 2. Hook Initialization

Initialize the hook(s) at the top of `Root`. When composing multiple form hooks, pass `shouldFocusError: false` to every hook so `composeSubmitHandler` manages cross-form focus instead of each hook competing for it.

```tsx
const employeeDetails = useEmployeeDetailsForm({
  companyId,
  employeeId,
  optionalFieldsToRequire,
  shouldFocusError: false,
})

const homeAddress = useHomeAddressForm({
  employeeId,
  shouldFocusError: false,
})
```

### Partial Update Recovery (Create Mode)

When composing hooks that create entities sequentially (e.g. create employee → create home address → create work address), a mid-sequence failure can leave the first entity created and the downstream ones not. Without recovery, a retry would create a second root entity.

Three rules keep this correct and non-disruptive:

**1. Prefer the onSubmit escape hatch over component state.** Hooks typically accept an entity id as an `onSubmit` argument so a downstream hook can target a just-created parent without the component having to thread it through props. Use that first:

```tsx
const employeeResult = await employeeDetails.actions.onSubmit()
if (!employeeResult) return
await homeAddress.actions.onSubmit({ employeeId: employeeResult.data.uuid })
```

**2. Defer to the partner for id updates on success.** When creation succeeds, emit the created entity via `onEvent` and let the partner decide what to do — usually navigate away or pass the new id back through props. Do **not** stash the id in component state on success. Storing it triggers a re-render mid-submission, which can flip the hook back into loading state and unmount the form under the user.

**3. Only flip to update mode internally on failure.** If a create partially fails (root created, child errored), then — and only then — capture the created id in state so a retry targets the existing root instead of creating a duplicate:

```tsx
const [resolvedEmployeeId, setResolvedEmployeeId] = useState(employeeId)

// In the composed submit handler:
const employeeResult = await employeeDetails.actions.onSubmit()
if (!employeeResult) return

const newId = employeeResult.data.uuid

const homeResult = await homeAddress.actions.onSubmit({ employeeId: newId })
if (!homeResult) {
  if (!employeeId) setResolvedEmployeeId(newId) // recovery only
  return
}
// success path: no setState — partner navigates / re-renders via onEvent
```

Pass `resolvedEmployeeId` to downstream hooks so retries reuse the created root. `Employee.Profile` is the reference for this pattern.

### Consuming the Submit Result

Hook `onSubmit` actions return a `HookSubmitResult<Entity>` with the created/updated entity in `result.data`. Two conventions follow from this:

**1. Prefer `result.data` over callback arguments.** Do not add a callback argument to `onSubmit` for the sole purpose of exposing the final result — the return value already carries it:

```tsx
// Correct: read result.data directly
const result = await signForm.actions.onSubmit()
if (result) {
  onEvent(companyEvents.COMPANY_SIGN_FORM_DONE, result.data)
}
```

Callbacks on `onSubmit` are only appropriate when a hook makes **multiple sequential API calls** and partners need access to intermediate results that aren't otherwise surfaced in the final return value. `useEmployeeDetailsForm` and `useCompensationForm` are reference cases — they expose `onEmployeeCreated` / `onJobCreated` etc. so a partner can react between the create-employee and update-onboarding-status calls, or between job and compensation updates.

Rule of thumb: if the hook's `onSubmit` wraps a single mutation, drop the callbacks interface entirely — `result.data` already carries everything the consumer needs.

**2. Event shape mirrors the submit shape.** How many events a component emits should match how many API calls it made — not be padded with a redundant completion-only event.

_Single API call_ — emit one `_DONE` event carrying `result.data`. No separate "entity created" event:

```tsx
// Single mutation: one event delivers both completion and the resulting entity
onEvent(companyEvents.COMPANY_SIGN_FORM_DONE, result.data)
onEvent(componentEvents.EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE, result.i9Authorization)
onEvent(informationRequestEvents.INFORMATION_REQUEST_FORM_DONE, response.informationRequest)

// Anti-pattern: splitting the single mutation across two events
onEvent(events.SOMETHING, result.data)
onEvent(events.SOMETHING_DONE) // redundant
```

_Multiple API calls_ — emit one intermediate event per call (from the hook callbacks or from each hook's `result.data`), then a final `_DONE` for overall completion. The `_DONE` payload is whatever the partner needs at that boundary — typically the root entity, or a merged shape if other values are needed alongside it:

```tsx
// AdminProfile reference: employee + addresses + start date
const employeeResult = await employeeDetails.actions.onSubmit({
  onEmployeeCreated: emp => onEvent(componentEvents.EMPLOYEE_CREATED, emp),
  onEmployeeUpdated: emp => onEvent(componentEvents.EMPLOYEE_UPDATED, emp),
  onOnboardingStatusUpdated: s => onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, s),
})
if (!employeeResult) return

const homeResult = await homeAddress.actions.onSubmit({ employeeId: newEmployeeId })
if (!homeResult) return
onEvent(
  homeResult.mode === 'create'
    ? componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED
    : componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED,
  homeResult.data,
)

// ...work address submits with its own callbacks...

onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, { ...employeeResult.data, startDate })
```

Rule of thumb: **one API call = one event (the `_DONE`, carrying the entity). Multiple API calls = one event per call + a terminal `_DONE`.** Reserve additional events for genuinely distinct user-facing milestones that aren't tied to a submission (e.g. `COMPANY_VIEW_FORM_TO_SIGN` fires when a form is opened, not when it's submitted). `EmployeeProfile` and `AdminProfile` are the reference cases for multi-call event shape; `SignatureForm`, `EmploymentEligibility`, and `InformationRequestForm` are the reference cases for single-call event shape.

## 3. Loading and Error States with BaseLayout

### Error Aggregation

Prefer `composeErrorHandler` / `composeSubmitHandler` over manual array spreading. These helpers produce a single `HookErrorHandling` bag — the same shape every SDK hook returns — that drives `BaseLayout`'s error alert, retry, and clear-submit-error behavior.

**For multiple form hooks composed on a page**, use `composeSubmitHandler` — it returns both the submit handler and an aggregated `errorHandling` covering every form passed in:

```tsx
const { handleSubmit, errorHandling } = composeSubmitHandler(
  [employeeDetails, homeAddress, workAddress],
  async () => {
    /* submit sequence */
  },
)
```

**For plain React Query fetches alongside hooks**, use `composeErrorHandler` to merge query errors and nested hook errors:

```tsx
const errorHandling = composeErrorHandler([workAddressesQuery, employeeDetails, homeAddress]) // mix of queries and hook results
```

The returned bag has `{ errors, retryQueries, clearSubmitError }`. Since the shape matches a hook's `errorHandling`, you can nest further by feeding a composed bag back in via `{ errorHandling }`.

The second argument — `{ submitError, setSubmitError }` from `useBaseSubmit` — is only relevant when the component itself runs a submit via `useBaseSubmit`. In a fully hook-driven migration the form hooks own their own submit state, so this can be omitted. Include it only if you have a screen-level submit outside the form hooks that needs to surface errors through the same `BaseLayout`.

### Loading Gate

When any hook is loading, render `BaseLayout` with `isLoading` and the composed errors. This shows a loading indicator, or errors if a query failed (so users see a retry option instead of an infinite spinner):

```tsx
if (employeeDetails.isLoading || homeAddress.isLoading || workAddress.isLoading) {
  return <BaseLayout isLoading error={errorHandling.errors} />
}
```

### Ready State

Wrap the form content in `BaseLayout` with the composed errors to display error alerts above the form:

```tsx
return (
  <section className={className}>
    <BaseLayout error={errorHandling.errors}>
      <Form onSubmit={handleSubmit}>{/* form content */}</Form>
    </BaseLayout>
  </section>
)
```

`BaseLayout` renders:

- Loading indicator when `isLoading` is true and no errors
- Error alert(s) above children when errors are present
- Just children when neither loading nor errored

## 4. SDKFormProvider and formHookResult Prop

Hook fields need form context (react-hook-form `Control`, fields metadata, errors). Two ways to provide it:

### SDKFormProvider

Wraps a contiguous group of fields from **one** hook. Provides `FormProvider` + `FormFieldsMetadataProvider` + API field error syncing.

```tsx
<SDKFormProvider formHookResult={workAddress}>
  <WorkAddressFields.Location label={t('workAddress')} />
  <WorkAddressFields.EffectiveDate label={t('startDate')} />
</SDKFormProvider>
```

### formHookResult Prop

Pass the hook result directly to each field. Use when fields from one hook are scattered across the layout (interleaved with other hooks' fields or non-field UI).

```tsx
<EmployeeFields.FirstName
  label={t('firstName')}
  formHookResult={employeeDetails}
  validationMessages={{ REQUIRED: t('validations.firstName') }}
/>
```

`FormHookResult` types `control` as `unknown` so any hook result is assignable without casts or generics. The single `as Control` cast lives inside `useHookFieldResolution`.

### Rules

1. **Do NOT nest `SDKFormProvider`s** — use sibling providers for different hooks
2. **Do NOT use both approaches for the same hook** — pick `SDKFormProvider` or `formHookResult` prop per hook, not both
3. **Do NOT render fields from a different hook inside an `SDKFormProvider`**

When a hook's fields are split across the layout, use `formHookResult` prop on **all** of that hook's fields.

## 5. Composing Submissions with composeSubmitHandler

`composeSubmitHandler` validates all forms simultaneously, focuses the first invalid field across forms, and only calls `onAllValid` when every form passes. It returns `{ handleSubmit, errorHandling }` — the `errorHandling` aggregates every form's error state so you can drive a single `BaseLayout` from it.

```tsx
const activeForms = [employeeDetails, ...(showHomeAddress ? [homeAddress] : []), workAddress]

const { handleSubmit, errorHandling } = composeSubmitHandler(activeForms, async () => {
  const employeeResult = await employeeDetails.actions.onSubmit({
    /* callbacks */
  })
  if (!employeeResult) return

  const newId = employeeResult.data.uuid

  if (showHomeAddress) {
    const homeResult = await homeAddress.actions.onSubmit({ employeeId: newId })
    if (!homeResult) {
      if (!employeeId) setResolvedEmployeeId(newId)
      return
    }
  }

  await workAddress.actions.onSubmit(
    {
      /* callbacks */
    },
    { employeeId: newId },
  )
})
```

Key points:

- `activeForms` array determines which forms are validated and contributes to `errorHandling` — conditionally exclude forms whose sections are hidden
- Do NOT memoize `activeForms` or the `composeSubmitHandler` result — hook return values are not stable references
- Submit sequentially, checking each result — return early on failure to prevent cascading errors
- Update `resolvedEmployeeId` on partial failure in create mode
- Pass `errorHandling.errors` to `BaseLayout` for a unified error surface across all forms

### Adding Extra Queries

If the component has React Query fetches outside the form hooks (e.g. a read-only lookup), feed them through `composeErrorHandler` alongside the composed submit result:

```tsx
const { handleSubmit, errorHandling: formsErrorHandling } = composeSubmitHandler(
  [employeeDetails, homeAddress],
  async () => {
    /* ... */
  },
)

const errorHandling = composeErrorHandler([
  workAddressesQuery,
  { errorHandling: formsErrorHandling },
])

return <BaseLayout error={errorHandling.errors}>{/* ... */}</BaseLayout>
```

Pass `{ submitError, setSubmitError }` from `useBaseSubmit` as the second argument only if the component runs its own screen-level submit outside the form hooks. Most hook-driven migrations won't need it — the form hooks manage their own submit state.

## 6. Field Rendering

### Using Hook Fields

Each hook provides field components via `form.Fields`:

```tsx
const EmployeeFields = employeeDetails.form.Fields
const HomeAddressFields = homeAddress.form.Fields
```

### Conditional Fields

**The hook controls field visibility.** When a field shouldn't be shown, the hook returns it as `undefined` on `form.Fields`. Guard with a truthiness check and render — do **not** use `useWatch` or component-level state to decide whether a field should appear:

```tsx
{
  WorkAddressFields.EffectiveDate && <WorkAddressFields.EffectiveDate label={t('startDate')} />
}
```

If you find yourself manually gating visibility based on another field's value, that logic almost certainly belongs inside the hook's schema or `Fields` selection. Move it there instead of reproducing it per-component.

### Validation Messages

Every field has typed error codes defined in its `fields.tsx`. Without `validationMessages`, the raw error code string (e.g. "REQUIRED") is displayed to the user.

#### How error code typing works

Field components have two generic parameters: `TErrorCode` (required keys) and `TOptionalErrorCode` (optional keys). The `ValidationMessages` type requires all `TErrorCode` keys and allows `TOptionalErrorCode` keys:

```typescript
// In fields.tsx — error codes derived from the schema's error codes constant
export type SsnValidation = typeof ErrorCodes.INVALID_SSN // required key
export type SsnRequiredValidation = typeof ErrorCodes.REQUIRED // optional key

export type SsnFieldProps = HookFieldProps<
  TextInputHookFieldProps<SsnValidation, SsnRequiredValidation>
  //                        ^required       ^optional
>
```

TypeScript enforces that all required keys are present. Optional keys are allowed but not enforced — provide them for any code that can realistically fire.

#### Wiring up validationMessages

Every field rendered in the component should have `validationMessages` covering all error codes that can fire. Check the field's type definition in `fields.tsx` to see which codes are required vs optional, then provide localized translations for each:

```tsx
<EmployeeFields.FirstName
  label={t('firstName')}
  validationMessages={{
    REQUIRED: t('validations.firstName'),      // required key — TypeScript enforces this
    INVALID_NAME: t('validations.firstName'),   // required key — TypeScript enforces this
  }}
/>

<EmployeeFields.Ssn
  label={t('ssnLabel')}
  validationMessages={{
    INVALID_SSN: t('validations.ssn', { ns: 'common' }),        // required key
    REQUIRED: t('validations.ssnRequired', { ns: 'common' }),   // optional key — but fires when field is required
  }}
/>
```

#### Translation placement

Validation translations should live in the component's translation namespace (e.g. `Employee.Profile.json`) or the `common.json` namespace for messages shared across components (e.g. SSN format, date of birth required). When migrating, check the existing component's translations and keep them consistent to avoid breaking changes.

#### When validationMessages can be omitted

- Fields whose error codes can never fire (e.g. `MiddleInitial` with `requiredFieldsConfig: 'never'` and no format validator)
- Boolean fields (checkbox/switch) — always have a value so `REQUIRED` never fires

### Watching Form Values

`useWatch` is a last resort — reach for it only when the reactive behavior is genuinely presentational and has no business meaning (e.g. showing a non-functional preview panel). Anything that affects which fields render, which are required, or which get submitted belongs in the hook.

When `useWatch` is the right tool, use it with the hook's `control`:

```tsx
const watchedValue = useWatch({
  control: hookResult.form.hookFormInternals.formMethods.control,
  name: 'fieldName',
})
```

For read-only access at submit time (no re-renders on change), use `getFormSubmissionValues()`:

```tsx
const startDate = workAddress.form.getFormSubmissionValues()?.effectiveDate
```

## 7. i18n

- Call `useI18n('Namespace')` for each translation namespace the component uses
- Call `useComponentDictionary('Namespace', dictionary)` to merge partner overrides
- Use `useTranslation('Namespace')` for the `t` function
- Keep translations consistent with the existing component to avoid breaking changes

## 8. Events

`onEvent` is received as a prop on the public component and passed through to `Root` — do NOT use `useBase()`:

```tsx
function Root({ onEvent, ...props }: MyComponentProps) {
  // ...
  onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, { ...data })
}
```

## 9. Cleanup: Legacy Patterns to Remove

The pre-hook components were built around a pattern that split a single screen into inline sub-components (`Head`, `Actions`, specific field groups like `WorkAddress`, `HomeAddress`, `PersonalDetails`) backed by a domain context (e.g. `ProfileContext`) to thread form state, handlers, and flags between them. A thin monolithic file then wired everything together.

The hook + `Root` shape replaces that entirely:

- The hook owns state, validation, and submit logic
- `Root` is the view layer that composes the hook and renders fields inline

There's no longer a reason to split a single screen into `Head` / `Actions` / per-section files, and no reason for a sibling context to share form state — the hook result is the shared state. Keep `Root` as a flat, readable component. Only extract presentational fragments when they're genuinely reused or independently testable, not as a reflex.

After migration, remove:

- [ ] Old monolithic form component files
- [ ] Inline sub-components (`Head`, `Actions`, per-section field groupings) — their contents move into `Root`
- [ ] Domain context providers (e.g. `ProfileContext`) that existed to share form state across those sub-components
- [ ] Helper utilities only used by the old implementation
- [ ] Tests for deleted helpers
- [ ] Unused imports in barrel files

## 10. Migration Checklist

- [ ] Public component wraps `BaseBoundaries` (not `BaseComponent`) and delegates to a single `Root`
- [ ] All hooks initialized with `shouldFocusError: false`
- [ ] Errors composed via `composeSubmitHandler` (multi-form) and/or `composeErrorHandler` (extra queries / submit state) rather than manual array spreading
- [ ] Loading state uses `<BaseLayout isLoading error={errorHandling.errors} />`
- [ ] Ready state wraps content in `<BaseLayout error={errorHandling.errors}>`
- [ ] SDKFormProvider rules followed (no nesting, no mixing, no cross-hook fields)
- [ ] `composeSubmitHandler` used for multi-hook forms, not memoized
- [ ] Partial update recovery handled for create mode
- [ ] All field error codes have `validationMessages` for codes that can realistically fire
- [ ] `onEvent` passed as prop (not via `useBase()`)
- [ ] i18n namespaces loaded and translations consistent with prior component
- [ ] Dead code from old implementation removed
- [ ] All existing tests pass (`npm run test -- --run`)
