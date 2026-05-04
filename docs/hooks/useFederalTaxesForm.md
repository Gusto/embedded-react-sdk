---
title: useFederalTaxesForm
order: 6
---

# useFederalTaxesForm

Updates an employee's federal tax (W-4) withholding information — filing status, multiple-jobs flag, dependents, other income, deductions, and extra withholding.

```tsx
import { useFederalTaxesForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

The federal tax record is created automatically with the employee, so this hook is always in update mode. Only the revised 2020 W-4 format (`rev_2020_w4`) is supported for updates.

> **`<FederalTaxes>` component note:** When using the `Employee.FederalTaxes` component, set `isOnboarding` to `true` to render a single "Continue" submit button that emits `EMPLOYEE_FEDERAL_TAXES_DONE` after a successful save (so the parent flow can advance). Leave it `false` (default) for steady-state edit screens — the component then renders Cancel + Save buttons, where Cancel emits `CANCEL` and Save submits the form, surfaces a success alert, and keeps the user on the screen.

---

## Props

`useFederalTaxesForm` accepts a single options object:

| Prop                       | Type                                                            | Required | Default      | Description                                                                                                                          |
| -------------------------- | --------------------------------------------------------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `employeeId`               | `string`                                                        | Yes      | —            | The UUID of the employee whose federal tax record is being updated.                                                                  |
| `optionalFieldsToRequire`  | `FederalTaxesOptionalFieldsToRequire`                           | No       | —            | Per-mode partner override that promotes optional fields to required. All hook fields are required by default, so this is rarely needed. |
| `defaultValues`            | `Partial<FederalTaxesFormData>`                                 | No       | —            | Pre-fill form values. Server data takes precedence when the employee already has values on file.                                     |
| `validationMode`           | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'`  | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                                             |
| `shouldFocusError`         | `boolean`                                                       | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                                      |

### FederalTaxesField

The `optionalFieldsToRequire` arrays accept these field names:

```typescript
type FederalTaxesField =
  | 'filingStatus'
  | 'twoJobs'
  | 'dependentsAmount'
  | 'otherIncome'
  | 'deductions'
  | 'extraWithholding'
```

### Required Fields

**Required by default on update:** all fields (`filingStatus`, `twoJobs`, `dependentsAmount`, `otherIncome`, `deductions`, `extraWithholding`). The `twoJobs` checkbox always carries a boolean value, so the required check is inherently satisfied; it cannot be left unselected.

### FederalTaxesFormData

The shape of `defaultValues`:

```typescript
interface FederalTaxesFormData {
  filingStatus: string // 'Single' | 'Married' | 'Head of Household' | 'Exempt from withholding' | ''
  twoJobs: boolean
  dependentsAmount: number
  otherIncome: number
  deductions: number
  extraWithholding: number
}
```

The four currency fields (`dependentsAmount`, `otherIncome`, `deductions`, `extraWithholding`) default to `0`. `filingStatus` defaults to an empty string when neither the server nor `defaultValues` provides a value, forcing the user to make an explicit selection.

The constant `FILING_STATUS_VALUES` is exported from the SDK for typing and rendering custom selects:

```typescript
import { FILING_STATUS_VALUES, type FilingStatusValue } from '@gusto/embedded-react-sdk'
// FILING_STATUS_VALUES === ['Single', 'Married', 'Head of Household', 'Exempt from withholding']
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
    employeeFederalTax: EmployeeFederalTax
  }
  status: {
    isPending: boolean
    mode: 'update'
  }
  actions: {
    onSubmit: (
      callbacks?: FederalTaxesSubmitCallbacks,
    ) => Promise<HookSubmitResult<EmployeeFederalTax> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: FederalTaxesFormFields
    fieldsMetadata: FederalTaxesFieldsMetadata
    hookFormInternals: { formMethods: UseFormReturn }
    getFormSubmissionValues: () => FederalTaxesFormOutputs | undefined
  }
}
```

### Mode

`status.mode` is always `'update'`. The federal tax record is created when the employee is created, so the hook does not have a create mode.

### Submit callbacks

`onSubmit` accepts an optional callbacks object:

```typescript
interface FederalTaxesSubmitCallbacks {
  onFederalTaxesUpdated?: (federalTaxes: EmployeeFederalTax) => void
}
```

The callback fires after a successful update with the updated `EmployeeFederalTax` entity. The same entity is also returned in `result.data` from `onSubmit`.

---

## Fields Reference

All fields accept `label` (required) and `description` (optional). Fields with validation accept `validationMessages` mapping error codes to display strings. All fields accept an optional `FieldComponent` prop to override the rendered UI component.

### Error Codes

```typescript
const FederalTaxesErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const
```

