# RFC: React Hooks for Embedded SDK Partner Flexibility

**Status:** Draft  |  **Authors:** SDK Team  |  **Date:** March 2026

> This RFC is a follow-up to [11-25--ui-flexibility-exploration](./11-25--ui-flexibility-exploration.md), which proposed a Provider + hooks approach and identified a pure hooks alternative. After prototyping, we moved forward with hooks. This document concretely proposes the approach based on working implementations. See [PR #1239](https://github.com/Gusto/embedded-react-sdk/pull/1239) for the full implementation.

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

### Division of Responsibilities

| Concern | SDK (hooks) | Partner |
|---|---|---|
| API calls & orchestration | Owned by hooks | — |
| Domain logic & business rules | Owned by hooks (conditional fields, derived state, calculations) | — |
| Form validation schemas | Owned by hooks (Zod schemas, error codes) | — |
| Form state management | Owned by hooks (react-hook-form initialization, default values, reset) | — |
| Field components | Provided by hooks as composable building blocks | Partner renders them in any order/layout |
| Translations & copy | — | Fully partner-owned; hooks emit error codes, not strings; `getOptionLabel` lets partners customize labels for enumerated values |
| Layout & styling | — | Fully partner-owned |
| Loading & error UX | Base utilities available (`BaseLayout`, `BaseBoundaries`) | Partner chooses how to present them |
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

Form hooks manage schema-driven validation, form state, field components, and API submission. Using `useHomeAddressForm` as the illustration:

**Schema** — Zod schemas emit error *codes* (not messages), keeping validation translation-agnostic. Partners map codes to their own strings.

```typescript
export const generateHomeAddressSchema = () =>
  z.object({
    street1: z.string().min(1, { message: 'REQUIRED' }),
    street2: z.string().optional(),
    city: z.string().min(1, { message: 'REQUIRED' }),
    state: z.enum(STATES_ABBR, 'REQUIRED'),
    zip: z.string().superRefine(/* REQUIRED + INVALID_ZIP_FORMAT */),
    courtesyWithholding: z.boolean(),
  })
```

**react-hook-form** — The hook initializes react-hook-form with the Zod resolver, wires up API data fetching, and returns `Fields`, `onSubmit`, and `hookFormInternals` for the partner. A stripped-down version of the hook internals:

```typescript
function useHomeAddressForm({ employeeId }: UseHomeAddressParams): UseHomeAddressFormResult {
  const { data, isLoading } = useEmployeeAddressesGet({ employeeId })
  const schema = useMemo(() => generateHomeAddressSchema(), [])
  const currentAddress = getActiveHomeAddress(data?.employeeAddressList)

  const formMethods = useForm<HomeAddressFormData>({
    resolver: zodResolver(schema),
    defaultValues: { street1: '', street2: '', city: '', state: undefined, zip: '', courtesyWithholding: false },
  })

  const hasInitializedForm = useRef(false)
  useEffect(() => {
    if (currentAddress && !hasInitializedForm.current) {
      hasInitializedForm.current = true
      formMethods.reset({
        street1: currentAddress.street1 ?? '',
        street2: currentAddress.street2 ?? '',
        city: currentAddress.city ?? '',
        state: currentAddress.state,
        zip: currentAddress.zip ?? '',
        courtesyWithholding: currentAddress.courtesyWithholding ?? false,
      })
    }
  }, [currentAddress, formMethods.reset])

  if (isLoading) return { isLoading: true }

  return {
    isLoading: false,
    mode: currentAddress ? 'update' : 'create',
    Fields: HomeAddressFields,       // standalone field components
    hookFormInternals: { formMethods }, // escape hatch for advanced usage
    fieldsMetadata: {},
    onSubmit: async () => { /* validates via formMethods.handleSubmit, then calls create or update mutation */ },
    // ...errors, isPending, data
  }
}
```

The key pattern: `useForm` is called inside the hook with the Zod resolver, default values are set for a clean initial render, and the form resets exactly once when API data arrives. Partners never call `useForm` themselves — they receive `Fields` to render and `onSubmit` to wire up.

**Field Components** — Each field is a standalone component accepting `label`, `description`, `validationMessages`, and an optional `FieldComponent` prop to swap the underlying control. See the next section for how validation messages work end-to-end.

```tsx
export function Street1({ label, validationMessages, FieldComponent }: Street1FieldProps) {
  const errorMessage = useFieldErrorMessage('street1', validationMessages)
  return (
    <TextInputField name="street1" isRequired label={label}
      errorMessage={errorMessage} FieldComponent={FieldComponent} />
  )
}
```

The `FieldComponent` prop is typed to the underlying control's props (e.g., `ComponentType<TextInputProps>` for text fields, `ComponentType<SelectProps>` for selects). By default, fields render using the SDK's built-in controls (which respect the component adapter). But if a partner needs a one-off customization — say, an autocomplete input instead of a plain text input for the street field — they can swap it without rebuilding the entire form:

```tsx
import { MyAutocompleteInput } from './MyAutocompleteInput'

<Fields.Street1
  label={t('street1')}
  validationMessages={{ REQUIRED: t('required') }}
  FieldComponent={MyAutocompleteInput}
/>
```

The partner's component receives the same props the default control would (`value`, `onChange`, `onBlur`, `errorMessage`, etc.), so it plugs in seamlessly. Every other field on the form continues using the defaults.

**Additional form context** — In addition to React Hook Form context, we maintain our own form context called `FormFieldsMetadataProvider`. Field components often need data that only the hook has access to. For example, `useWorkAddressForm` fetches a list of company locations from the API — the `Location` select field needs those options to render its dropdown. Similarly, a field might need to know whether it's required or disabled based on hook state.

Rather than forcing partners to pass all of this through field props, we provide our own form context alongside react-hook-form's. The hook populates a `fieldsMetadata` object keyed by field name:

```typescript
// Inside useWorkAddressForm — after fetching company locations from the API
fieldsMetadata: {
  locationUuid: {
    isRequired: true,
    options: companyLocations.map(loc => ({ label: addressInline(loc), value: loc.uuid })),
    entries: companyLocations,  // raw API objects, useful for partner custom rendering
  },
  effectiveDate: {
    isRequired: true,
  },
}
```
(We can also derive things like isRequired for the fields from the zod schema, and this will allow us to communicate those)

Each hook's exported `FormProvider` wraps children with both react-hook-form's context and our metadata context:

```tsx
export function WorkAddressFormProvider({ form, children }) {
  return (
    <FormFieldsMetadataProvider metadata={form.fieldsMetadata}>
      <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
    </FormFieldsMetadataProvider>
  )
}
```

Field components then consume the metadata via `useFieldMetadata`:

```tsx
export function Location({ label, validationMessages, getOptionLabel }: LocationFieldProps) {
  const { options = [], entries = [], isRequired, isDisabled } = useFieldMetadata('locationUuid')
  const errorMessage = useFieldErrorMessage('locationUuid', validationMessages)

  // Partners can override how options are labeled via getOptionLabel
  const resolvedOptions = getOptionLabel
    ? entries.map(loc => ({ label: getOptionLabel(loc), value: loc.uuid }))
    : options

  return (
    <SelectField name="locationUuid" label={label} isRequired={isRequired}
      isDisabled={isDisabled} options={resolvedOptions} errorMessage={errorMessage} />
  )
}
```

This pattern keeps fields self-contained while giving the hook control over what data and constraints they operate with. It also positions us to eventually derive `isRequired` directly from the Zod schema rather than setting it manually.

Notice the `getOptionLabel` prop above — it receives the raw API entry (the full location object) and returns a string. By default the field uses the pre-formatted `options` from the hook, but the partner can override labeling without losing access to the underlying data:

```tsx
<Fields.Location
  label="Work location"
  validationMessages={{ REQUIRED: 'Please select a location' }}
  getOptionLabel={(location) => `${location.streetAddress}, ${location.city} ${location.state}`}
/>
```

The `entries` array in the metadata is the key — it carries the raw API objects so that `getOptionLabel` has full context. Without this, the partner would only have pre-formatted label strings and no way to customize them.

**Partner usage** — Full control over ordering, layout, and labels:

```tsx
<HomeAddressFormProvider form={form}>
  <section>
    <h3>Street Address</h3>
    <Fields.Street1 label={t('street1')} validationMessages={{ REQUIRED: t('required') }} />
    <Fields.Street2 label={t('street2')} />
  </section>

  <Divider />

  <section>
    <h3>City, State & Zip</h3>
    <Grid gridTemplateColumns={['2fr', '1fr', '1fr']}>
      <Fields.City label={t('city')} validationMessages={{ REQUIRED: t('required') }} />
      <Fields.State label={t('state')} validationMessages={{ REQUIRED: t('required') }} />
      <Fields.Zip label={t('zip')} validationMessages={{ REQUIRED: t('required'), INVALID_ZIP_FORMAT: t('badZip') }} />
    </Grid>
  </section>

  <Divider />

  <section>
    <h3>Tax Withholding</h3>
    <Fields.CourtesyWithholding label={t('courtesyWithholding')} />
  </section>
</HomeAddressFormProvider>
```

Fields can be grouped, reordered, wrapped in partner markup, or placed in any layout — the hook doesn't care where they end up in the DOM.

### 3. Validation Messages and Error Handling

The schema, field components, and partner code work together through a shared set of **error codes**. This keeps validation logic in the schema, display strings with the partner, and the mapping between them type-safe.

**Step 1: Schema defines error codes as constants**

Each schema declares its possible error codes as a typed constant. These codes are what Zod emits as `message` values on validation failure — they are not user-facing strings.

```typescript
export const homeAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_ZIP_FORMAT: 'INVALID_ZIP_FORMAT',
} as const

export type HomeAddressErrorCode = (typeof homeAddressErrorCodes)[keyof typeof homeAddressErrorCodes]

export const generateHomeAddressSchema = () =>
  z.object({
    street1: z.string().min(1, { message: homeAddressErrorCodes.REQUIRED }),
    zip: z.string().superRefine((value, ctx) => {
      if (!value) ctx.addIssue({ code: 'custom', message: homeAddressErrorCodes.REQUIRED })
      else if (!/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value))
        ctx.addIssue({ code: 'custom', message: homeAddressErrorCodes.INVALID_ZIP_FORMAT })
    }),
    // ...
  })
```

**Step 2: Field component props are typed to require exactly the right codes**

Each field declares which error codes it can produce. TypeScript enforces that the partner supplies a translation for every possible code — no more, no less.

```typescript
type Street1ValidationCodes = 'REQUIRED'
type ZipValidationCodes = 'REQUIRED' | 'INVALID_ZIP_FORMAT'

type Street1FieldProps = FieldProps & {
  validationMessages: Record<Street1ValidationCodes, string>
}

type ZipFieldProps = FieldProps & {
  validationMessages: Record<ZipValidationCodes, string>
}
```

**Step 3: Field component resolves the current error code to the partner's string**

The `useFieldErrorMessage` helper reads the error code from react-hook-form state and maps it to the partner-provided message:

```typescript
function useFieldErrorMessage<TKeys extends string>(
  fieldName: keyof HomeAddressFormData,
  validationMessages: Record<TKeys, string>,
): string | undefined {
  const { formState: { errors } } = useFormContext<HomeAddressFormData>()
  const errorCode = errors[fieldName]?.message as TKeys | undefined
  return errorCode ? validationMessages[errorCode] : undefined
}
```

**Step 4: Partner supplies translated strings at render time**

```tsx
<Fields.Street1
  label={t('street1')}
  validationMessages={{ REQUIRED: t('fieldValidations.street1.REQUIRED') }}
/>
<Fields.Zip
  label={t('zip')}
  validationMessages={{
    REQUIRED: t('fieldValidations.zip.REQUIRED'),
    INVALID_ZIP_FORMAT: t('fieldValidations.zip.INVALID_ZIP_FORMAT'),
  }}
/>
```

If a partner omits a required code, TypeScript catches it at build time. If they provide their own i18n framework, it slots in naturally. The SDK never ships user-facing error strings.

### 4. Composing Multiple Forms

When a partner composes multiple forms, they need a single submit handler that coordinates validation across all of them. `composeSubmitHandler` does this: it triggers validation on every form simultaneously, waits for all results, and only calls the `onAllValid` callback if every form passes. If any form has errors, it walks through each form's fields in order and focuses the first invalid one — giving the user a clear starting point for correction. This is why each hook is initialized with `shouldFocusError: false`: react-hook-form's built-in focus only knows about its own form, but `composeSubmitHandler` manages focus across all of them.

```tsx
function EmployeeProfile({ employeeId, companyId }: Props) {
  // Each hook passes shouldFocusError: false — we disable react-hook-form's
  // built-in focus behavior because composeSubmitHandler handles focusing
  // the first invalid field across ALL forms, not just within one.
  const detailsForm = useEmployeeDetailsForm({ employeeId, shouldFocusError: false })
  const addressForm = useHomeAddressForm({ employeeId, shouldFocusError: false })
  const workForm = useWorkAddressForm({ employeeId, companyId, shouldFocusError: false })

  const isLoading = detailsForm.isLoading || addressForm.isLoading || workForm.isLoading
  if (isLoading) return <BaseLayout isLoading />

  const isPending = detailsForm.isPending || addressForm.isPending || workForm.isPending

  const handleSubmit = composeSubmitHandler(
    [detailsForm, addressForm, workForm],
    async () => {
      const detailsResult = await detailsForm.onSubmit()
      const resolvedId = detailsResult?.data.uuid ?? employeeId
      await addressForm.onSubmit(resolvedId)
      await workForm.onSubmit(resolvedId)
    },
  )

  return (
    <Form onSubmit={handleSubmit}>
      <EmployeeDetailsFormProvider form={detailsForm}>
        <EmployeeDetailsFormFields form={detailsForm} />
      </EmployeeDetailsFormProvider>
      <HomeAddressFormProvider form={addressForm}>
        <HomeAddressFormFields form={addressForm} />
      </HomeAddressFormProvider>
      <WorkAddressFormProvider form={workForm}>
        <WorkAddressFormFields form={workForm} />
      </WorkAddressFormProvider>
      <Button type="submit" isLoading={isPending}>Save All</Button>
    </Form>
  )
}
```

The `HomeAddressFormFields` component used standalone can be reused verbatim in the composed page — enabling both full-control and convenience paths.

### 5. Conditional Field Rendering

Hooks return `undefined` for fields that shouldn't render based on form state or API data:

```typescript
const Fields = {
  FirstName: EmployeeDetailsFields.FirstName,
  DateOfBirth: showDateOfBirth ? EmployeeDetailsFields.DateOfBirth : undefined,
  SelfOnboarding: isSelfOnboardingVisible ? EmployeeDetailsFields.SelfOnboarding : undefined,
}
```

```tsx
{Fields.DateOfBirth && <Fields.DateOfBirth label={t('dateOfBirth')} validationMessages={...} />}
```

The hook owns the business logic for visibility; the partner just checks existence.

### 6. State Taxes — Predictably difficult

State taxes follow the same hook pattern syntactically, but the underlying API is fundamentally different. For other forms (home address, employee details, compensation), we know every field at build time — the schema is static and the field components are pre-defined. State taxes are **API-driven**: the fields, their types, their labels, their options, and even which states appear are all determined by the API response at runtime.

The schema reflects this — it's intentionally loose because the shape isn't known ahead of time:

```typescript
const stateTaxesSchema = z.object({
  states: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
})
```

Field components are generated dynamically from the API response. Each question from the API includes a type (select, radio, number, currency, percent, date, text) and the hook creates the appropriate field component:

```typescript
// Fields are keyed by state, then by question key
// Fields['CA']['FilingStatus'] → a SelectField component
// Fields['CA']['WithholdingAllowance'] → a NumberInputField component
type StateTaxesFieldComponents = Record<string, Record<string, ComponentType<StateTaxFieldProps>>>
```

Because the API supplies labels and descriptions for each question, state tax fields default to using those values — unlike other forms where the partner must supply every label. Partners can still override them:

```tsx
<StateTaxesFormProvider form={form}>
  {data.employeeStateTaxes.map(stateData => {
    const stateFields = Fields[stateData.state]
    if (!stateFields) return null

    return (
      <section key={stateData.state}>
        <h2>{stateNames[stateData.state]}</h2>
        {Object.entries(stateFields).map(([key, FieldComponent]) => (
          // Label/description default to API values; partner can override
          <FieldComponent key={key} />
        ))}
      </section>
    )
  })}
</StateTaxesFormProvider>
```

State taxes use the same hook API surface (Fields, onSubmit, FormProvider), but partners should expect a more dynamic rendering pattern. Reordering or selectively hiding state tax fields is possible but requires knowledge of the API's question keys.

If we had a way of getting a stable shape of the state by state field response, there might be ways we could type this strongly. That would be the missing piece to enable custom label/descriptions, providing FieldComponent props etc.

### 7. Base Infrastructure Changes

To support hooks without breaking existing components, we will refactor `BaseBoundaries` to remove `Suspense` from its internals and instead add `Suspense` at the few component call sites that need it. This means `BaseBoundaries` now only provides the error boundary and query error reset, which hooks can use directly:

```tsx
// Before: Suspense was baked into BaseBoundaries
export const BaseBoundaries = ({ children, FallbackComponent, LoaderComponent }) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary FallbackComponent={FallbackComponent} onReset={reset}>
        <Suspense fallback={<LoaderComponent />}>{children}</Suspense>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
)

// After: Suspense removed — added at call sites that need it
export const BaseBoundaries = ({ children, FallbackComponent }) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary FallbackComponent={FallbackComponent} onReset={reset}>
        {children}
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
)
```

Not a huge deal, but keeps us from using suspense unnecessarily. We will move suspense into the Base component usage directly so existing SDK components can continue to work without issue.

We also added an `isLoading` prop to `BaseLayout` so hooks can use it for a simple loading state without Suspense:

```tsx
// Hook-based component can use BaseLayout directly
if (form.isLoading) return <BaseLayout isLoading />

return (
  <BaseLayout error={errors.error} fieldErrors={errors.fieldErrors}>
    {/* form content */}
  </BaseLayout>
)
```

### 8. Error Normalization

Errors today come from multiple sources with different shapes: API errors, SDK validation errors, field-level validation errors from 422 responses, and unrecoverable errors. For hooks to be partner-facing, we need to normalize these into a single, parseable array of errors that partners can iterate over and display consistently. Additional work will be needed on this front to define the final shape and ensure it covers all error scenarios cleanly.

---

## Advantages

- **Full UI control** — Partners can completely customize the UI of any SDK block to match their design system, rearranging fields, controlling layout, and building interactions that the component adapter system cannot support
- **Composability** — Standalone forms compose into larger pages; `composeSubmitHandler` bridges validation across them
- **Adapter compatible** — Field components use `useComponentContext()` internally; existing adapter setups carry forward while still providing an escape hatch for one offs if the partner supplies a different component
- **Partner translations** — Schema emits error codes, not messages; partners supply all user-facing strings
- **Reduced partner risk** — Compared to raw API, hooks still provide validation, domain calculations, error handling, and API orchestration
- **Addresses documented pain points** — Field reordering, section hiding, custom tables, external action buttons, and layout control all become possible

---

## Limitations

- **React Hook Form dependency** — May be constraining for partners using a different form library (though it also saves us from version mismatches trying to have them use our schemas directly)
- **Provider scoping** — Composed forms require each form's fields to live within their own `FormProvider`; fields from different forms cannot be freely intermixed in the same React subtree
- **Field omission risks** — Omitting a required field whose default value is invalid will cause validation failures on submit (similar to why we have always advised against hiding fields)
- **SDK fields only** — Partners cannot add their own custom fields into a hook's form. The schema and submission handler are defined by the hook, so only SDK-provided fields participate in validation and submission. Partners can render additional UI around the form, but custom inputs would need their own separate form state
- **State tax complexity** — Mentioned above, dynamic, state-specific questions of varying types still require partners to handle rendering complexity
- **Domain knowledge required** — Hooks like `usePayrollConfiguration` provide data but not UX context; partners need to understand the domain to compose meaningful interfaces
- **Increased maintenance surface** — Each hook is a new public API contract that must stay in sync with both API changes and the component tier
- **Flow orchestration** — Hooks are a very block oriented way of building with the SDK, there are still opportunties at the macro level for making it easier to orchestrate components together

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

## Recommendations

1. **Update base component infrastructure** — Enable `BaseBoundaries` and `BaseLayout` to work without Suspense for hook-based usage (see corresponding PR)
2. **Normalize error handling** — Standardize the on an SDK Error shape as the documented contract across all hooks
3. **Build hooks for payroll + select onboarding** — Prioritize where partner signal is strongest; export from `UNSTABLE_`
4. **Create extensive documentation** — Hook API references, form composition patterns, field props/validation contracts, migration guides from component tier
5. **Find partners to validate** — Identify 2-3 partners willing to build with hooks in a controlled setting for early adoption
6. **Plan stabilization based on signal** — Move from `UNSTABLE_` to stable based on partner adoption, API stability, team review, and eng/product consensus
7. **Build out E2E test suite** — Prepare to migrate internal component implementations to hooks with confidence
