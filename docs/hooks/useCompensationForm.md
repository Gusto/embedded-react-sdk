---
title: useCompensationForm
order: 3
---

# useCompensationForm

Creates or updates a compensation row on a job — FLSA classification, pay rate, payment unit, effective date, optional minimum-wage adjustment. Pairs with [`useJobForm`](./useJobForm.md): jobs and their compensations are separate entities in the Gusto API, and this hook focuses exclusively on the compensation side.

```tsx
import { useCompensationForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

A wrapper hook, [`useCurrentCompensationForm`](#usecurrentcompensationform), automatically resolves the primary job's `currentCompensationUuid` and threads it into `useCompensationForm` — useful for steady-state edits where the partner does not need to pick a specific compensation record.

> **Looking for `jobTitle`, `hireDate`, `twoPercentShareholder`, `stateWcCovered` / `stateWcClassCode`?** Those moved to [`useJobForm`](./useJobForm.md). Compensation now models only what `POST /v1/jobs/:jobId/compensations` and `PUT /v1/compensations/:id` accept.

---

## Props

`useCompensationForm` accepts a single options object:

| Prop                      | Type                                                           | Required | Default      | Description                                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `employeeId`              | `string`                                                       | No       | —            | The UUID of the employee. Drives data fetching for derived helpers (jobs list, work address, minimum wages). Optional for composed flows.                    |
| `jobId`                   | `string`                                                       | No       | —            | The UUID of the parent job. Required to scope minimum wages and to derive carve-out helpers. Can also be passed at submit time when the job is just-created. |
| `compensationId`          | `string`                                                       | No       | —            | When present → **update** mode (PUT /v1/compensations/:id). When absent → **create** mode (POST /v1/jobs/:jobId/compensations).                              |
| `optionalFieldsToRequire` | `CompensationOptionalFieldsToRequire`                          | No       | —            | Override fields that are optional in a given mode to be required. See [Configurable Required Fields](#configurable-required-fields).                         |
| `defaultValues`           | `Partial<CompensationFormData>`                                | No       | —            | Pre-fill form values. Server data takes precedence on update.                                                                                                |
| `validationMode`          | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | Passed through to react-hook-form.                                                                                                                           |
| `shouldFocusError`        | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                                                              |

### Configurable Required Fields

| Field                  | Rule       | Required on create    | Required on update    | Partner-configurable? |
| ---------------------- | ---------- | --------------------- | --------------------- | --------------------- |
| `flsaStatus`           | `'create'` | Yes                   | No                    | Yes (on update)       |
| `paymentUnit`          | `'create'` | Yes                   | No                    | Yes (on update)       |
| `rate`                 | `'create'` | Yes                   | No                    | Yes (on update)       |
| `effectiveDate`        | `'create'` | Yes                   | No                    | Yes (on update)       |
| `title`                | `'never'`  | No                    | No                    | Yes (either mode)     |
| `adjustForMinimumWage` | (always)   | Yes                   | Yes                   | No                    |
| `minimumWageId`        | predicate  | When the toggle is on | When the toggle is on | No                    |

```typescript
type CompensationOptionalFieldsToRequire = {
  create?: Array<'title'>
  update?: Array<'title' | 'flsaStatus' | 'paymentUnit' | 'rate' | 'effectiveDate'>
}
```

`title` is intentionally optional in both modes because partners typically thread it through `useJobForm.Fields.Title` (where it's required on create). It remains here as an optional convenience for partners building a single-form steady-state edit screen.

`minimumWageId` is automatically required when `adjustForMinimumWage` is `true` regardless of `optionalFieldsToRequire`.

### CompensationFormData

The shape of `defaultValues`:

```typescript
interface CompensationFormData {
  title: string
  flsaStatus: FlsaStatusType // 'Exempt' | 'Salaried Nonexempt' | 'Nonexempt' | 'Owner' | 'Commission Only Exempt' | 'Commission Only Nonexempt'
  rate: number
  paymentUnit: PaymentUnit // 'Hour' | 'Week' | 'Month' | 'Year' | 'Paycheck'
  effectiveDate: string | null // ISO date string (YYYY-MM-DD) or null
  adjustForMinimumWage: boolean
  minimumWageId: string
}
```

---

## Verb routing

The hook auto-routes between create and update based on `compensationId` (and submit options):

| Hook config / submit options                                               | Mode   | API call                                                              |
| -------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| `{ jobId, compensationId }`                                                | update | `PUT /v1/compensations/:compensationId` (with `version`)              |
| `{ jobId }` (no `compensationId`)                                          | create | `POST /v1/jobs/:jobId/compensations`                                  |
| `{ employeeId }` + submit `{ jobId, compensationId, compensationVersion }` | update | `PUT /v1/compensations/:compensationId` (with the supplied `version`) |
| `{ employeeId }` + submit `{ jobId }` (no `compensationId`)                | create | `POST /v1/jobs/:options.jobId/compensations`                          |

Use the submit-options form for the **onboarding stub-fill** chain: after `useJobForm.actions.onSubmit()` creates a job, capture the auto-created compensation's UUID and version from the response, and pass them as `{ jobId, compensationId, compensationVersion }` to this hook's `onSubmit` to PUT the stub.

---

## Return Type

The hook returns a discriminated union on `isLoading`.

### Loading state

```typescript
{
  isLoading: true
  errorHandling: HookErrorHandling
}
```

### Ready state

```typescript
{
  isLoading: false
  data: {
    compensation: Compensation | null   // the loaded comp; null in create mode
    currentJob: Job | null              // the parent job (when jobId resolves)
    minimumWages: MinimumWage[]
    canTriggerCarveOut: boolean         // see "Derived helpers" below
    minimumEffectiveDate: string | null // typically the parent job's hireDate
    maximumEffectiveDate: string | null // the next future-dated comp's effective date, when one exists
    hasPendingFutureCompensation: boolean
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: {
    onSubmit: (
      options?: CompensationSubmitOptions,
    ) => Promise<HookSubmitResult<Compensation> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: CompensationFormFields
    fieldsMetadata: CompensationFieldsMetadata
    hookFormInternals: { formMethods: UseFormReturn }
    getFormSubmissionValues: () => CompensationFormOutputs | undefined
  }
}
```

### Submit options

```typescript
interface CompensationSubmitOptions {
  /** Override jobId — required when creating a compensation if not configured at hook construction (e.g. when the parent job was just created in the same submit chain). */
  jobId?: string
  /** Override compensationId — when present, forces update (PUT) routing regardless of hook construction. */
  compensationId?: string
  /**
   * Compensation version for optimistic locking on PUT. Required when forcing
   * update routing post-create (e.g. updating the auto-created stub returned
   * from POST /v1/employees/:id/jobs). When omitted, the hook reads the
   * version from its cached `currentCompensation`.
   */
  compensationVersion?: string
}
```

`onSubmit` resolves to a `HookSubmitResult<Compensation>` containing both the mode (`'create' | 'update'`) and the saved `Compensation` entity, so partners read the result directly rather than wiring step callbacks.

---

## Derived helpers

`data.*` exposes derived values partners use to drive UX:

- **`canTriggerCarveOut`** — `true` when the active edit could trigger the secondary-pay-rate carve-out: update mode, current FLSA was `Nonexempt`, the form's `flsaStatus` was just changed to a non-`Nonexempt` value, the employee has at least one secondary job, and the effective date is today (immediate, not future-dated). Partners typically render a confirmation prompt before calling `actions.onSubmit`. The submit itself routes to PUT either way.
- **`minimumEffectiveDate`** — lower bound for the `effectiveDate` field. Typically the parent job's `hireDate`. Partners pass this as `min` to the date picker.
- **`maximumEffectiveDate`** — upper bound for the `effectiveDate` field, when a future-dated compensation already exists for this job. Partners pass this as `max` to the date picker so users can't push a new entry past a pending one.
- **`hasPendingFutureCompensation`** — `true` when at least one future-dated compensation exists for this job. Partners use this to render an explanatory note ("A future rate change is already scheduled for …").

---

## Fields Reference

### Error Codes

```typescript
const CompensationErrorCodes = {
  REQUIRED: 'REQUIRED',
  RATE_MINIMUM: 'RATE_MINIMUM',
  RATE_EXEMPT_THRESHOLD: 'RATE_EXEMPT_THRESHOLD',
  PAYMENT_UNIT_OWNER: 'PAYMENT_UNIT_OWNER',
  PAYMENT_UNIT_COMMISSION: 'PAYMENT_UNIT_COMMISSION',
  RATE_COMMISSION_ZERO: 'RATE_COMMISSION_ZERO',
  EFFECTIVE_DATE_BEFORE_HIRE: 'EFFECTIVE_DATE_BEFORE_HIRE',
} as const
```

---

### Fields.Title

Text input for the title tied to this compensation. Use it when the title change should take effect on this compensation's `effectiveDate` — for example, a future-dated promotion that bundles a new title with a raise.

Bind title via [`useJobForm.Fields.Title`](./useJobForm.md#fieldstitle) instead when you're creating a job (title is required by the API on job creation) or renaming the active role immediately. Don't render both on the same screen.

| Prop                 | Type                            | Required |
| -------------------- | ------------------------------- | -------- |
| `label`              | `string`                        | Yes      |
| `description`        | `ReactNode`                     | No       |
| `validationMessages` | `{ REQUIRED: string }`          | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>` | No       |

**Optional in both modes** unless `optionalFieldsToRequire` requires it.

---

### Fields.FlsaStatus

Select dropdown for the employee's FLSA classification (Fair Labor Standards Act status).

| Prop                 | Type                                 | Required |
| -------------------- | ------------------------------------ | -------- |
| `label`              | `string`                             | Yes      |
| `description`        | `ReactNode`                          | No       |
| `validationMessages` | `{ REQUIRED: string }`               | No       |
| `getOptionLabel`     | `(status: FlsaStatusType) => string` | No       |
| `FieldComponent`     | `ComponentType<SelectProps>`         | No       |

**Options:** `Exempt`, `Salaried Nonexempt`, `Nonexempt`, `Owner`, `Commission Only Exempt`, `Commission Only Nonexempt`.

**Conditional availability:** This field is `undefined` when the FLSA status cannot be changed — specifically, when the employee has a non-primary job with a non-`Nonexempt` status that was already set.

```tsx
{
  Fields.FlsaStatus && (
    <Fields.FlsaStatus
      label="Employee type"
      validationMessages={{ REQUIRED: 'Employee classification is required' }}
    />
  )
}
```

---

### Fields.Rate

Number input for the compensation amount. Formatted as currency.

| Prop                 | Type                                                                        | Required |
| -------------------- | --------------------------------------------------------------------------- | -------- |
| `label`              | `string`                                                                    | Yes      |
| `description`        | `ReactNode`                                                                 | No       |
| `validationMessages` | `{ REQUIRED: string, RATE_MINIMUM: string, RATE_EXEMPT_THRESHOLD: string }` | No       |
| `FieldComponent`     | `ComponentType<NumberInputProps>`                                           | No       |

| Code                    | When it triggers                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `REQUIRED`              | Rate is empty for non-commission FLSA statuses                                       |
| `RATE_MINIMUM`          | Rate is less than $1.00                                                              |
| `RATE_EXEMPT_THRESHOLD` | FLSA Exempt employees must meet the federal salary threshold (annualized rate check) |

This field is automatically **disabled** when the FLSA status is Commission Only (rate is forced to `0`).

```tsx
<Fields.Rate
  label="Compensation amount"
  validationMessages={{
    REQUIRED: 'Amount is a required field',
    RATE_MINIMUM: 'Amount must be at least $1.00',
    RATE_EXEMPT_THRESHOLD: 'FLSA Exempt employees must meet salary threshold of $35,568/year',
  }}
/>
```

---

### Fields.PaymentUnit

Select dropdown for the pay period unit.

| Prop                 | Type                                                                                | Required |
| -------------------- | ----------------------------------------------------------------------------------- | -------- |
| `label`              | `string`                                                                            | Yes      |
| `description`        | `ReactNode`                                                                         | No       |
| `validationMessages` | `{ REQUIRED: string, PAYMENT_UNIT_OWNER: string, PAYMENT_UNIT_COMMISSION: string }` | No       |
| `getOptionLabel`     | `(unit: PaymentUnit) => string`                                                     | No       |
| `FieldComponent`     | `ComponentType<SelectProps>`                                                        | No       |

**Options:** `Hour`, `Week`, `Month`, `Year`, `Paycheck`.

This field is automatically **disabled** when the FLSA status is Owner (forced to `Paycheck`) or Commission Only (forced to `Year`).

---

### Fields.EffectiveDate

Date picker for when the new compensation row takes effect.

| Prop                 | Type                                                       | Required |
| -------------------- | ---------------------------------------------------------- | -------- |
| `label`              | `string`                                                   | Yes      |
| `description`        | `ReactNode`                                                | No       |
| `validationMessages` | `{ REQUIRED: string, EFFECTIVE_DATE_BEFORE_HIRE: string }` | No       |
| `FieldComponent`     | `ComponentType<DatePickerProps>`                           | No       |

**Required on create.** Optional on update (the API keeps the existing effective date when omitted) unless `optionalFieldsToRequire.update` includes `'effectiveDate'`.

Use `data.minimumEffectiveDate` and `data.maximumEffectiveDate` to constrain the picker.

```tsx
<Fields.EffectiveDate
  label="Effective date"
  validationMessages={{
    REQUIRED: 'Effective date is required',
    EFFECTIVE_DATE_BEFORE_HIRE: 'Effective date cannot be before the hire date',
  }}
/>
```

---

### Fields.AdjustForMinimumWage

Checkbox to enable minimum wage adjustment.

| Prop             | Type                           | Required |
| ---------------- | ------------------------------ | -------- |
| `label`          | `string`                       | Yes      |
| `description`    | `ReactNode`                    | No       |
| `FieldComponent` | `ComponentType<CheckboxProps>` | No       |

**Conditional availability:** This field is `undefined` when:

- FLSA status is not `Nonexempt`
- No minimum wages are available for the employee's work location
- The employee's work state does not support tip credits

---

### Fields.MinimumWageId

Select dropdown to choose which minimum wage to adjust to. Only appears when `AdjustForMinimumWage` is checked.

| Prop                 | Type                         | Required |
| -------------------- | ---------------------------- | -------- |
| `label`              | `string`                     | Yes      |
| `description`        | `ReactNode`                  | No       |
| `validationMessages` | `{ REQUIRED: string }`       | No       |
| `FieldComponent`     | `ComponentType<SelectProps>` | No       |

**Options:** Dynamically populated from minimum wages available at the employee's work location.

---

## useCurrentCompensationForm

A wrapper hook that resolves the employee's **primary** job's `currentCompensationUuid` and threads it into `useCompensationForm`. Mirrors `useCurrentHomeAddressForm` / `useCurrentJobForm`. Use this when your screen edits "the current compensation" without picking a specific record.

```tsx
import { useCurrentCompensationForm } from '@gusto/embedded-react-sdk'

function CurrentCompensationEditPage({ employeeId }: { employeeId: string }) {
  const compensation = useCurrentCompensationForm({ employeeId })
  // ... renders form against the primary job's current compensation
}
```

Props are `Omit<UseCompensationFormProps, 'jobId' | 'compensationId'>`. When the employee has no primary job, the hook lands in **create** mode and the partner threads `jobId` (and optionally `compensationId` / `compensationVersion`) via submit options.

---

## Usage example (single hook, steady-state edit)

```tsx
import {
  useCompensationForm,
  SDKFormProvider,
  type UseCompensationFormReady,
} from '@gusto/embedded-react-sdk'

function CompensationEditPage({
  employeeId,
  jobId,
  compensationId,
}: {
  employeeId: string
  jobId: string
  compensationId: string
}) {
  const compensation = useCompensationForm({ employeeId, jobId, compensationId })

  if (compensation.isLoading) return <div>Loading...</div>

  return <CompensationFormReady compensation={compensation} />
}

function CompensationFormReady({ compensation }: { compensation: UseCompensationFormReady }) {
  const { Fields } = compensation.form
  const { canTriggerCarveOut, hasPendingFutureCompensation, maximumEffectiveDate } =
    compensation.data

  return (
    <SDKFormProvider formHookResult={compensation}>
      <form
        onSubmit={async e => {
          e.preventDefault()
          if (
            canTriggerCarveOut &&
            !window.confirm('This change will affect rates on other jobs. Continue?')
          )
            return
          await compensation.actions.onSubmit()
        }}
      >
        {hasPendingFutureCompensation && (
          <p>A future rate change is already scheduled for {maximumEffectiveDate}.</p>
        )}

        {Fields.FlsaStatus && (
          <Fields.FlsaStatus
            label="Employee type"
            validationMessages={{ REQUIRED: 'Employee classification is required' }}
          />
        )}

        <Fields.Rate
          label="Compensation amount"
          validationMessages={{
            REQUIRED: 'Amount is required',
            RATE_MINIMUM: 'Amount must be at least $1.00',
            RATE_EXEMPT_THRESHOLD: 'Exempt employees must meet the salary threshold',
          }}
        />

        <Fields.PaymentUnit
          label="Per"
          validationMessages={{
            REQUIRED: 'Payment unit is required',
            PAYMENT_UNIT_OWNER: 'Owners must be paid per paycheck',
            PAYMENT_UNIT_COMMISSION: 'Commission-only employees must be paid annually',
          }}
        />

        <Fields.EffectiveDate
          label="Effective date"
          validationMessages={{
            REQUIRED: 'Effective date is required',
            EFFECTIVE_DATE_BEFORE_HIRE: 'Effective date cannot be before the hire date',
          }}
        />

        {Fields.AdjustForMinimumWage && (
          <Fields.AdjustForMinimumWage label="Adjust for minimum wage" />
        )}

        {Fields.MinimumWageId && (
          <Fields.MinimumWageId
            label="Minimum wage"
            validationMessages={{ REQUIRED: 'Please select a minimum wage' }}
          />
        )}

        <button type="submit" disabled={compensation.status.isPending}>
          Save
        </button>
      </form>
    </SDKFormProvider>
  )
}
```

For the onboarding stub-fill chain (POST job → PUT auto-created stub) and other multi-form flows, see [Composing Job + Compensation](./hooks.md#composing-job--compensation).

---

## Related

- [useJobForm](./useJobForm.md) — pair this with `useCompensationForm` for full job + compensation editing.
- [Composing Multiple Hooks](./hooks.md#composing-multiple-hooks) — coordinate `useJobForm` + `useCompensationForm` (and others) on a single screen.
