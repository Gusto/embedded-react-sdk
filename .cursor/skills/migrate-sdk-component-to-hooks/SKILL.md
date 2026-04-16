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

When composing hooks that create entities sequentially (e.g. create employee → create home address → create work address), track the created ID in state so that if a later step fails, retrying doesn't re-create the first entity:

```tsx
const [resolvedEmployeeId, setResolvedEmployeeId] = useState(employeeId)
```

Pass `resolvedEmployeeId` to downstream hooks. Update it in the submit handler after a successful create.

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

**For plain React Query fetches alongside hooks**, use `composeErrorHandler` to merge query errors, nested hook errors, and optional submit state from `useBaseSubmit`:

```tsx
const errorHandling = composeErrorHandler(
  [workAddressesQuery, employeeDetails, homeAddress], // mix of queries and hook results
  { submitError, setSubmitError }, // optional — from useBaseSubmit
)
```

The returned bag has `{ errors, retryQueries, clearSubmitError }`. Since the shape matches a hook's `errorHandling`, you can nest further by feeding a composed bag back in via `{ errorHandling }`.

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

### Adding Extra Queries or Submit State

If the component has React Query fetches outside the form hooks (e.g. a read-only lookup) or screen-level submit state from `useBaseSubmit`, feed them through `composeErrorHandler` alongside the composed submit result:

```tsx
const { handleSubmit, errorHandling: formsErrorHandling } = composeSubmitHandler(
  [employeeDetails, homeAddress],
  async () => {
    /* ... */
  },
)

const errorHandling = composeErrorHandler(
  [workAddressesQuery, { errorHandling: formsErrorHandling }],
  { submitError, setSubmitError }, // optional
)

return <BaseLayout error={errorHandling.errors}>{/* ... */}</BaseLayout>
```

## 6. Field Rendering

### Using Hook Fields

Each hook provides field components via `form.Fields`:

```tsx
const EmployeeFields = employeeDetails.form.Fields
const HomeAddressFields = homeAddress.form.Fields
```

### Conditional Fields

Fields that may not exist are `undefined` — guard with truthiness checks:

```tsx
{
  WorkAddressFields.EffectiveDate && <WorkAddressFields.EffectiveDate label={t('startDate')} />
}
```

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

When the component needs to react to field values (e.g. toggling sections based on a checkbox), use `useWatch` with the hook's `control`:

```tsx
const watchedValue = useWatch({
  control: hookResult.form.hookFormInternals.formMethods.control,
  name: 'fieldName',
})
```

For read-only access without re-renders on every change (e.g. reading at submit time), use `getFormSubmissionValues()`:

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

## 9. Cleanup Checklist

After migration, remove dead code from the component directory:

- [ ] Old monolithic form component files
- [ ] Old context providers (e.g. `ProfileContext`)
- [ ] Inline sub-components (e.g. `Head`, `Actions`, `WorkAddress`)
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
