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

Reference implementation: `Employee.Profile` — see `AdminProfile.tsx`, `EmployeeProfile.tsx`, and `Profile.tsx`. If the Profile migration has not been merged to main yet, reference PR #1570 or branch `sdk-777-profile-hook-migration`.

Hooks reference: `.claude/hooks-implementation.md` — covers schema, fields, hook internals, error handling, and exports in detail. Read it before starting a migration.

## 1. Component Structure

### Entry Point

The public component wraps `BaseBoundaries` and forks to inner components as needed. `onEvent` is passed as a prop — do NOT use `BaseComponent` or `useBase()`.

```tsx
export function MyComponent({
  FallbackComponent,
  ...props
}: MyComponentProps & BaseComponentInterface) {
  return (
    <BaseBoundaries componentName="Domain.MyComponent" FallbackComponent={FallbackComponent}>
      {props.employeeId ? (
        <RootWithEmployee {...props} employeeId={props.employeeId} />
      ) : (
        <Root {...props} />
      )}
    </BaseBoundaries>
  )
}
```

`BaseBoundaries` provides:

- `QueryErrorResetBoundary` — resets React Query errors on retry
- `ErrorBoundary` — catches render errors, shows `FallbackComponent`
- `Suspense` — shows loading indicator while suspense queries resolve

Unlike `BaseComponent`, `BaseBoundaries` does NOT provide `BaseContext`. This means:

- `onEvent` is passed as a prop through to inner components, not accessed via `useBase()`
- Error state is managed by the hooks' `errorHandling` bags, not `BaseContext`
- `BaseLayout` is used explicitly inside the inner component for loading/error display

### Suspense Boundary

`BaseBoundaries` provides a `Suspense` boundary. This is needed for `useI18n` / `useTranslation` and similar hooks that suspend. Prefer non-suspense queries for data fetching — the form hooks use regular queries internally and manage their own loading states via `isLoading`.

### Inner Component Split

When admin and self-service flows have significantly different field visibility, validation, or submission logic, split into separate components (e.g. `AdminProfile` / `EmployeeProfile`) rather than a single component with many conditionals.

## 2. Hook Initialization

Initialize all hooks at the top of the inner component. Pass `shouldFocusError: false` to every hook — `composeSubmitHandler` manages cross-form focus.

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

Aggregate errors from all hooks into a single array:

```tsx
const allErrors = [
  ...employeeDetails.errorHandling.errors,
  ...homeAddress.errorHandling.errors,
  ...workAddress.errorHandling.errors,
]
```

### Loading Gate

When any hook is loading, render `BaseLayout` with `isLoading` and errors. This shows a loading indicator, or errors if a query failed (so users see a retry option instead of an infinite spinner):

```tsx
if (employeeDetails.isLoading || homeAddress.isLoading || workAddress.isLoading) {
  return <BaseLayout isLoading error={allErrors} />
}
```

### Ready State

Wrap the form content in `BaseLayout` with errors to display error alerts above the form:

```tsx
return (
  <section className={className}>
    <BaseLayout error={allErrors}>
      <Form onSubmit={composedHandler}>{/* form content */}</Form>
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

`composeSubmitHandler` validates all forms simultaneously, focuses the first invalid field across forms, and only calls `onAllValid` when every form passes.

```tsx
const activeForms = [employeeDetails, ...(showHomeAddress ? [homeAddress] : []), workAddress]

const composedHandler = composeSubmitHandler(activeForms, async () => {
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

- `activeForms` array determines which forms are validated — conditionally exclude forms whose sections are hidden
- Do NOT memoize `activeForms` or `composedHandler` — hook return values are not stable references
- Submit sequentially, checking each result — return early on failure to prevent cascading errors
- Update `resolvedEmployeeId` on partial failure in create mode

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

`onEvent` is received as a prop and threaded through to inner components — do NOT use `useBase()`:

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

- [ ] Entry point wraps `BaseBoundaries` (not `BaseComponent`) and forks to inner component(s)
- [ ] Suspense queries primed in wrapper above Root (if entity ID provided)
- [ ] All hooks initialized with `shouldFocusError: false`
- [ ] Errors aggregated from all hooks into single array
- [ ] Loading state uses `<BaseLayout isLoading error={allErrors} />`
- [ ] Ready state wraps content in `<BaseLayout error={allErrors}>`
- [ ] SDKFormProvider rules followed (no nesting, no mixing, no cross-hook fields)
- [ ] `composeSubmitHandler` used for multi-hook forms, not memoized
- [ ] Partial update recovery handled for create mode
- [ ] All field error codes have `validationMessages` for codes that can realistically fire
- [ ] `onEvent` passed as prop (not via `useBase()`)
- [ ] i18n namespaces loaded and translations consistent with prior component
- [ ] Dead code from old implementation removed
- [ ] All existing tests pass (`npm run test -- --run`)
