---
title: usePayScheduleForm
order: 5
---

# usePayScheduleForm

Creates or updates a company pay schedule — configuring frequency, pay dates, and previewing the resulting pay period calendar.

```tsx
import { usePayScheduleForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

---

## Props

`usePayScheduleForm` accepts a single options object:

| Prop                      | Type                                                           | Required | Default      | Description                                                                                                                           |
| ------------------------- | -------------------------------------------------------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `companyId`               | `string`                                                       | Yes      | —            | The UUID of the company.                                                                                                              |
| `payScheduleId`           | `string`                                                       | No       | —            | The UUID of an existing pay schedule. When provided, the hook enters update mode and pre-populates the form with the schedule's data. |
| `optionalFieldsToRequire` | `PayScheduleOptionalFieldsToRequire`                           | No       | —            | Override specific fields that are optional in a given mode to be required.                                                            |
| `defaultValues`           | `Partial<PayScheduleFormData>`                                 | No       | —            | Pre-fill form values. Server data takes precedence when editing an existing pay schedule.                                             |
| `validationMode`          | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                                              |
| `shouldFocusError`        | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                                       |

### Configurable Required Fields

The `optionalFieldsToRequire` prop lets you override optional fields to be required in a given mode. Only fields with `'never'` requiredness rules are configurable:

```tsx
usePayScheduleForm({
  companyId,
  optionalFieldsToRequire: {
    create: ['customTwicePerMonth'],
  },
})
```

`customTwicePerMonth` is the only field configurable via `optionalFieldsToRequire`. All other fields use either `'always'` requiredness or conditional predicate rules that are not partner-configurable.

### PayScheduleFormData

The shape of `defaultValues`:

```typescript
interface PayScheduleFormData {
  customName: string // Display name for the schedule
  frequency: 'Every week' | 'Every other week' | 'Twice per month' | 'Monthly'
  customTwicePerMonth: string // '1st15th' | 'custom' | ''
  anchorPayDate: string | null // ISO date string (YYYY-MM-DD)
  anchorEndOfPayPeriod: string | null // ISO date string (YYYY-MM-DD)
  day1: number // First pay day of the month (1–31)
  day2: number // Last pay day of the month (1–31)
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
    paySchedule: PayScheduleObject | null
    payPeriodPreview: PayPeriods[] | null
    payPreviewLoading: boolean
    paymentSpeedDays: number
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<PayScheduleCreateUpdate> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: PayScheduleFormFields
    fieldsMetadata: PayScheduleFieldsMetadata
    hookFormInternals: { formMethods: UseFormReturn }
    getFormSubmissionValues: () => PayScheduleFormOutputs | undefined
  }
}
```

### Mode detection

The hook enters create mode when no `payScheduleId` is provided (or the schedule can't be fetched). When an existing pay schedule is loaded, it enters update mode.

### Data

| Property            | Type                        | Description                                                                                               |
| ------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| `paySchedule`       | `PayScheduleObject \| null` | The loaded pay schedule entity, or `null` in create mode.                                                 |
| `payPeriodPreview`  | `PayPeriods[] \| null`      | Array of upcoming pay periods based on current form values. `null` when required fields are incomplete.   |
| `payPreviewLoading` | `boolean`                   | `true` while the preview API call is in flight.                                                           |
| `paymentSpeedDays`  | `number`                    | Number of business days the company needs to process payroll (from payment configs). Useful for UI hints. |

### Submit

`onSubmit` takes no arguments. It validates the form, calls the create or update API, and returns the result:

```tsx
const result = await paySchedule.actions.onSubmit()

if (result) {
  // result.mode is 'create' or 'update'
  // result.data is the saved PayScheduleCreateUpdate entity
  console.log(`Pay schedule ${result.mode}d:`, result.data.uuid)
}
```

If validation fails, `onSubmit` returns `undefined` and the form fields display their error messages. If the API mutation fails, the error is captured in `errorHandling.errors`.

---

## Fields Reference

All fields accept `label` (required) and `description` (optional). Fields with validation accept `validationMessages` mapping error codes to display strings.

### Error Codes

```typescript
const PayScheduleErrorCodes = {
  REQUIRED: 'REQUIRED',
  DAY_RANGE: 'DAY_RANGE',
} as const
```

---

### Fields.CustomName

Text input for the pay schedule's display name.

| Prop                 | Type                            | Required |
| -------------------- | ------------------------------- | -------- |
| `label`              | `string`                        | Yes      |
| `description`        | `ReactNode`                     | No       |
| `validationMessages` | `{ REQUIRED: string }`          | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>` | No       |

