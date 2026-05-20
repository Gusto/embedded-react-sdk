---
title: useDeductionForm
order: 7
---

# useDeductionForm

Creates or updates a deduction (post-tax custom deduction or court-ordered garnishment) for an employee. Both variants share the same field set — description, frequency, deduct-as-percentage toggle, amount, and optional caps — and differ only in whether the deduction is court-ordered and carries a `garnishmentType`. For child-support garnishments use [`useChildSupportGarnishmentForm`](./useChildSupportGarnishmentForm.md), which handles agency-keyed required attributes.

```tsx
import { useDeductionForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

---

## Props

`useDeductionForm` accepts a single options object:

| Prop                      | Type                                                           | Required | Default      | Description                                                                                                                 |
| ------------------------- | -------------------------------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `employeeId`              | `string`                                                       | Yes      | —            | The UUID of the employee.                                                                                                   |
| `garnishmentId`           | `string`                                                       | No       | —            | When present → **update** mode (PUT /v1/garnishments/:id with `version`). When absent → **create** mode (POST).             |
| `courtOrdered`            | `boolean`                                                      | Yes      | —            | When `true`, the schema and Fields include `garnishmentType` (Federal Tax Lien, Student Loan, etc.). When `false`, omitted. |
| `optionalFieldsToRequire` | `DeductionFormOptionalFieldsToRequire`                         | No       | —            | Override caps to be required.                                                                                               |
| `defaultValues`           | `Partial<DeductionFormData>`                                   | No       | —            | Pre-fill form values. Server data takes precedence on update.                                                               |
| `validationMode`          | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | Passed through to react-hook-form.                                                                                          |
| `shouldFocusError`        | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                             |

### DeductionFormData

```typescript
interface DeductionFormData {
  description: string
  recurring: boolean
  deductAsPercentage: boolean
  amount: number
  totalAmount: number // 0 means "no cap" (the hook drops it to null on the wire)
  annualMaximum: number // 0 means "no cap"
  garnishmentType: GarnishmentType // only meaningful when courtOrdered: true
}
```

---

## Return Type

### Loading state

```typescript
{
  isLoading: true
  errorHandling: HookErrorHandling
}
```

### Ready state

```typescript
interface UseDeductionFormReady {
  isLoading: false
  data: { deduction: Garnishment | null }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
    /**
     * Mirrors the watched `recurring` value. `Fields.TotalAmount` and
     * `Fields.AnnualMaximum` are only exposed when this is true.
     */
    isRecurring: boolean
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<Garnishment> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: DeductionFormFields
    fieldsMetadata: DeductionFormFieldsMetadata
    hookFormInternals: HookFormInternals<DeductionFormData>
    getFormSubmissionValues: () => DeductionFormData | undefined
  }
}
```

---

## Fields Reference

| Field                | Input type  | Required by default | Error codes                   | Conditional availability                |
| -------------------- | ----------- | ------------------- | ----------------------------- | --------------------------------------- |
| `Description`        | TextInput   | Yes                 | `REQUIRED`                    | Always                                  |
| `Recurring`          | RadioGroup  | Yes                 | `REQUIRED`                    | Always                                  |
| `DeductAsPercentage` | RadioGroup  | Yes                 | `REQUIRED`                    | Always                                  |
| `Amount`             | NumberInput | Yes                 | `REQUIRED`, `NEGATIVE_AMOUNT` | Always                                  |
| `TotalAmount`        | NumberInput | No                  | `NEGATIVE_AMOUNT`             | Only when `status.isRecurring === true` |
| `AnnualMaximum`      | NumberInput | No                  | `NEGATIVE_AMOUNT`             | Only when `status.isRecurring === true` |
| `GarnishmentType`    | Select      | Yes                 | `REQUIRED`                    | Only when prop `courtOrdered === true`  |

---

## Usage Examples

### SDKFormProvider pattern

```tsx
import { useDeductionForm, SDKFormProvider } from '@gusto/embedded-react-sdk'

function CustomDeductionPage({
  employeeId,
  garnishmentId,
}: {
  employeeId: string
  garnishmentId?: string
}) {
  const form = useDeductionForm({ employeeId, garnishmentId, courtOrdered: false })

  if (form.isLoading) return <p>Loading…</p>

  const { Fields } = form.form

  const handleSubmit = async () => {
    const result = await form.actions.onSubmit()
    if (result) {
      // result.mode is 'create' or 'update'; result.data is the saved Garnishment
    }
  }

  return (
    <SDKFormProvider formHookResult={form}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <Fields.Description label="Description" validationMessages={{ REQUIRED: 'Required' }} />
        <Fields.Recurring
          label="Frequency"
          getOptionLabel={v => (v ? 'Recurring' : 'One-time')}
          validationMessages={{ REQUIRED: 'Required' }}
        />
        <Fields.DeductAsPercentage
          label="Deduct as"
          getOptionLabel={v => (v ? 'Percentage' : 'Fixed amount')}
          validationMessages={{ REQUIRED: 'Required' }}
        />
        <Fields.Amount
          label="Amount"
          validationMessages={{ REQUIRED: 'Required', NEGATIVE_AMOUNT: 'Must be ≥ 0' }}
        />
        {Fields.TotalAmount && (
          <Fields.TotalAmount
            label="Total cap"
            validationMessages={{ NEGATIVE_AMOUNT: 'Must be ≥ 0' }}
          />
        )}
        {Fields.AnnualMaximum && (
          <Fields.AnnualMaximum
            label="Annual cap"
            validationMessages={{ NEGATIVE_AMOUNT: 'Must be ≥ 0' }}
          />
        )}
        <button type="submit">Save</button>
      </form>
    </SDKFormProvider>
  )
}
```

### `formHookResult` prop pattern

When mixing this hook's fields with another hook's on the same page:

```tsx
<Fields.Description
  label="Description"
  formHookResult={form}
  validationMessages={{ REQUIRED: 'Required' }}
/>
```

---

## Related

- [`useChildSupportGarnishmentForm`](./useChildSupportGarnishmentForm.md) — child-support variant with agency-keyed conditional requiredness
