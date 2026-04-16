---
name: migrate-sdk-component-to-hooks
description: >-
  Migrate existing SDK components to the hook-based architecture. Use when
  refactoring a component to use form hooks (useEmployeeDetailsForm,
  useHomeAddressForm, useWorkAddressForm, useCompensationForm, etc.),
  composing multiple hooks in a single component, or wiring up BaseComponent,
  BaseLayout, SDKFormProvider, and composeSubmitHandler.
---

# Migrating SDK Components to Hook-Based Architecture

Reference implementation: `Employee.Profile` — see `AdminProfile.tsx`, `EmployeeProfile.tsx`, and `Profile.tsx`. If the Profile migration has not been merged to main yet, reference PR #1570 or branch `sdk-777-profile-hook-migration`.

Hooks reference: `.claude/hooks-implementation.md` — covers schema, fields, hook internals, error handling, and exports in detail. Read it before starting a migration.

## 1. Component Structure

### Entry Point

The public component wraps `BaseComponent` and forks to inner components as needed:

```tsx
export function MyComponent(props: MyComponentProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}
```

`BaseComponent` provides:

- `BaseContext` (access via `useBase()`) — gives `onEvent`, `baseSubmitHandler`, error state
- `BaseBoundaries` — `QueryErrorResetBoundary` + `ErrorBoundary` + `Suspense`
- Top-level `BaseLayout` — renders generic errors from `useBaseSubmit`

### Suspense Data Priming

If the component receives an entity ID, prime suspense queries in a wrapper above `Root` so data is cached before hooks run:

```tsx
function RootWithEmployee({ employeeId, ...props }) {
  useEmployeesGetSuspense({ employeeId })
  useEmployeeAddressesGetSuspense({ employeeId })
  return <Root {...props} employeeId={employeeId} />
}
```

Do NOT use suspense queries inside the inner component — hooks use regular queries internally. The suspense wrapper exists only to warm the cache within the `Suspense` boundary that `BaseComponent` provides.

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

Every field has typed error codes. Provide `validationMessages` to map codes to localized strings. Without it, the raw error code string (e.g. "REQUIRED") is displayed to the user.

```tsx
<EmployeeFields.Ssn
  label={t('ssnLabel')}
  validationMessages={{
    INVALID_SSN: t('validations.ssn', { ns: 'common' }),
    REQUIRED: t('validations.ssnRequired', { ns: 'common' }),
  }}
/>
```

TypeScript enforces required error codes. Optional error codes (second generic parameter) are allowed but not required — provide them for any code that can realistically fire.

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

Use `onEvent` from `useBase()` to emit component events:

```tsx
const { onEvent } = useBase()
// ...
onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, { ...data })
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

- [ ] Entry point wraps `BaseComponent` and forks to inner component(s)
- [ ] Suspense queries primed in wrapper above Root (if entity ID provided)
- [ ] All hooks initialized with `shouldFocusError: false`
- [ ] Errors aggregated from all hooks into single array
- [ ] Loading state uses `<BaseLayout isLoading error={allErrors} />`
- [ ] Ready state wraps content in `<BaseLayout error={allErrors}>`
- [ ] SDKFormProvider rules followed (no nesting, no mixing, no cross-hook fields)
- [ ] `composeSubmitHandler` used for multi-hook forms, not memoized
- [ ] Partial update recovery handled for create mode
- [ ] All field error codes have `validationMessages` for codes that can realistically fire
- [ ] Events emitted via `onEvent` from `useBase()`
- [ ] i18n namespaces loaded and translations consistent with prior component
- [ ] Dead code from old implementation removed
- [ ] All existing tests pass (`npm run test -- --run`)