**Always required** in both create and update modes.

---

### Fields.Frequency

Select dropdown for the payroll frequency.

| Prop                 | Type                                          | Required |
| -------------------- | --------------------------------------------- | -------- |
| `label`              | `string`                                      | Yes      |
| `description`        | `ReactNode`                                   | No       |
| `validationMessages` | `{ REQUIRED: string }`                        | No       |
| `getOptionLabel`     | `(frequency: PayScheduleFrequency) => string` | No       |
| `FieldComponent`     | `ComponentType<SelectProps>`                  | No       |

**Options:** `'Every week'`, `'Every other week'`, `'Twice per month'`, `'Monthly'`

**Always required.** Defaults to `'Every week'` in create mode.

Use `getOptionLabel` to customize how frequency options are displayed:

```tsx
<Fields.Frequency
  label="Frequency"
  getOptionLabel={freq => t(`frequencies.${freq}`, freq)}
  validationMessages={{ REQUIRED: 'Frequency is required' }}
/>
```

---

### Fields.CustomTwicePerMonth

Radio group for selecting the twice-per-month pay day strategy.

| Prop             | Type                             | Required |
| ---------------- | -------------------------------- | -------- |
| `label`          | `string`                         | Yes      |
| `description`    | `ReactNode`                      | No       |
| `FieldComponent` | `ComponentType<RadioGroupProps>` | No       |

**Options:** `'15th and Last day of the month'` (`'1st15th'`), `'Custom'` (`'custom'`)

**Conditional availability:** This field is `undefined` when the selected frequency is not `'Twice per month'`. Always check before rendering:

```tsx
{
  Fields.CustomTwicePerMonth && (
    <Fields.CustomTwicePerMonth
      label="Frequency Options"
      description="Select the pay days for the month."
    />
  )
}
```

When `'15th and Last day of the month'` is selected, `day1` and `day2` are automatically set to `15` and `31` respectively. When `'Custom'` is selected, the `Day1` and `Day2` fields become visible for manual entry.

---

### Fields.AnchorPayDate

Date picker for the first pay date.

| Prop                 | Type                             | Required |
| -------------------- | -------------------------------- | -------- |
| `label`              | `string`                         | Yes      |
| `description`        | `ReactNode`                      | No       |
| `validationMessages` | `{ REQUIRED: string }`           | No       |
| `FieldComponent`     | `ComponentType<DatePickerProps>` | No       |

**Always required.** This is the date of the first paycheck under this schedule.

```tsx
<Fields.AnchorPayDate
  label="First pay date"
  description={`Please account for the ${paymentSpeedDays} days it will take to process payroll.`}
  validationMessages={{ REQUIRED: 'First pay date is required' }}
/>
```

---

### Fields.AnchorEndOfPayPeriod

Date picker for the end date of the first pay period.

| Prop                 | Type                             | Required |
| -------------------- | -------------------------------- | -------- |
| `label`              | `string`                         | Yes      |
| `description`        | `ReactNode`                      | No       |
| `validationMessages` | `{ REQUIRED: string }`           | No       |
| `FieldComponent`     | `ComponentType<DatePickerProps>` | No       |

**Always required.** This date helps the API calculate future pay periods. It can be the same date as the first pay date.

---

### Fields.Day1

Number input for the first pay day of the month (1–31).

| Prop                 | Type                                      | Required |
| -------------------- | ----------------------------------------- | -------- |
| `label`              | `string`                                  | Yes      |
| `description`        | `ReactNode`                               | No       |
| `validationMessages` | `{ REQUIRED: string, DAY_RANGE: string }` | No       |
| `FieldComponent`     | `ComponentType<NumberInputProps>`         | No       |

**Conditional availability:** This field is `undefined` unless:

- Frequency is `'Monthly'`, or
- Frequency is `'Twice per month'` and `CustomTwicePerMonth` is `'Custom'`

