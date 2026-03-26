---
title: useCompensationForm
order: 3
---

# useCompensationForm

Creates or updates job compensation for an employee — job title, FLSA classification, pay rate, payment unit, minimum wage adjustments, and Washington state workers' compensation fields.

```tsx
import { useCompensationForm, SDKFormProvider } from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'
```

---

## Props

`useCompensationForm` accepts a single options object:

| Prop                 | Type                                                                                    | Required | Default      | Description                                                                                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------- | -------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `employeeId`         | `string`                                                                                | No       | —            | The UUID of the employee. Optional for composed form scenarios where the ID isn't known until a prior form submits — pass it via `onSubmit` options instead. Required for update mode (fetches existing data). |
| `jobId`              | `string`                                                                                | No       | —            | The UUID of a specific job to edit. If omitted and the employee has exactly one job, that job is used. If omitted and the employee has no jobs, create mode is used.                                           |
| `withStartDateField` | `boolean`                                                                               | No       | `true`       | Whether to include the start date field. When `false`, pass start date via `onSubmit` options instead.                                                                                                         |
| `requiredFields`     | `CompensationField[] \| { create?: CompensationField[], update?: CompensationField[] }` | No       | —            | Additional fields to make required beyond API defaults. A flat array applies to both modes; an object targets specific modes.                                                                                  |
| `defaultValues`      | `Partial<CompensationFormData>`                                                         | No       | —            | Pre-fill form values. Server data takes precedence when editing an existing job.                                                                                                                               |
| `validationMode`     | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'`                          | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                                                                                                                       |
| `shouldFocusError`   | `boolean`                                                                               | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                                                                                                                |

### CompensationField

The `requiredFields` arrays accept these field names:

```typescript
type CompensationField = 'jobTitle' | 'flsaStatus' | 'rate' | 'paymentUnit' | 'startDate'
```

### Required Fields

**Required by default on create:** `jobTitle`, `flsaStatus`, `rate`, `paymentUnit`
**Required by default on update:** (none)

All `CompensationField` values are available to require in either mode. For example, pass `requiredFields: ['startDate']` to make the start date required on create. Note that `startDate` requirements are ignored when `withStartDateField` is `false`.

