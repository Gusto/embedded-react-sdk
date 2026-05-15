---
title: useChildSupportGarnishmentForm
order: 8
---

# useChildSupportGarnishmentForm

Creates or updates a child-support garnishment. Unlike standard garnishments, child support requires agency-specific attributes (case number, order number, remittance number) that vary by state, plus an optional county selection when the state has multiple counties. The hook loads the agency catalog from the Gusto API, derives which attributes the selected state requires, and exposes the right Fields conditionally.

```tsx
import { useChildSupportGarnishmentForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

---

## Props

`useChildSupportGarnishmentForm` accepts a single options object:

| Prop               | Type                                                           | Required | Default      | Description                                                                                     |
| ------------------ | -------------------------------------------------------------- | -------- | ------------ | ----------------------------------------------------------------------------------------------- |
| `employeeId`       | `string`                                                       | Yes      | —            | The UUID of the employee.                                                                       |
| `garnishmentId`    | `string`                                                       | No       | —            | When present → **update** mode. When absent → **create** mode.                                  |
| `defaultValues`    | `Partial<ChildSupportGarnishmentFormData>`                     | No       | —            | Pre-fill form values. Server data takes precedence on update.                                   |
| `validationMode`   | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | Passed through to react-hook-form.                                                              |
| `shouldFocusError` | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`. |

### ChildSupportGarnishmentFormData

```typescript
interface ChildSupportGarnishmentFormData {
  state: string // state code, e.g. 'AK'
  fipsCode: string // county FIPS code; auto-filled when the state has a single all-counties code
  caseNumber: string
  orderNumber: string
  remittanceNumber: string
  payPeriodMaximum: number // currency
  amount: number // percentage 0–100
  paymentPeriod: 'Every week' | 'Every other week' | 'Twice per month' | 'Monthly'
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
interface UseChildSupportGarnishmentFormReady {
  isLoading: false
  data: {
    /** Agency entries for the `State` select; raw records for getOptionLabel translation. */
    agencies: Array<{ state: string; name: string; manualPaymentRequired?: boolean }>
    /** Counties for the currently selected state. Empty when no state is selected. */
    counties: Array<{ fipsCode: string; county: string | null }>
    /** The garnishment loaded for update; `null` in create mode. */
    deduction: Garnishment | null
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
    /** The full agency record matching the currently selected `state`. */
    selectedAgency: Agencies | null
    /** Convenient for surfacing a warning alert above the form. */
    isManualPaymentRequired: boolean
    /** Which `required_attributes` keys the selected agency declares. */
    requiredAttrKeys: ReadonlySet<'case_number' | 'order_number' | 'remittance_number'>
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<Garnishment> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: ChildSupportGarnishmentFormFields
    fieldsMetadata: ChildSupportGarnishmentFormFieldsMetadata
    hookFormInternals: HookFormInternals<ChildSupportGarnishmentFormData>
    getFormSubmissionValues: () => ChildSupportGarnishmentFormData | undefined
  }
}
```

---

## Fields Reference

| Field              | Input type  | Required by default | Error codes                        | Conditional availability                                                                           |
| ------------------ | ----------- | ------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| `State`            | Select      | Yes                 | `REQUIRED`                         | Always                                                                                             |
| `FipsCode`         | Select      | Yes                 | `REQUIRED`                         | Only when the selected agency has multiple counties (single all-counties codes auto-fill silently) |
| `CaseNumber`       | TextInput   | Yes (when present)  | `REQUIRED`                         | Only when `status.requiredAttrKeys.has('case_number')`                                             |
| `OrderNumber`      | TextInput   | Yes (when present)  | `REQUIRED`                         | Only when `status.requiredAttrKeys.has('order_number')`                                            |
| `RemittanceNumber` | TextInput   | Yes (when present)  | `REQUIRED`                         | Only when `status.requiredAttrKeys.has('remittance_number')`                                       |
| `PayPeriodMaximum` | NumberInput | Yes                 | `REQUIRED`, `NEGATIVE_AMOUNT`      | Always                                                                                             |
| `Amount`           | NumberInput | Yes                 | `REQUIRED`, `PERCENT_OUT_OF_RANGE` | Always (percentage 0–100)                                                                          |
| `PaymentPeriod`    | Select      | Yes                 | `REQUIRED`                         | Always                                                                                             |

> Schema-level validation for the three agency-attribute fields (`CaseNumber`, `OrderNumber`, `RemittanceNumber`) is intentionally permissive — the Gusto API enforces presence. The hook surfaces `status.requiredAttrKeys` so consumers know which to mark required in the UI; the Fields' presence on `form.Fields` follows the same rule.

---

## Usage Example

```tsx
import { useChildSupportGarnishmentForm, SDKFormProvider } from '@gusto/embedded-react-sdk'

function ChildSupportPage({
  employeeId,
  garnishmentId,
}: {
  employeeId: string
  garnishmentId?: string
}) {
  const form = useChildSupportGarnishmentForm({ employeeId, garnishmentId })

  if (form.isLoading) return <p>Loading…</p>

  const { Fields } = form.form
  const { selectedAgency, isManualPaymentRequired } = form.status

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
        <Fields.State
          label="Agency"
          getOptionLabel={entry => entry.name}
          validationMessages={{ REQUIRED: 'Required' }}
        />
        {isManualPaymentRequired && <p>Manual payment required for this state.</p>}
        {selectedAgency && (
          <>
            {Fields.FipsCode && (
              <Fields.FipsCode
                label="County"
                getOptionLabel={entry => entry.county ?? 'All counties'}
                validationMessages={{ REQUIRED: 'Required' }}
              />
            )}
            {Fields.CaseNumber && (
              <Fields.CaseNumber
                label="Case number"
                validationMessages={{ REQUIRED: 'Required' }}
              />
            )}
            {Fields.OrderNumber && (
              <Fields.OrderNumber
                label="Order number"
                validationMessages={{ REQUIRED: 'Required' }}
              />
            )}
            {Fields.RemittanceNumber && (
              <Fields.RemittanceNumber
                label="Remittance number"
                validationMessages={{ REQUIRED: 'Required' }}
              />
            )}
            <Fields.PayPeriodMaximum
              label="Maximum per pay period"
              validationMessages={{
                REQUIRED: 'Required',
                NEGATIVE_AMOUNT: 'Must be ≥ 0',
              }}
            />
            <Fields.Amount
              label="Percentage of paycheck"
              validationMessages={{
                REQUIRED: 'Required',
                PERCENT_OUT_OF_RANGE: 'Must be between 0 and 100',
              }}
            />
            <Fields.PaymentPeriod
              label="Payment period"
              getOptionLabel={value => value}
              validationMessages={{ REQUIRED: 'Required' }}
            />
            <button type="submit">Save</button>
          </>
        )}
      </form>
    </SDKFormProvider>
  )
}
```

---

## Related

- [`useDeductionForm`](./useDeductionForm.md) — non-child-support deductions (court-ordered garnishments and post-tax custom)