```tsx
{
  Fields.Day1 && (
    <Fields.Day1
      label="First pay day of the month"
      validationMessages={{
        REQUIRED: 'First pay day of the month is required',
        DAY_RANGE: 'Must be between 1 and 31',
      }}
    />
  )
}
```

---

### Fields.Day2

Number input for the last pay day of the month (1–31).

| Prop                 | Type                                      | Required |
| -------------------- | ----------------------------------------- | -------- |
| `label`              | `string`                                  | Yes      |
| `description`        | `ReactNode`                               | No       |
| `validationMessages` | `{ REQUIRED: string, DAY_RANGE: string }` | No       |
| `FieldComponent`     | `ComponentType<NumberInputProps>`         | No       |

**Conditional availability:** This field is `undefined` unless frequency is `'Twice per month'` and `CustomTwicePerMonth` is `'Custom'`.

---

## Pay Period Preview

The hook provides a live pay period preview based on the current form values. When both `anchorPayDate` and `anchorEndOfPayPeriod` are filled in, the hook fetches a preview of upcoming pay periods from the API.

```tsx
const { payPeriodPreview, payPreviewLoading, paymentSpeedDays } = paySchedule.data

// payPeriodPreview is null until both date fields are complete
if (payPeriodPreview) {
  payPeriodPreview.forEach(period => {
    console.log(period.startDate, period.endDate, period.checkDate, period.runPayrollBy)
  })
}
```

Each `PayPeriods` entry contains:

| Property       | Type                  | Description                                     |
| -------------- | --------------------- | ----------------------------------------------- |
| `startDate`    | `string \| undefined` | Start of the pay period (ISO date)              |
| `endDate`      | `string \| undefined` | End of the pay period (ISO date)                |
| `checkDate`    | `string \| undefined` | The payday — when employees receive their check |
| `runPayrollBy` | `string \| undefined` | Deadline to process payroll for this period     |

The preview automatically refreshes when frequency, dates, or day1/day2 values change.

---

## Usage Examples

### Basic create form with `SDKFormProvider`

```tsx
import {
  usePayScheduleForm,
  SDKFormProvider,
  type UsePayScheduleFormReady,
} from '@gusto/embedded-react-sdk'

function PaySchedulePage({ companyId }: { companyId: string }) {
  const paySchedule = usePayScheduleForm({ companyId })

  if (paySchedule.isLoading) {
    const { errors, retryQueries } = paySchedule.errorHandling

    if (errors.length > 0) {
      return (
        <div>
          <p>Failed to load pay schedule data.</p>
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

  return <PayScheduleFormReady paySchedule={paySchedule} />
}

function PayScheduleFormReady({ paySchedule }: { paySchedule: UsePayScheduleFormReady }) {
  const { Fields } = paySchedule.form
  const { paymentSpeedDays } = paySchedule.data

  const handleSubmit = async () => {
    const result = await paySchedule.actions.onSubmit()
    if (result) {
      console.log(`Pay schedule ${result.mode}d:`, result.data.uuid)
    }
  }

  return (
    <SDKFormProvider formHookResult={paySchedule}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <h2>{paySchedule.status.mode === 'create' ? 'Add Pay Schedule' : 'Edit Pay Schedule'}</h2>

        {paySchedule.errorHandling.errors.length > 0 && (
          <div role="alert">
            {paySchedule.errorHandling.errors.map((error, i) => (
              <p key={i}>{error.message}</p>
            ))}
          </div>
        )}

        <Fields.CustomName label="Name" validationMessages={{ REQUIRED: 'Name is required' }} />

        <Fields.Frequency
          label="Frequency"
          validationMessages={{ REQUIRED: 'Frequency is required' }}
        />

        {Fields.CustomTwicePerMonth && (
          <Fields.CustomTwicePerMonth
            label="Frequency Options"
            description="Select the pay days for the month."
          />
        )}

        <Fields.AnchorPayDate
          label="First pay date"
          description={`Please account for the ${paymentSpeedDays} days it will take to process payroll.`}
          validationMessages={{ REQUIRED: 'First pay date is required' }}
        />

        <Fields.AnchorEndOfPayPeriod
          label="First pay period end date"
          description="The last date of the first pay period to help calculate future pay periods."
          validationMessages={{ REQUIRED: 'First pay period end date is required' }}
        />

        {Fields.Day1 && (
          <Fields.Day1
            label="First pay day of the month"
            validationMessages={{
              REQUIRED: 'First pay day is required',
              DAY_RANGE: 'Must be between 1 and 31',
            }}
          />
        )}

        {Fields.Day2 && (
          <Fields.Day2
            label="Last pay day of the month"
            validationMessages={{
              REQUIRED: 'Last pay day is required',
              DAY_RANGE: 'Must be between 1 and 31',
            }}
          />
        )}

        <button type="submit" disabled={paySchedule.status.isPending}>
          {paySchedule.status.isPending ? 'Saving...' : 'Save'}
        </button>
      </form>
    </SDKFormProvider>
  )
}
```