| Field              | Input type     | Required by default | Error codes | Conditional availability |
| ------------------ | -------------- | ------------------- | ----------- | ------------------------ |
| `FilingStatus`     | Select          | Yes                 | `REQUIRED`  | Always available         |
| `TwoJobs`          | Radio group    | Yes (boolean)       | `REQUIRED`  | Always available         |
| `DependentsAmount` | Currency input | Yes                 | `REQUIRED`  | Always available         |
| `OtherIncome`      | Currency input | Yes                 | `REQUIRED`  | Always available         |
| `Deductions`       | Currency input | Yes                 | `REQUIRED`  | Always available         |
| `ExtraWithholding` | Currency input | Yes                 | `REQUIRED`  | Always available         |

---

### Fields.FilingStatus

Select dropdown for choosing the IRS filing status used for federal withholding.

| Prop                 | Type                                            | Required |
| -------------------- | ----------------------------------------------- | -------- |
| `label`              | `string`                                        | Yes      |
| `description`        | `ReactNode`                                     | No       |
| `placeholder`        | `string`                                        | No       |
| `validationMessages` | `{ REQUIRED: string }`                          | No       |
| `getOptionLabel`     | `(value: FilingStatusValue) => string`          | No       |
| `FieldComponent`     | `ComponentType<SelectProps>`                    | No       |

**Options:** Populated from `FILING_STATUS_VALUES` (`'Single'`, `'Married'`, `'Head of Household'`, `'Exempt from withholding'`). The default option label is the raw filing status value. Pass `getOptionLabel` to localize:

```tsx
<Fields.FilingStatus
  label="Federal filing status"
  placeholder="Select filing status..."
  description="Determines withholding for federal income taxes."
  validationMessages={{ REQUIRED: 'Please select filing status' }}
  getOptionLabel={value => t(`filingStatus.${value}`, { defaultValue: value })}
/>
```

---

### Fields.TwoJobs

Radio group for the W-4 multiple-jobs question (Step 2c).

| Prop                 | Type                                          | Required |
| -------------------- | --------------------------------------------- | -------- |
| `label`              | `string`                                      | Yes      |
| `description`        | `ReactNode`                                   | No       |
| `validationMessages` | `{ REQUIRED: string }`                        | No       |
| `getOptionLabel`     | `(value: boolean) => string`                  | No       |
| `FieldComponent`     | `ComponentType<RadioGroupProps>`              | No       |

**Options:** Two options for `true` and `false`. The default labels are `'Yes'` and `'No'`. Use `getOptionLabel` to localize:

```tsx
<Fields.TwoJobs
  label="Multiple jobs (2c)"
  validationMessages={{ REQUIRED: 'Please select an option' }}
  getOptionLabel={value => (value ? t('yesLabel') : t('noLabel'))}
/>
```

The form submits a boolean value. Because a radio group always has a selection, the `REQUIRED` code is never reached in practice — but it is listed for parity with other field types.

---

### Fields.DependentsAmount

Currency number input for the W-4 dependents total (Step 3).

| Prop                 | Type                              | Required |
| -------------------- | --------------------------------- | -------- |
| `label`              | `string`                          | Yes      |
| `description`        | `ReactNode`                       | No       |
| `validationMessages` | `{ REQUIRED: string }`            | No       |
| `FieldComponent`     | `ComponentType<NumberInputProps>` | No       |

The field renders with `format="currency"` and `min={0}`. Empty values coerce to `0` and pass the required check.

```tsx
<Fields.DependentsAmount
  label="Dependents (Step 3)"
  validationMessages={{ REQUIRED: 'This field is required' }}
/>
```

---

### Fields.OtherIncome

Currency number input for the W-4 other-income field (Step 4a).

| Prop                 | Type                              | Required |
| -------------------- | --------------------------------- | -------- |
| `label`              | `string`                          | Yes      |
| `description`        | `ReactNode`                       | No       |
| `validationMessages` | `{ REQUIRED: string }`            | No       |
| `FieldComponent`     | `ComponentType<NumberInputProps>` | No       |

```tsx
<Fields.OtherIncome
  label="Other income (Step 4a)"
  validationMessages={{ REQUIRED: 'This field is required' }}
/>
```

---

### Fields.Deductions

Currency number input for the W-4 deductions field (Step 4b).

| Prop                 | Type                              | Required |
| -------------------- | --------------------------------- | -------- |
| `label`              | `string`                          | Yes      |
| `description`        | `ReactNode`                       | No       |
| `validationMessages` | `{ REQUIRED: string }`            | No       |
| `FieldComponent`     | `ComponentType<NumberInputProps>` | No       |

```tsx
<Fields.Deductions
  label="Deductions (Step 4b)"
  validationMessages={{ REQUIRED: 'This field is required' }}
/>
```

---

### Fields.ExtraWithholding

Currency number input for the W-4 extra-withholding field (Step 4c).

| Prop                 | Type                              | Required |
| -------------------- | --------------------------------- | -------- |
| `label`              | `string`                          | Yes      |
| `description`        | `ReactNode`                       | No       |
| `validationMessages` | `{ REQUIRED: string }`            | No       |
| `FieldComponent`     | `ComponentType<NumberInputProps>` | No       |

```tsx
<Fields.ExtraWithholding
  label="Extra withholding (Step 4c)"
  validationMessages={{ REQUIRED: 'This field is required' }}
/>
```

---