Cross-field validations (e.g., `minimumWageId` required when `adjustForMinimumWage` is `true`, workers' comp fields required in WA) are always enforced by the schema regardless of `requiredFields`.

```tsx
useCompensationForm({
  employeeId,
  requiredFields: {
    update: ['rate', 'paymentUnit'],
  },
})
```

### CompensationFormData

The shape of `defaultValues`:

```typescript
interface CompensationFormData {
  jobTitle: string
  flsaStatus: FlsaStatusType // 'Exempt' | 'Salaried Nonexempt' | 'Nonexempt' | 'Owner' | 'Commission Only Exempt' | 'Commission Only Nonexempt'
  rate: number
  paymentUnit: PaymentUnit // 'Hour' | 'Week' | 'Month' | 'Year' | 'Paycheck'
  adjustForMinimumWage: boolean
  minimumWageId: string
  twoPercentShareholder: boolean
  stateWcCovered: boolean
  stateWcClassCode: string
  startDate: string | null // ISO date string (YYYY-MM-DD) or null
}
```

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
    compensation: Compensation | null
    jobs: Job[]
    currentJob: Job | null
    minimumWages: MinimumWage[]
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: {
    onSubmit: (
      callbacks?: CompensationSubmitCallbacks,
      options?: CompensationSubmitOptions,
    ) => Promise<HookSubmitResult<Compensation | undefined> | undefined>
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

### Submit callbacks

`onSubmit` accepts optional callbacks and options:

```typescript
interface CompensationSubmitCallbacks {
  onJobCreated?: (job: Job) => void
  onJobUpdated?: (job: Job) => void
  onCompensationUpdated?: (compensation: Compensation | undefined) => void
}

interface CompensationSubmitOptions {
  employeeId?: string // Provide at submit time for composed forms where employeeId is not in props
  startDate?: string // Pass a start date programmatically when withStartDateField is false
}
```

---

## Fields Reference

All fields accept `label` (required) and `description` (optional). Fields with validation accept `validationMessages`. Select and RadioGroup fields accept `getOptionLabel` to customize how options are displayed. All fields except SwitchHookField accept an optional `FieldComponent` prop to override the rendered UI component.

### Error Codes

```typescript
const CompensationErrorCodes = {
  REQUIRED: 'REQUIRED',
  RATE_MINIMUM: 'RATE_MINIMUM',
  RATE_EXEMPT_THRESHOLD: 'RATE_EXEMPT_THRESHOLD',
  PAYMENT_UNIT_OWNER: 'PAYMENT_UNIT_OWNER',
  PAYMENT_UNIT_COMMISSION: 'PAYMENT_UNIT_COMMISSION',
  RATE_COMMISSION_ZERO: 'RATE_COMMISSION_ZERO',
} as const
```

---

### Fields.StartDate

Date picker for the employee's hire/start date.

| Prop                 | Type                             | Required |
| -------------------- | -------------------------------- | -------- |
| `label`              | `string`                         | Yes      |
| `description`        | `ReactNode`                      | No       |
| `validationMessages` | `{ REQUIRED: string }`           | No       |
| `FieldComponent`     | `ComponentType<DatePickerProps>` | No       |

**Conditional availability:** This field is `undefined` when `withStartDateField` is `false`.

```tsx
{
  Fields.StartDate && (
    <Fields.StartDate
      label="Start date"
      validationMessages={{ REQUIRED: 'Start date is required' }}
    />
  )
}
```

---

### Fields.JobTitle

Text input for the job title.

| Prop                 | Type                            | Required |
| -------------------- | ------------------------------- | -------- |
| `label`              | `string`                        | Yes      |
| `description`        | `ReactNode`                     | No       |
| `validationMessages` | `{ REQUIRED: string }`          | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>` | No       |

**Always required.**

```tsx
<Fields.JobTitle label="Job title" validationMessages={{ REQUIRED: 'Job title is required' }} />
```

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

**Options:**

| Value                         | Default label               | Suggested display label               |
| ----------------------------- | --------------------------- | ------------------------------------- |
| `'Exempt'`                    | `Exempt`                    | Salary/No overtime                    |
| `'Salaried Nonexempt'`        | `Salaried Nonexempt`        | Salary/Eligible for overtime          |
| `'Nonexempt'`                 | `Nonexempt`                 | Paid by the hour                      |
| `'Owner'`                     | `Owner`                     | Owner's draw                          |
| `'Commission Only Exempt'`    | `Commission Only Exempt`    | Commission Only/No Overtime           |
| `'Commission Only Nonexempt'` | `Commission Only Nonexempt` | Commission Only/Eligible for overtime |

By default, the raw API values are used as option labels (e.g., `"Exempt"`, `"Nonexempt"`). This works out of the box without any extra configuration:

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

If you want friendlier display text, pass `getOptionLabel` to map each entry to a custom string. The callback receives the raw `FlsaStatusType` value:

```tsx
{
  Fields.FlsaStatus && (
    <Fields.FlsaStatus
      label="Employee type"
      description={
        <a href="https://support.gusto.com/..." target="_blank">
          Learn more about employee classifications.
        </a>
      }
      getOptionLabel={status => {
        const labels: Record<string, string> = {
          Exempt: 'Salary/No overtime',
          'Salaried Nonexempt': 'Salary/Eligible for overtime',
          Nonexempt: 'Paid by the hour',
          Owner: "Owner's draw",
          'Commission Only Exempt': 'Commission Only/No Overtime',
          'Commission Only Nonexempt': 'Commission Only/Eligible for overtime',
        }
        return labels[status] ?? status
      }}
      validationMessages={{ REQUIRED: 'Employee classification is required' }}
    />
  )
}
```

**Conditional availability:** This field is `undefined` when the FLSA status cannot be changed — specifically, when the employee has a non-primary job with a non-Nonexempt status that was already set.

---

### Fields.Rate

Number input for the compensation amount. Formatted as currency.

| Prop                 | Type                                                                        | Required |
| -------------------- | --------------------------------------------------------------------------- | -------- |
| `label`              | `string`                                                                    | Yes      |
| `description`        | `ReactNode`                                                                 | No       |
| `validationMessages` | `{ REQUIRED: string, RATE_MINIMUM: string, RATE_EXEMPT_THRESHOLD: string }` | No       |
| `FieldComponent`     | `ComponentType<NumberInputProps>`                                           | No       |

**Validation codes:**

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
    RATE_EXEMPT_THRESHOLD: `FLSA Exempt employees must meet salary threshold of $${FLSA_OVERTIME_SALARY_LIMIT}/year`,
  }}
/>
```

---

### Fields.PaymentUnit

Select dropdown for the pay period unit.

| Prop                 | Type                            | Required |
| -------------------- | ------------------------------- | -------- |
| `label`              | `string`                        | Yes      |
| `description`        | `ReactNode`                     | No       |
| `validationMessages` | `{ REQUIRED: string }`          | No       |
| `getOptionLabel`     | `(unit: PaymentUnit) => string` | No       |
| `FieldComponent`     | `ComponentType<SelectProps>`    | No       |

**Options:**

| Value        | Default label |
| ------------ | ------------- |
| `'Hour'`     | `Hour`        |
| `'Week'`     | `Week`        |
| `'Month'`    | `Month`       |
| `'Year'`     | `Year`        |
| `'Paycheck'` | `Paycheck`    |

This field is automatically **disabled** when the FLSA status is Owner (forced to `Paycheck`) or Commission Only (forced to `Year`).

By default, the raw values are used as labels (`"Hour"`, `"Week"`, etc.). You can optionally pass `getOptionLabel` to customize display text:

```tsx
<Fields.PaymentUnit
  label="Per"
  description="The period over which the compensation amount is tracked."
  getOptionLabel={unit => {
    const labels: Record<string, string> = {
      Hour: 'Per hour',
      Week: 'Per week',
      Month: 'Per month',
      Year: 'Per year',
      Paycheck: 'Per paycheck',
    }
    return labels[unit] ?? unit
  }}
  validationMessages={{ REQUIRED: 'Payment unit is required' }}
/>
```

---

### Fields.AdjustForMinimumWage

Checkbox to enable minimum wage adjustment for the compensation.

| Prop             | Type                           | Required |
| ---------------- | ------------------------------ | -------- |
| `label`          | `string`                       | Yes      |
| `description`    | `ReactNode`                    | No       |
| `FieldComponent` | `ComponentType<CheckboxProps>` | No       |

No validation codes.

**Conditional availability:** This field is `undefined` when:

- FLSA status is not `Nonexempt`
- No minimum wages are available for the employee's work location
- The employee's work state does not support tip credits

```tsx
{
  Fields.AdjustForMinimumWage && (
    <Fields.AdjustForMinimumWage
      label="Adjust for minimum wage"
      description="Determines whether the compensation should be adjusted for minimum wage."
    />
  )
}
```

---

### Fields.MinimumWageId

Select dropdown to choose which minimum wage to adjust to. Only appears when `AdjustForMinimumWage` is checked.

| Prop                 | Type                         | Required |
| -------------------- | ---------------------------- | -------- |
| `label`              | `string`                     | Yes      |
| `description`        | `ReactNode`                  | No       |
| `validationMessages` | `{ REQUIRED: string }`       | No       |
| `FieldComponent`     | `ComponentType<SelectProps>` | No       |

**Options:** Dynamically populated from minimum wages available at the employee's work location. Each option displays the wage amount, authority, and notes (e.g., `"15.00 - City of Seattle: Large employer"`).

**Conditional availability:** This field is `undefined` when:

- `AdjustForMinimumWage` is not available
- The `adjustForMinimumWage` checkbox is not checked

```tsx
{
  Fields.MinimumWageId && (
    <Fields.MinimumWageId
      label="Minimum wage"
      description="Which minimum wage requirement should compensation be adjusted to."
      validationMessages={{ REQUIRED: 'Please select minimum wage for adjustment' }}
    />
  )
}
```

---

### Fields.TwoPercentShareholder

Checkbox indicating whether the employee is a 2% shareholder in an S-Corporation.

| Prop             | Type                           | Required |
| ---------------- | ------------------------------ | -------- |
| `label`          | `string`                       | Yes      |
| `description`    | `ReactNode`                    | No       |
| `FieldComponent` | `ComponentType<CheckboxProps>` | No       |

No validation codes.

**Conditional availability:** This field is `undefined` when the company's tax payer type is not `S-Corporation`.

```tsx
{
  Fields.TwoPercentShareholder && (
    <Fields.TwoPercentShareholder label="Select if employee is a 2% shareholder" />
  )
}
```

---

### Fields.StateWcCovered

Radio group for Washington state workers' compensation coverage.

| Prop             | Type                             | Required |
| ---------------- | -------------------------------- | -------- |
| `label`          | `string`                         | Yes      |
| `description`    | `ReactNode`                      | No       |
| `getOptionLabel` | `(key: string) => string`        | No       |
| `FieldComponent` | `ComponentType<RadioGroupProps>` | No       |

**Options:**

| Value     | Default label |
| --------- | ------------- |
| `'true'`  | `Yes`         |
| `'false'` | `No`          |

**Conditional availability:** This field is `undefined` when the employee does not work in Washington state.

By default, options display as `"Yes"` and `"No"`. You can optionally pass `getOptionLabel` for more descriptive text:

```tsx
{
  Fields.StateWcCovered && (
    <Fields.StateWcCovered
      label="Workers' compensation coverage"
      description="Indicate if this employee is exempt from the workers' comp tax."
      getOptionLabel={key =>
        key === 'yes' ? 'Yes, this employee is covered' : 'No, this employee is not covered'
      }
    />
  )
}
```

---

### Fields.StateWcClassCode

Select dropdown for Washington state workers' compensation risk class code.

| Prop                 | Type                         | Required |
| -------------------- | ---------------------------- | -------- |
| `label`              | `string`                     | Yes      |
| `description`        | `ReactNode`                  | No       |
| `validationMessages` | `{ REQUIRED: string }`       | No       |
| `FieldComponent`     | `ComponentType<SelectProps>` | No       |

**Options:** Populated from Washington state risk class codes. Each option displays the code and description (e.g., `"0101: Grain dealers"`).

**Conditional availability:** This field is `undefined` when:

- The employee does not work in Washington state
- `stateWcCovered` is not checked

```tsx
{
  Fields.StateWcClassCode && (
    <Fields.StateWcClassCode
      label="Risk class code"
      description="The risk class code associated with this employee's job function."
      validationMessages={{ REQUIRED: 'Please select a risk class code' }}
    />
  )
}
```

---

## Usage Example

A complete example showing all fields, validation messages, `getOptionLabel` usage, and submit handling:

```tsx
import {
  useCompensationForm,
  SDKFormProvider,
  type UseCompensationFormReady,
} from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'

function CompensationPage({ employeeId }: { employeeId: string }) {
  const compensation = useCompensationForm({
    employeeId,
    withStartDateField: true,
  })

  if (compensation.isLoading) {
    const { errors, retryQueries } = compensation.errorHandling

    if (errors.length > 0) {
      return (
        <div>
          <p>Failed to load compensation data.</p>
          <ul>
            {errors.map((error, i) => (
              <li key={i}>{error.message}</li>
            ))}
          </ul>
          <button onClick={retryQueries}>Retry</button>
        </div>
      )
    }

    return <div>Loading...</div>
  }

  return <CompensationFormReady compensation={compensation} />
}

function CompensationFormReady({ compensation }: { compensation: UseCompensationFormReady }) {
  const { Fields } = compensation.form

  const flsaStatusLabels: Record<string, string> = {
    Exempt: 'Salary/No overtime',
    'Salaried Nonexempt': 'Salary/Eligible for overtime',
    Nonexempt: 'Paid by the hour',
    Owner: "Owner's draw",
    'Commission Only Exempt': 'Commission Only/No Overtime',
    'Commission Only Nonexempt': 'Commission Only/Eligible for overtime',
  }

  const handleSubmit = async () => {
    const result = await compensation.actions.onSubmit({
      onJobCreated: job => {
        console.log('Job created:', job.uuid)
      },
      onJobUpdated: job => {
        console.log('Job updated:', job.uuid)
      },
      onCompensationUpdated: comp => {
        console.log('Compensation updated:', comp?.uuid)
      },
    })

    if (result) {
      console.log(`${result.mode}d compensation:`, result.data?.uuid)
    }
  }

  return (
    <SDKFormProvider formHookResult={compensation}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <h2>{compensation.status.mode === 'create' ? 'Add Job' : 'Edit Job'}</h2>

        {compensation.errorHandling.errors.length > 0 && (
          <div role="alert">
            {compensation.errorHandling.errors.map((error, i) => (
              <p key={i}>{error.message}</p>
            ))}
          </div>
        )}

        {Fields.StartDate && (
          <Fields.StartDate
            label="Start date"
            validationMessages={{ REQUIRED: 'Start date is required' }}
          />
        )}

        <Fields.JobTitle
          label="Job title"
          validationMessages={{ REQUIRED: 'Job title is required' }}
        />

        {Fields.FlsaStatus && (
          <Fields.FlsaStatus
            label="Employee type"
            description={
              <a
                href="https://support.gusto.com/team-management/team-payments/pay-rates/1001671771/Employee-classification-options.htm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about employee classifications.
              </a>
            }
            getOptionLabel={status => flsaStatusLabels[status] ?? status}
            validationMessages={{ REQUIRED: 'Employee classification is required' }}
          />
        )}

        <Fields.Rate
          label="Compensation amount"
          validationMessages={{
            REQUIRED: 'Amount is a required field',
            RATE_MINIMUM: 'Amount must be at least $1.00',
            RATE_EXEMPT_THRESHOLD:
              'FLSA Exempt employees must meet salary threshold of $35,568/year',
          }}
        />

        <Fields.PaymentUnit
          label="Per"
          description="The period over which the compensation amount is tracked."
          getOptionLabel={unit => unit}
          validationMessages={{ REQUIRED: 'Payment unit is required' }}
        />

        {Fields.AdjustForMinimumWage && (
          <Fields.AdjustForMinimumWage
            label="Adjust for minimum wage"
            description="Determines whether the compensation should be adjusted for minimum wage."
          />
        )}

        {Fields.MinimumWageId && (
          <Fields.MinimumWageId
            label="Minimum wage"
            description="Which minimum wage requirement should compensation be adjusted to."
            validationMessages={{ REQUIRED: 'Please select minimum wage for adjustment' }}
          />
        )}

        {Fields.TwoPercentShareholder && (
          <Fields.TwoPercentShareholder label="Select if employee is a 2% shareholder" />
        )}

        {Fields.StateWcCovered && (
          <Fields.StateWcCovered
            label="Workers' compensation coverage"
            description="Indicate if this employee is exempt from the workers' comp tax."
            getOptionLabel={key =>
              key === 'yes' ? 'Yes, this employee is covered' : 'No, this employee is not covered'
            }
          />
        )}

        {Fields.StateWcClassCode && (
          <Fields.StateWcClassCode
            label="Risk class code"
            description="The risk class code associated with this employee's job function."
            validationMessages={{ REQUIRED: 'Please select a risk class code' }}
          />
        )}

        <button type="submit" disabled={compensation.status.isPending}>
          {compensation.status.mode === 'create' ? 'Add job' : 'Save job'}
        </button>
      </form>
    </SDKFormProvider>
  )
}
```
