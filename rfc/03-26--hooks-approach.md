# RFC: React Hooks for Embedded SDK Partner Flexibility

**Status:** Implemented (UNSTABLE)  |  **Authors:** SDK Team  |  **Date:** March 2026 (updated April 2026)

> This RFC is a follow-up to [11-25--ui-flexibility-exploration](./11-25--ui-flexibility-exploration.md), which proposed a Provider + hooks approach and identified a pure hooks alternative. After prototyping, we moved forward with hooks. This document describes the approach based on working implementations that are currently shipping under the `UNSTABLE_` namespace. See [PR #1239](https://github.com/Gusto/embedded-react-sdk/pull/1239) for the original implementation; subsequent PRs have expanded the hook inventory and refined the shared infrastructure.

---

## Background

Partners hit a **customization ceiling** when they need to go beyond surface-level styling. Reordering fields, hiding sections, composing non-standard layouts, building rich table interactions, or integrating opinionated design systems — their options today are CSS hacks, empty-translation-key tricks, or abandoning the SDK for the raw API.

Multiple feedback items across strategic partners confirm this pattern:

| Theme | Prevalence |
|---|---|
| Layout & field-level control | Multiple partners |
| Component composability | All surveyed partners |
| Adapter system gaps | Multiple partners |

Key signals:
- A partner engineer submitted a PR to publish an internal hook: _"The more the SDK is like lego blocks (composable) the better."_
- Another partner explicitly requested hooks and a headless mode — their designs require divorcing UI from logic.
- Partners want to move navigation buttons out of forms, rearrange address fields into custom layouts, and hide specific fields.

Hooks fill the gap between "components with adapters" and "abandon the SDK for raw API":

```
[SDK Components] ──> [Components + Adapters] ──> [Hooks] ──> [Raw API]
 Theme tokens        Component adapters          Full UI control
 Translations        Custom controls             Own design system
```

---

## Proposal

Export **React hooks** from the SDK's `UNSTABLE_` namespace that decouple data-fetching, form management, validation, and business logic from rendering. Partners own the pixels; the SDK owns the data.

Each hook bundles: **data** (query results, derived state, loading/error), **mutations** (wrapped API calls), **form support** (Zod schemas, react-hook-form, field components), and **business logic** (conditional visibility, workflow guards).

### Current Hook Inventory

| Hook | Domain | Type |
|---|---|---|
| `useCompensationForm` | Employee compensation (job, FLSA, rate, pay unit) | Form |
| `useEmployeeDetailsForm` | Employee profile (name, email, SSN, DOB) | Form |
| `useWorkAddressForm` | Employee work address (location, effective date) | Form |
| `useHomeAddressForm` | Employee home address (street, city, state, zip) | Form |
| `usePayScheduleForm` | Company pay schedule (frequency, anchor dates) | Form |
| `useSignCompanyForm` | Company signatory forms (signature, confirmation) | Form |
| `useSignEmployeeForm` | Employee signatory forms + I-9 preparer support | Form |

All hooks are exported from `import { ... } from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'`.

### Division of Responsibilities

| Concern | SDK (hooks) | Partner |
|---|---|---|
| API calls & orchestration | Owned by hooks | — |
| Domain logic & business rules | Owned by hooks (conditional fields, derived state, calculations) | — |
| Form validation schemas | Owned by hooks (Zod schemas, error codes) | — |
| Form state management | Owned by hooks (react-hook-form initialization, default values, sync) | — |
| Field components | Provided by hooks as composable building blocks | Partner renders them in any order/layout |
| Field requiredness configuration | SDK provides defaults per mode; partners can promote optional fields to required via `optionalFieldsToRequire` | Partner configures per their product requirements |
| Translations & copy | — | Fully partner-owned; hooks emit error codes, not strings; `getOptionLabel` lets partners customize labels for enumerated values |
| Layout & styling | — | Fully partner-owned |
| Loading & error UX | `errorHandling` bag available in both loading and ready states | Partner chooses how to present errors and loading states |
| Navigation & flow orchestration | — | Partner manages routing between steps |

The guiding principle: hooks should never contain user-facing strings or layout opinions. Where we do provide UI helpers (field components, form providers), every piece should be fully customizable. Partners should never need to replicate complex API orchestration, validation rules, domain calculations, or business logic like conditional field visibility — that complexity is absorbed by the hook so partners can focus on their UI.

---

## Implementation

### 1. Fetch Hook (Data-Only)

The simplest category — no form management. `usePayrollConfiguration` is the reference.

Without this hook, a partner building a payroll configuration table would need to: coordinate multiple API calls (employees list, payroll prepare, pay schedules, blockers), join employee records against their compensation data, compute derived values like gross pay (which factors in pay rate, payment unit, pay period, pay schedule, and off-cycle status), break out regular hours vs. overtime vs. PTO, sum additional earnings and reimbursements, manage paginated fetching with data synchronization between endpoints, poll for async calculation status, and handle skip/unskip mutations with cache invalidation. The hook absorbs all of this and returns enriched, UI-ready data:

```tsx
function PayrollConfigPage({ companyId, payrollId }: Props) {
  const payroll = usePayrollConfiguration({ companyId, payrollId })
  if (payroll.isLoading) return <MyLoadingSkeleton />

  const { data, pagination, onCalculate, onSkipEmployee } = payroll

  return (
    <MyLayout>
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Gross Pay</th>
            <th>Total Hours</th>
            <th>Regular</th>
            <th>Overtime</th>
            <th>PTO</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.employeeCompensations.map(emp => (
            <tr key={emp.employeeUuid}>
              <td>{emp.firstName} {emp.lastName}</td>
              <td>${emp.grossPay.toFixed(2)}</td>
              <td>{emp.totalHours}</td>
              <td>{emp.regularHours}</td>
              <td>{emp.overtimeHours}</td>
              <td>{emp.totalPtoHours}</td>
              <td>
                {emp.excluded
                  ? <button onClick={() => payroll.onUnskipEmployee(emp.employeeUuid)}>Unskip</button>
                  : <button onClick={() => onSkipEmployee(emp.employeeUuid)}>Skip</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <MyPagination {...pagination} />
      <MyButton onClick={onCalculate} loading={payroll.isPendingCalculatePayroll}>
        Calculate Payroll
      </MyButton>
    </MyLayout>
  )
}
```

### 2. Form Hook Anatomy

Form hooks manage schema-driven validation, form state, field components, and API submission. Every form hook follows a consistent 4-file structure:

```
hooks/use{Domain}Form/
├── use{Domain}Form.tsx      # Main hook: data fetching, form setup, return shape
├── {domain}Schema.ts        # Zod schema, error codes, form data/output types
├── fields.tsx               # Domain field components + exported field prop types
├── {Domain}Form.tsx          # Prebuilt component wrapping the hook (for convenience + regression testing)
└── index.ts                 # Barrel file
```

#### Schema — `buildFormSchema` Pattern

Each schema follows a 4-part structure: **error codes → field validators → required fields config → schema factory**. The `buildFormSchema` utility handles the mechanics of wrapping fields with optional/required logic, deriving metadata, and composing cross-field validation.

**Error codes** — Zod schemas emit error *codes* (not messages), keeping validation translation-agnostic:

```typescript
export const CompensationErrorCodes = {
  REQUIRED: 'REQUIRED',
  RATE_MINIMUM: 'RATE_MINIMUM',
  RATE_EXEMPT_THRESHOLD: 'RATE_EXEMPT_THRESHOLD',
  PAYMENT_UNIT_OWNER: 'PAYMENT_UNIT_OWNER',
  PAYMENT_UNIT_COMMISSION: 'PAYMENT_UNIT_COMMISSION',
  RATE_COMMISSION_ZERO: 'RATE_COMMISSION_ZERO',
} as const

export type CompensationErrorCode =
  (typeof CompensationErrorCodes)[keyof typeof CompensationErrorCodes]
```

**Field validators** — Define all field validators once. Fields that need runtime coercion (e.g., number inputs that produce `NaN`, radio groups that deliver `'true'`/`'false'` strings) use `z.preprocess`:

```typescript
const fieldValidators = {
  jobTitle: z.string(),
  flsaStatus: z.enum([FlsaStatus.EXEMPT, FlsaStatus.NONEXEMPT, /* ... */]),
  rate: z.preprocess(coerceNaN(0), z.number()),
  startDate: z.preprocess(coerceToISODate, z.iso.date().nullable()),
  stateWcCovered: z.preprocess(coerceStringBoolean, z.boolean()),
  adjustForMinimumWage: z.boolean(),
  // ...
}

export type CompensationFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
```

**Required fields config** — Declares requiredness rules per field. Fields not listed default to `'always'` required:

| Rule | Meaning | Partner-configurable? |
|---|---|---|
| `'always'` | Required in both modes (default when omitted) | No |
| `'create'` | Required on create, optional on update | Yes — via `optionalFieldsToRequire` |
| `'update'` | Required on update, optional on create | Yes — via `optionalFieldsToRequire` |
| `'never'` | Optional in both modes | Yes — via `optionalFieldsToRequire` |
| `(data, mode) => boolean` | Conditionally required based on runtime form values | No |

```typescript
const requiredFieldsConfig = {
  jobTitle: 'create',
  rate: 'create',
  startDate: 'create',
  minimumWageId: data => data.adjustForMinimumWage,
  stateWcClassCode: data => String(data.stateWcCovered) === 'true',
} satisfies RequiredFieldConfig<typeof fieldValidators>
```

**Schema factory** — Returns a `[schema, metadataConfig]` tuple. The schema goes to `zodResolver`; `metadataConfig` feeds `useDeriveFieldsMetadata` to reactively derive `isRequired` from form state:

```typescript
export type CompensationOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

export function createCompensationSchema(options: CompensationSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, withStartDateField = true } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: CompensationErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    excludeFields: withStartDateField ? [] : ['startDate'],
    superRefine: validateFlsaRules,
  })
}
```

#### react-hook-form — `values` + `resetOptions` Pattern

The hook initializes react-hook-form with the Zod resolver and uses `values` + `resetOptions: { keepDirtyValues: true }` to sync server data — react-hook-form deep-compares and updates when data changes while preserving user edits. This replaces the earlier manual `useEffect` + `reset()` pattern:

```typescript
const [schema, metadataConfig] = useMemo(
  () => createCompensationSchema({ mode, optionalFieldsToRequire, withStartDateField }),
  [mode, optionalFieldsToRequire, withStartDateField],
)

const formMethods = useForm<CompensationFormData, unknown, CompensationFormOutputs>({
  resolver: zodResolver(schema),
  mode: validationMode,
  shouldFocusError,
  defaultValues: resolvedDefaults,
  values: resolvedDefaults,
  resetOptions: { keepDirtyValues: true },
})
```

Partners never call `useForm` themselves — they receive `Fields` to render and `onSubmit` to wire up.

Three hook parameters give partners control over form behavior:

- **`defaultValues`** — Optional initial values for the form. When provided, these are merged with the hook's built-in defaults. Useful when a partner wants to pre-populate fields from their own data source (e.g., values collected in a previous step of their onboarding flow). Once API data loads, the form syncs to the server values while preserving user edits to dirty fields.
- **`validationMode`** — Controls when validation fires. Defaults to `'onSubmit'` but partners can pass `'onBlur'`, `'onChange'`, or `'onTouched'` to match their UX preferences.
- **`optionalFieldsToRequire`** — Promotes optional fields to required on a per-mode basis. Only fields with `'create'`, `'update'`, or `'never'` rules are configurable — fields with `'always'` or function predicates are not offered:

```typescript
useCompensationForm({
  employeeId,
  optionalFieldsToRequire: {
    create: ['jobTitle', 'rate'],
    update: ['jobTitle'],
  },
})
```

#### Field Components

Each field is a thin wrapper that binds a `name` to a generic `*HookField` component (`TextInputHookField`, `SelectHookField`, `CheckboxHookField`, `NumberInputHookField`, `DatePickerHookField`, `RadioGroupHookField`, `SwitchHookField`). Fields accept `label`, `description`, `validationMessages`, and an optional `FieldComponent` prop to swap the underlying control:

```tsx
export function JobTitleField(props: JobTitleFieldProps) {
  return <TextInputHookField {...props} name="jobTitle" />
}
```

The `FieldComponent` prop is typed to the underlying control's props (e.g., `ComponentType<TextInputProps>` for text fields, `ComponentType<SelectProps>` for selects). By default, fields render using the SDK's built-in controls (which respect the component adapter). But if a partner needs a one-off customization — say, an autocomplete input instead of a plain text input — they can swap it without rebuilding the entire form:

```tsx
<Fields.JobTitle
  label="Job Title"
  validationMessages={{ REQUIRED: 'Please enter a job title' }}
  FieldComponent={MyAutocompleteInput}
/>
```

The partner's component receives the same props the default control would (`value`, `onChange`, `onBlur`, `errorMessage`, etc.), so it plugs in seamlessly.

#### Fields Metadata and `useDeriveFieldsMetadata`

Field components need data that only the hook has access to — select options from API responses, whether a field is required or disabled based on hook state, or whether a field has a redacted server-side value (e.g., SSN). Rather than forcing partners to pass all of this through field props, we provide form context alongside react-hook-form's.

The `useDeriveFieldsMetadata` hook takes the `metadataConfig` returned by the schema factory and the form's `control`, and reactively resolves `isRequired` for predicate-based rules by watching only the specific form fields that predicates read (auto-detected via a recording Proxy). The hook then enhances select/radio fields with `withOptions`:

```typescript
const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
const fieldsMetadata = {
  jobTitle: baseMetadata.jobTitle,
  flsaStatus: withOptions<FlsaStatusType>(baseMetadata.flsaStatus, flsaOptions, flsaStatusEntries),
  rate: { ...baseMetadata.rate, isDisabled: isCommissionOnly },
  paymentUnit: withOptions<PaymentUnit>(
    { ...baseMetadata.paymentUnit, isDisabled: isOwner || isCommissionOnly },
    paymentUnitOptions, paymentUnitEntries,
  ),
  // ...
}
```

For fields with select options, the `entries` array carries raw API objects so that `getOptionLabel` callbacks have full context:

```tsx
<Fields.FlsaStatus
  label="FLSA Status"
  validationMessages={{ REQUIRED: 'Required' }}
  getOptionLabel={(status) => myCustomFlsaLabels[status]}
/>
```

#### `SDKFormProvider`

`SDKFormProvider` is a shared component that wraps children with both react-hook-form's `FormProvider` and our `FormFieldsMetadataProvider`. It also runs `useSyncFieldErrors` to map server-side errors from the `errorHandling` bag onto react-hook-form field errors automatically:

```tsx
<SDKFormProvider formHookResult={form}>
  <Fields.JobTitle label="Job Title" validationMessages={{ REQUIRED: 'Required' }} />
  <Fields.Rate label="Rate" validationMessages={{ REQUIRED: 'Required', RATE_MINIMUM: '...' }} />
  <button type="submit">Save</button>
</SDKFormProvider>
```

This replaces the earlier per-hook `*FormProvider` pattern — all hooks use the same `SDKFormProvider`.

#### Return Shape (Discriminated Union)

Every form hook returns a discriminated union with a structured, nested shape. The `errorHandling` bag is available in **both** loading and ready states — this is critical because failed queries produce no data, so the hook stays in the loading branch, but `errorHandling.errors` will be populated, letting partners show error UI with a retry button instead of an infinite spinner:

```typescript
// Loading state
if (isDataLoading || !requiredData) {
  return { isLoading: true as const, errorHandling }
}

// Ready state
return {
  isLoading: false as const,
  data: { compensation, jobs, currentJob, minimumWages },
  status: { isPending, mode: 'create' | 'update' },
  actions: { onSubmit },
  errorHandling,
  form: {
    Fields: { JobTitle, FlsaStatus, Rate, /* some may be undefined */ },
    fieldsMetadata,
    hookFormInternals: { formMethods },
    getFormSubmissionValues,
  },
}
```

The `errorHandling` bag provides:
- `errors: SDKError[]` — combined query + submit errors, normalized into a consistent shape
- `retryQueries: () => void` — retries all failed data-fetching queries
- `clearSubmitError: () => void` — clears the stateful mutation error

#### Submit Handler

Submit handlers use `formMethods.handleSubmit` inside a `Promise` wrapper so `onSubmit` is async/awaitable, and delegate to `baseSubmitHandler` for error boundary integration. Each returns `HookSubmitResult<TEntity>`:

```typescript
const onSubmit = async (
  callbacks?: CompensationSubmitCallbacks,
  options?: CompensationSubmitOptions,
): Promise<HookSubmitResult<Compensation | undefined> | undefined> => { /* ... */ }
```

Simple hooks return the result only. Hooks that orchestrate multiple sequential API calls (e.g., `useCompensationForm` creates/updates a Job then updates a Compensation) accept optional **callbacks** for intermediate steps (`onJobCreated`, `onCompensationUpdated`) while still returning the final result.

#### Optional Entity IDs and Submit-Time Resolution

When a hook depends on an entity ID for both fetching and creating, the ID is optional in props and can be provided at submit time. This lets partners compose hooks without managing re-render cycles from prop changes:

```typescript
// Props — ID is optional
interface UseCompensationFormProps {
  employeeId?: string
  // ...
}

// Queries gated with enabled
const jobsQuery = useJobsAndCompensationsGetJobs(
  { employeeId: employeeId ?? '' },
  { enabled: !!employeeId },
)

// ID resolved at submit time
const resolvedEmployeeId = options?.employeeId ?? employeeId
```

In a composed form, creating an employee returns an ID that compensation and work address need. Passing the ID at submit time avoids triggering query refetching and tearing down the form UI.

#### Partner Usage

Full control over ordering, layout, and labels:

```tsx
function CustomCompensationPage({ employeeId }: Props) {
  const form = useCompensationForm({ employeeId })

  if (form.isLoading) return <MyLoadingState />
  const { Fields } = form.form

  return (
    <SDKFormProvider formHookResult={form}>
      <section>
        <h3>Position</h3>
        <Fields.JobTitle label="Job Title" validationMessages={{ REQUIRED: 'Required' }} />
        {Fields.FlsaStatus && (
          <Fields.FlsaStatus label="FLSA Status" validationMessages={{ REQUIRED: 'Required' }} />
        )}
        {Fields.StartDate && (
          <Fields.StartDate label="Start Date" validationMessages={{ REQUIRED: 'Required' }} />
        )}
      </section>

      <section>
        <h3>Compensation</h3>
        <Fields.Rate label="Pay Rate" validationMessages={{
          REQUIRED: 'Required',
          RATE_MINIMUM: 'Must be at least $1',
          RATE_EXEMPT_THRESHOLD: 'Below exempt salary threshold',
        }} />
        <Fields.PaymentUnit label="Per" validationMessages={{
          REQUIRED: 'Required',
          PAYMENT_UNIT_OWNER: 'Owners must use Paycheck',
          PAYMENT_UNIT_COMMISSION: 'Commission-only must use Year',
        }} />
      </section>

      <button onClick={() => form.actions.onSubmit()} disabled={form.status.isPending}>
        Save
      </button>
    </SDKFormProvider>
  )
}
```

Fields can be grouped, reordered, wrapped in partner markup, or placed in any layout — the hook doesn't care where they end up in the DOM.

### 3. Validation Messages and Error Handling

The schema, field components, and partner code work together through a shared set of **error codes**. This keeps validation logic in the schema, display strings with the partner, and the mapping between them type-safe.

**Step 1: Schema defines error codes as constants**

Each schema declares its possible error codes as a typed constant. These codes are what Zod emits as `message` values on validation failure — they are not user-facing strings.

```typescript
export const CompensationErrorCodes = {
  REQUIRED: 'REQUIRED',
  RATE_MINIMUM: 'RATE_MINIMUM',
  RATE_EXEMPT_THRESHOLD: 'RATE_EXEMPT_THRESHOLD',
} as const
```

**Step 2: Field component props are typed to require exactly the right codes**

Validation type aliases are derived from the error codes constant — never hardcoded:

```typescript
export type RequiredValidation = typeof CompensationErrorCodes.REQUIRED
export type RateValidation = (typeof CompensationErrorCodes)['REQUIRED' | 'RATE_MINIMUM' | 'RATE_EXEMPT_THRESHOLD']

export type JobTitleFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>
export type RateFieldProps = HookFieldProps<NumberInputHookFieldProps<RateValidation>>
```

TypeScript enforces that the partner supplies a translation for every possible code — no more, no less.

**Step 3: Field component resolves the current error code to the partner's string**

The `useFieldErrorMessage` helper reads the error code from react-hook-form state and maps it to the partner-provided message. This is handled internally by the generic `*HookField` components.

**Step 4: Partner supplies translated strings at render time**

```tsx
<Fields.Rate
  label={t('rate')}
  validationMessages={{
    REQUIRED: t('validation.required'),
    RATE_MINIMUM: t('validation.rateMinimum'),
    RATE_EXEMPT_THRESHOLD: t('validation.exemptThreshold'),
  }}
/>
```

If a partner omits a required code, TypeScript catches it at build time. If they provide their own i18n framework, it slots in naturally. The SDK never ships user-facing error strings.

#### Error Normalization

Errors come from multiple sources with different shapes: API errors, SDK validation errors, field-level validation errors from 422 responses, and unrecoverable errors. The `useErrorHandling` hook normalizes all of these into a single `SDKError[]` array via `collectErrors`. `SDKFormProvider` also runs `useSyncFieldErrors`, which maps server-side field errors from the `errorHandling` bag onto react-hook-form's field-level error state automatically — so partners who render fields get inline error messages without manual wiring.

### 4. Composing Multiple Forms

When a partner composes multiple forms, they need a single submit handler that coordinates validation across all of them. `composeSubmitHandler` does this: it triggers validation on every form simultaneously, waits for all results, and only calls the `onAllValid` callback if every form passes. If any form has errors, it walks through each form's fields in order and focuses the first invalid one — giving the user a clear starting point for correction. This is why each hook is initialized with `shouldFocusError: false`: react-hook-form's built-in focus only knows about its own form, but `composeSubmitHandler` manages focus across all of them.

```tsx
function EmployeeProfile({ employeeId, companyId }: Props) {
  const detailsForm = useEmployeeDetailsForm({ companyId, shouldFocusError: false })
  const addressForm = useHomeAddressForm({ shouldFocusError: false })
  const workForm = useWorkAddressForm({ companyId, employeeId, shouldFocusError: false })

  const isLoading = detailsForm.isLoading || addressForm.isLoading || workForm.isLoading
  if (isLoading) return <MyLoadingSkeleton />

  const isPending = detailsForm.status.isPending || addressForm.status.isPending || workForm.status.isPending

  const handleSubmit = composeSubmitHandler(
    [detailsForm, addressForm, workForm],
    async () => {
      const detailsResult = await detailsForm.actions.onSubmit()
      const resolvedId = detailsResult?.data.uuid ?? employeeId
      await addressForm.actions.onSubmit({ employeeId: resolvedId })
      await workForm.actions.onSubmit({ employeeId: resolvedId })
    },
  )

  return (
    <form onSubmit={handleSubmit}>
      <SDKFormProvider formHookResult={detailsForm}>
        {/* Employee details fields */}
      </SDKFormProvider>
      <SDKFormProvider formHookResult={addressForm}>
        {/* Home address fields */}
      </SDKFormProvider>
      <SDKFormProvider formHookResult={workForm}>
        {/* Work address fields */}
      </SDKFormProvider>
      <button type="submit" disabled={isPending}>Save All</button>
    </form>
  )
}
```

### 5. Conditional Field Rendering

Hooks return `undefined` for fields that shouldn't render based on form state or API data. The schema is also updated via `excludeFields` so hidden fields don't participate in validation:

```typescript
form: {
  Fields: {
    StartDate: withStartDateField ? StartDateField : undefined,
    FlsaStatus: isFlsaSelectionEnabled ? FlsaStatusField : undefined,
    AdjustForMinimumWage: isAdjustMinimumWageEnabled ? AdjustForMinimumWageField : undefined,
    MinimumWageId: isAdjustMinimumWageEnabled && watchedAdjustForMinimumWage
      ? MinimumWageIdField : undefined,
    TwoPercentShareholder: showTwoPercentStakeholder ? TwoPercentShareholderField : undefined,
    StateWcCovered: isWaState ? StateWcCoveredField : undefined,
    StateWcClassCode: isWaState && watchedStateWcCovered ? StateWcClassCodeField : undefined,
  },
}
```

```tsx
{Fields.FlsaStatus && <Fields.FlsaStatus label={t('flsaStatus')} validationMessages={...} />}
```

The hook owns the business logic for visibility; the partner just checks existence.

### 6. Prebuilt Components

Each hook ships a prebuilt component (`CompensationForm`, `EmployeeDetailsForm`, `WorkAddressForm`, etc.) that wraps the hook with SDK-provided labels, translations, and layout. These serve two purposes:

1. **Convenience** — Partners who don't need custom layouts can drop in the prebuilt component directly
2. **Regression testing** — The prebuilt component validates that the hook produces the same behavior as the stable component tier

Prebuilt components use `SDKFormProvider`, i18n translations, and fire `onEvent` callbacks based on the `HookSubmitResult`.

### 7. State Taxes — Predictably difficult

State taxes follow the same hook pattern syntactically, but the underlying API is fundamentally different. For other forms (home address, employee details, compensation), we know every field at build time — the schema is static and the field components are pre-defined. State taxes are **API-driven**: the fields, their types, their labels, their options, and even which states appear are all determined by the API response at runtime.

The schema reflects this — it's intentionally loose because the shape isn't known ahead of time:

```typescript
const stateTaxesSchema = z.object({
  states: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
})
```

Field components are generated dynamically from the API response. Each question from the API includes a type (select, radio, number, currency, percent, date, text) and the hook creates the appropriate field component:

```typescript
type StateTaxesFieldComponents = Record<string, Record<string, ComponentType<StateTaxFieldProps>>>
```

Because the API supplies labels and descriptions for each question, state tax fields default to using those values — unlike other forms where the partner must supply every label. Partners can still override them:

```tsx
<SDKFormProvider formHookResult={form}>
  {data.employeeStateTaxes.map(stateData => {
    const stateFields = Fields[stateData.state]
    if (!stateFields) return null

    return (
      <section key={stateData.state}>
        <h2>{stateNames[stateData.state]}</h2>
        {Object.entries(stateFields).map(([key, FieldComponent]) => (
          <FieldComponent key={key} />
        ))}
      </section>
    )
  })}
</SDKFormProvider>
```

State taxes use the same hook API surface (Fields, onSubmit, `SDKFormProvider`), but partners should expect a more dynamic rendering pattern. Reordering or selectively hiding state tax fields is possible but requires knowledge of the API's question keys.

If we had a way of getting a stable shape of the state by state field response, there might be ways we could type this strongly. That would be the missing piece to enable custom label/descriptions, providing FieldComponent props etc.

### 8. Base Infrastructure Changes

To support hooks without breaking existing components, `BaseBoundaries` was refactored to remove `Suspense` from its internals. `Suspense` is added at the few component call sites that need it. `BaseBoundaries` now only provides the error boundary and query error reset, which hooks can use directly.

`BaseLayout` also accepts an `isLoading` prop so hooks can use it for a simple loading state without Suspense:

```tsx
if (form.isLoading) return <BaseLayout isLoading />
```

---

## Advantages

- **Full UI control** — Partners can completely customize the UI of any SDK block to match their design system, rearranging fields, controlling layout, and building interactions that the component adapter system cannot support
- **Composability** — Standalone forms compose into larger pages; `composeSubmitHandler` bridges validation across them
- **Configurable field requirements** — Partners can promote optional fields to required via `optionalFieldsToRequire` without modifying the schema
- **Adapter compatible** — Field components use `useComponentContext()` internally; existing adapter setups carry forward while still providing an escape hatch for one-offs if the partner supplies a different `FieldComponent`
- **Partner translations** — Schema emits error codes, not messages; partners supply all user-facing strings
- **Reduced partner risk** — Compared to raw API, hooks still provide validation, domain calculations, error handling, and API orchestration
- **Addresses documented pain points** — Field reordering, section hiding, custom tables, external action buttons, and layout control all become possible
- **Consistent error surface** — `errorHandling` bag available in both loading and ready states with normalized `SDKError[]`, automatic server-error-to-field syncing via `SDKFormProvider`

---

## Limitations

- **React Hook Form dependency** — May be constraining for partners using a different form library (though it also saves us from version mismatches trying to have them use our schemas directly)
- **Provider scoping** — Composed forms require each form's fields to live within their own `SDKFormProvider`; fields from different forms cannot be freely intermixed in the same React subtree
- **Field omission risks** — Omitting a required field whose default value is invalid will cause validation failures on submit (similar to why we have always advised against hiding fields)
- **SDK fields only** — Partners cannot add their own custom fields into a hook's form. The schema and submission handler are defined by the hook, so only SDK-provided fields participate in validation and submission. Partners can render additional UI around the form, but custom inputs would need their own separate form state
- **State tax complexity** — Mentioned above, dynamic, state-specific questions of varying types still require partners to handle rendering complexity
- **Domain knowledge required** — Hooks like `usePayrollConfiguration` provide data but not UX context; partners need to understand the domain to compose meaningful interfaces
- **Increased maintenance surface** — Each hook is a new public API contract that must stay in sync with both API changes and the component tier
- **Flow orchestration** — Hooks are a very block-oriented way of building with the SDK; there are still opportunities at the macro level for making it easier to orchestrate components together

---

## Alternatives Considered

### Alternatives to Hooks

**Instance-level adapter IDs** — We considered assigning IDs to every adapter instance at the block level (e.g., Employee Profile) and to components within that block. Partners could then override adapters for specific instances, and we'd expose layout components that could be rearranged by adapter ID. We moved away from this because:
- The ID contract would be brittle for partners to maintain — any internal restructuring would break their overrides
- Override code became messy (large switch statements to apply one-off customizations)
- Layout components couldn't accommodate the full range of customization partners expected
- Customization was restricted to our component hierarchy — a button inside a table could be swapped to a different control, but it still had to live inside the table
- The approach was difficult to maintain and didn't solve the whole problem

**Hide buttons and headers via props** — A deliberately lower-ambition approach: add props to hide actions and headers, getting partners part of the way there without a major investment. We moved away from this because:
- Not all components have clear actions and headers, so the props would need to be inconsistently applied or custom per complex component
- Hiding actions and externalizing them was challenging — we could expose them via render props, but that restricts actions to living inside the component tree. Partners want to place actions in page-level sticky footers or external navigation bars
- Working around that (e.g., imperative refs to trigger actions outside the component) required the component to communicate state upward, leading to React anti-patterns

### Alternative Hooks Approaches

**Provider-based hooks (prototyped in [PR #769](https://github.com/Gusto/embedded-react-sdk/pull/769))** — The initial approach from the [previous RFC](./11-25--ui-flexibility-exploration.md). Providers handled data fetching and passed values through context; child components consumed them via hooks. This was more compatible with existing infrastructure (suspense queries, `BaseBoundaries`), but we moved away from it because:
- Hooks are more flexible when they can be used in isolation without requiring a parent provider
- The provider included a suspense boundary, meaning the entire subtree would suspend — partners who wanted to place the hook higher in their React tree and render loading states more conditionally couldn't do so easily
- The approach required more boilerplate; self-contained hooks are simpler for partners to adopt

**Schema-only / form-library-agnostic hooks (prototyped in [PR #1209](https://github.com/Gusto/embedded-react-sdk/pull/1209))** — This approach exported schemas and field metadata as plain objects (with attributes like `isRequired`, `type`, `options`) so partners could compose them with their own form infrastructure. The intent was to avoid shipping react-hook-form as a dependency. We moved away from this for several reasons:
- Business logic in the SDK is not restricted to form setup and submission — field values can depend on other field values dynamically as the user interacts. Without access to the form infrastructure, we can't help manage that complexity, and partners would need to re-implement it. Compensation is a clear example where this falls apart (FLSA status drives rate, payment unit, and minimum wage field behavior in real time)
- Error handling can be complex depending on the situation. State taxes and company pay schedules both return server-side errors with implications for rendered fields. Partners would need to parse those errors and map them to field-level messages themselves
- Concerns around tech and version compatibility — Zod is well supported, but partners stuck on v3 while we run v4 would face friction
- Concerns around schema readiness for export — our schemas contain complex `superRefine` logic driven by the dynamic form behavior described above. We'd need a simplification pass before feeling confident exporting them
- We can still selectively export schemas and field metadata from the current approach if partners demonstrate a need for that level of flexibility. The current approach gives us a cleanly encapsulated API as a first pass, with the option to progressively expose lower-level primitives based on partner signal

---

## Rollout

**Completed so far:** Seven form hooks have been built and are shipping under the `UNSTABLE_` namespace: compensation, employee details, work address, home address, pay schedule, sign company forms, and sign employee forms. The shared infrastructure (`buildFormSchema`, `useDeriveFieldsMetadata`, `SDKFormProvider`, `useErrorHandling`, field components) has stabilized through iteration across these hooks.

Each hook includes a prebuilt component that validates parity with the existing stable component tier. Schema validation and HTTP payload parity have been verified against stable components via side-by-side comparison pages in `gws-flows`.

**Next steps:**
- **Partner validation** — Ship hooks to 2-3 partners building in areas where hooks add the most value. Gather signal on the API surface, pain points, and missing capabilities.
- **Expand coverage** — Build hooks for remaining form components (federal taxes, state taxes, contractor payments) and data-only components (payroll configuration, employee lists). List-oriented hooks would wrap embedded API endpoints and format responses consistent with the established hook return shape.
- **Stabilize** — Move from `UNSTABLE_` to stable based on partner adoption, API stability, team review, and eng/product consensus.

---

## Recommendations

1. ~~**Update base component infrastructure**~~ — Done. `BaseBoundaries` and `BaseLayout` work without Suspense for hook-based usage.
2. ~~**Normalize error handling**~~ — Done. `SDKError` shape is the documented contract; `useErrorHandling` + `collectErrors` normalize all error sources; `SDKFormProvider` auto-syncs server errors to field state.
3. ~~**Build hooks for payroll + select onboarding**~~ — Done. Seven hooks shipped covering employee onboarding and company setup domains.
4. **Create extensive documentation** — Hook API references, form composition patterns, field props/validation contracts, migration guides from component tier
5. **Find partners to validate** — Identify 2-3 partners willing to build with hooks in a controlled setting for early adoption
6. **Plan stabilization based on signal** — Move from `UNSTABLE_` to stable based on partner adoption, API stability, team review, and eng/product consensus
7. **Expand to remaining domains** — Build hooks for state taxes, federal taxes, contractor payments, payroll configuration, and list components

---

## Feedback Requested

The hooks approach has moved past the prototyping phase into working, tested implementations. We are looking for reviewers to assess:

1. Whether the current API surface (return shape, field composition model, `optionalFieldsToRequire`, error handling) is sound for stabilization
2. Whether there are gaps in the hook inventory that should be prioritized based on partner needs
3. Any concerns about the `buildFormSchema` / `useDeriveFieldsMetadata` infrastructure that could affect long-term maintainability