### Edit mode

Pass `payScheduleId` to load an existing schedule and enter update mode:

```tsx
const paySchedule = usePayScheduleForm({
  companyId: 'company-uuid',
  payScheduleId: 'existing-schedule-uuid',
})

// paySchedule.status.mode will be 'update'
// paySchedule.data.paySchedule contains the loaded schedule
```

### With `formHookResult` prop

The same form using prop-based field connection. No `SDKFormProvider` wrapper needed:

```tsx
import { usePayScheduleForm, type UsePayScheduleFormReady } from '@gusto/embedded-react-sdk'

function PayScheduleFormReady({ paySchedule }: { paySchedule: UsePayScheduleFormReady }) {
  const { Fields } = paySchedule.form

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        void paySchedule.actions.onSubmit()
      }}
    >
      <Fields.CustomName
        label="Name"
        formHookResult={paySchedule}
        validationMessages={{ REQUIRED: 'Name is required' }}
      />

      <Fields.Frequency
        label="Frequency"
        formHookResult={paySchedule}
        validationMessages={{ REQUIRED: 'Frequency is required' }}
      />

      {Fields.CustomTwicePerMonth && (
        <Fields.CustomTwicePerMonth
          label="Frequency Options"
          formHookResult={paySchedule}
          description="Select the pay days for the month."
        />
      )}

      <Fields.AnchorPayDate
        label="First pay date"
        formHookResult={paySchedule}
        validationMessages={{ REQUIRED: 'First pay date is required' }}
      />

      <Fields.AnchorEndOfPayPeriod
        label="First pay period end date"
        formHookResult={paySchedule}
        validationMessages={{ REQUIRED: 'End date is required' }}
      />

      {Fields.Day1 && (
        <Fields.Day1
          label="First pay day of the month"
          formHookResult={paySchedule}
          validationMessages={{
            REQUIRED: 'Required',
            DAY_RANGE: 'Must be between 1 and 31',
          }}
        />
      )}

      {Fields.Day2 && (
        <Fields.Day2
          label="Last pay day of the month"
          formHookResult={paySchedule}
          validationMessages={{
            REQUIRED: 'Required',
            DAY_RANGE: 'Must be between 1 and 31',
          }}
        />
      )}

      <button type="submit" disabled={paySchedule.status.isPending}>
        Save
      </button>
    </form>
  )
}
```

### Using the pay period preview

Build a calendar preview UI using the hook's preview data:

```tsx
function PaySchedulePreview({ paySchedule }: { paySchedule: UsePayScheduleFormReady }) {
  const { payPeriodPreview, payPreviewLoading } = paySchedule.data
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (payPreviewLoading) {
    return <div>Loading preview...</div>
  }

  if (!payPeriodPreview || payPeriodPreview.length === 0) {
    return <p>Complete the required fields to see a preview of your pay schedule.</p>
  }

  const period = payPeriodPreview[selectedIndex]

  return (
    <div>
      <select value={selectedIndex} onChange={e => setSelectedIndex(Number(e.target.value))}>
        {payPeriodPreview.map((p, i) => (
          <option key={i} value={i}>
            {p.startDate} – {p.endDate}
          </option>
        ))}
      </select>

      {period?.checkDate && <p>Payday: {period.checkDate}</p>}
      {period?.runPayrollBy && <p>Run payroll by: {period.runPayrollBy}</p>}
    </div>
  )
}
```