## Usage Examples

### With `SDKFormProvider` (context)

A complete example using the context-based approach. All fields share the same hook, so a single `SDKFormProvider` wraps them.

```tsx
import {
  useFederalTaxesForm,
  SDKFormProvider,
  type UseFederalTaxesFormReady,
} from '@gusto/embedded-react-sdk'

function FederalTaxesPage({ employeeId }: { employeeId: string }) {
  const federalTaxes = useFederalTaxesForm({ employeeId })

  if (federalTaxes.isLoading) {
    const { errors, retryQueries } = federalTaxes.errorHandling

    if (errors.length > 0) {
      return (
        <div>
          <p>Failed to load federal tax data.</p>
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

  return <FederalTaxesFormReady federalTaxes={federalTaxes} />
}

function FederalTaxesFormReady({
  federalTaxes,
}: {
  federalTaxes: UseFederalTaxesFormReady
}) {
  const { Fields } = federalTaxes.form

  const handleSubmit = async () => {
    const result = await federalTaxes.actions.onSubmit({
      onFederalTaxesUpdated: federalTax => {
        console.log('Federal taxes updated:', federalTax.version)
      },
    })

    if (result) {
      console.log('Saved record:', result.data)
    }
  }

  return (
    <SDKFormProvider formHookResult={federalTaxes}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <h2>Federal tax withholdings (Form W-4)</h2>

        {federalTaxes.errorHandling.errors.length > 0 && (
          <div role="alert">
            {federalTaxes.errorHandling.errors.map((error, i) => (
              <p key={i}>{error.message}</p>
            ))}
          </div>
        )}

        <Fields.FilingStatus
          label="Federal filing status"
          placeholder="Select filing status..."
          validationMessages={{ REQUIRED: 'Please select filing status' }}
        />
        <Fields.TwoJobs
          label="Multiple jobs (2c)"
          validationMessages={{ REQUIRED: 'Please select an option' }}
        />
        <Fields.DependentsAmount
          label="Dependents"
          validationMessages={{ REQUIRED: 'This field is required' }}
        />
        <Fields.OtherIncome
          label="Other income"
          validationMessages={{ REQUIRED: 'This field is required' }}
        />
        <Fields.Deductions
          label="Deductions"
          validationMessages={{ REQUIRED: 'This field is required' }}
        />
        <Fields.ExtraWithholding
          label="Extra withholding"
          validationMessages={{ REQUIRED: 'This field is required' }}
        />

        <button type="submit" disabled={federalTaxes.status.isPending}>
          Save
        </button>
      </form>
    </SDKFormProvider>
  )
}
```

### With `formHookResult` prop

The same form using prop-based field connection — useful when interleaving these fields with other hooks' fields:

```tsx
import {
  useFederalTaxesForm,
  type UseFederalTaxesFormReady,
} from '@gusto/embedded-react-sdk'

function FederalTaxesPage({ employeeId }: { employeeId: string }) {
  const federalTaxes = useFederalTaxesForm({ employeeId })

  if (federalTaxes.isLoading) {
    return <div>Loading...</div>
  }

  return <FederalTaxesFormReady federalTaxes={federalTaxes} />
}

function FederalTaxesFormReady({
  federalTaxes,
}: {
  federalTaxes: UseFederalTaxesFormReady
}) {
  const { Fields } = federalTaxes.form

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        void federalTaxes.actions.onSubmit()
      }}
    >
      <h2>Federal tax withholdings (Form W-4)</h2>

      {federalTaxes.errorHandling.errors.length > 0 && (
        <div role="alert">
          {federalTaxes.errorHandling.errors.map((error, i) => (
            <p key={i}>{error.message}</p>
          ))}
        </div>
      )}

      <Fields.FilingStatus
        label="Federal filing status"
        formHookResult={federalTaxes}
        placeholder="Select filing status..."
        validationMessages={{ REQUIRED: 'Please select filing status' }}
      />
      <Fields.TwoJobs
        label="Multiple jobs (2c)"
        formHookResult={federalTaxes}
        validationMessages={{ REQUIRED: 'Please select an option' }}
      />
      <Fields.DependentsAmount
        label="Dependents"
        formHookResult={federalTaxes}
        validationMessages={{ REQUIRED: 'This field is required' }}
      />
      <Fields.OtherIncome
        label="Other income"
        formHookResult={federalTaxes}
        validationMessages={{ REQUIRED: 'This field is required' }}
      />
      <Fields.Deductions
        label="Deductions"
        formHookResult={federalTaxes}
        validationMessages={{ REQUIRED: 'This field is required' }}
      />
      <Fields.ExtraWithholding
        label="Extra withholding"
        formHookResult={federalTaxes}
        validationMessages={{ REQUIRED: 'This field is required' }}
      />

      <button type="submit" disabled={federalTaxes.status.isPending}>
        Save
      </button>
    </form>
  )
}
```

Both examples produce identical validation, error handling, and API behavior. See [Composing Multiple Hooks](./hooks.md#composing-multiple-hooks) for combining federal taxes with other forms on the same page.
