---
title: useSplitPaymentsForm
order: 9
---

# useSplitPaymentsForm

Splits an employee's Direct Deposit paycheck across multiple bank accounts — either by Percentage (each split a whole-number share that sums to 100) or by Fixed amount (each split a dollar amount, with one "remainder" account absorbing leftover pay). Always operates in update mode against the employee's existing payment method.

```tsx
import { useSplitPaymentsForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

---

## Props

`useSplitPaymentsForm` accepts a single options object:

| Prop                      | Type                                                           | Required | Default      | Description                                                                                                       |
| ------------------------- | -------------------------------------------------------------- | -------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `employeeId`              | `string`                                                       | Yes      | —            | The UUID of the employee whose payment splits are being edited.                                                   |
| `optionalFieldsToRequire` | `SplitPaymentsFormOptionalFieldsToRequire`                     | No       | —            | Reserved for future schema expansion. `splitBy`, `splitAmount`, and `priority` are always required by the schema. |
| `validationMode`          | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                          |
| `shouldFocusError`        | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                   |

`defaultValues` is not exposed because the hook always derives defaults from the existing payment method's `splits` — the values you load are the values you edit.

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

The hook fetches the payment method and the employee's bank accounts. While either request is in flight, only `isLoading` and `errorHandling` are available.

### Ready state

```typescript
{
  isLoading: false
  data: {
    paymentMethod: EmployeePaymentMethod
    bankAccounts: EmployeeBankAccount[]
    splits: WorkingSplit[]
    /** UUID of the split that absorbs the remainder in Amount mode (always the last by priority). */
    remainderId: string
    splitBy: 'Percentage' | 'Amount'
    /** Live sum of `splitAmount` values; useful for displaying the current total in Percentage mode. */
    percentageTotal: number
  }
  status: { isPending: boolean; mode: 'update' }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<EmployeePaymentMethod> | undefined>
    /** Reorders splits in Amount mode by updating `priority`; the last item becomes the remainder. */
    reorderSplits: (newOrder: number[]) => void
    /** Programmatic value update for a single split's amount. */
    updateSplitAmount: (uuid: string, value: number | null) => void
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: SplitPaymentsFormFields
    fieldsMetadata: SplitPaymentsFormFieldsMetadata
    hookFormInternals: { formMethods: UseFormReturn }
    getFormSubmissionValues: () => SplitPaymentsFormOutputs | undefined
  }
}
```

### WorkingSplit

```typescript
interface WorkingSplit {
  uuid: string
  name: string | null
  hiddenAccountNumber: string | null
  splitAmount: number | null
  priority: number
}
```

`splits` is derived from `paymentMethod.splits` when present, otherwise from `bankAccounts` (one entry per account, no allocated amount).

### Submit behavior

`onSubmit` PUTs `/v1/employees/:id/payment_method` with `type: 'Direct Deposit'`, the chosen `splitBy`, and a `splits` array constructed from the working splits and current form values. In Amount mode, `splitAmount` values are converted from dollars to cents before sending. Returns `HookSubmitResult<EmployeePaymentMethod>` with `mode: 'update'`, or `undefined` if validation fails or the mutation errors.

---

## Fields Reference

All fields accept `label` (required) and `description` (optional). Fields with validation accept `validationMessages` mapping error codes to display strings.

### Error Codes

```typescript
const SplitPaymentsFormErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_PERCENTAGE: 'INVALID_PERCENTAGE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  PERCENTAGE_TOTAL_MISMATCH: 'PERCENTAGE_TOTAL_MISMATCH',
  DUPLICATE_PRIORITIES: 'DUPLICATE_PRIORITIES',
} as const
```

| Field     | Input type          | Required by default | Error codes | Conditional availability                                                |
| --------- | ------------------- | ------------------- | ----------- | ----------------------------------------------------------------------- |
| `SplitBy` | Radio (two options) | Yes (has a default) | `REQUIRED`  | Always rendered. Defaults to `paymentMethod.splitBy` or `'Percentage'`. |

Per-split `splitAmount.{uuid}` and `priority.{uuid}` form fields are dynamic (one pair per bank account) and not exposed as named Fields — you render `NumberInputField` for each split yourself, reading the current splits from `data.splits`. The hook still owns the schema validation, default values, mode-toggle reset behavior, reordering, and submit logic for those fields.

### Cross-field validation

- **Percentage mode**: `PERCENTAGE_TOTAL_MISMATCH` fires when split amounts do not sum to exactly 100. The error lands at form path `splitAmount`. Use `data.percentageTotal` to interpolate the current total into the displayed message.
- **Amount mode**: `DUPLICATE_PRIORITIES` fires when two splits share a priority value. Reorder via `actions.reorderSplits` to keep priorities unique.

---

## Usage Examples

### With `SDKFormProvider` (context)

A complete split-paycheck screen showing both modes, reorderable Amount layout, and the percentage-total alert.

```tsx
import {
  useSplitPaymentsForm,
  SDKFormProvider,
  SPLIT_BY_VALUES,
  type SplitByValue,
  type UseSplitPaymentsFormReady,
} from '@gusto/embedded-react-sdk'
import { useFormState } from 'react-hook-form'

function SplitPaycheckPage({ employeeId }: { employeeId: string }) {
  const splitForm = useSplitPaymentsForm({ employeeId })

  if (splitForm.isLoading) {
    return <div>Loading...</div>
  }

  return <SplitPaycheckFormReady splitForm={splitForm} />
}

function SplitPaycheckFormReady({ splitForm }: { splitForm: UseSplitPaymentsFormReady }) {
  const { Fields } = splitForm.form
  const { splits, splitBy, remainderId, percentageTotal } = splitForm.data
  const { errors } = useFormState({
    control: splitForm.form.hookFormInternals.formMethods.control,
  })
  const splitAmountError = errors.splitAmount as
    | { message?: string; root?: { message?: string } }
    | undefined
  const totalMismatch =
    (splitAmountError?.root?.message ?? splitAmountError?.message) === 'PERCENTAGE_TOTAL_MISMATCH'

  return (
    <SDKFormProvider formHookResult={splitForm}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void splitForm.actions.onSubmit()
        }}
      >
        {totalMismatch && (
          <div role="alert">Splits must total 100%. Currently {percentageTotal}%.</div>
        )}

        <Fields.SplitBy label="Split by" getOptionLabel={(value: SplitByValue) => value} />

        {splitBy === 'Amount'
          ? splits.map(split => (
              <input
                key={split.uuid}
                type="number"
                aria-label={`${split.name} (${split.hiddenAccountNumber})`}
                disabled={remainderId === split.uuid}
                onChange={e =>
                  splitForm.actions.updateSplitAmount(
                    split.uuid,
                    e.target.value === '' ? null : Number(e.target.value),
                  )
                }
              />
            ))
          : splits.map(split => (
              <input
                key={split.uuid}
                type="number"
                aria-label={`${split.name} (${split.hiddenAccountNumber})`}
                onChange={e =>
                  splitForm.actions.updateSplitAmount(split.uuid, Number(e.target.value))
                }
              />
            ))}

        <button type="submit" disabled={splitForm.status.isPending}>
          Save
        </button>
      </form>
    </SDKFormProvider>
  )
}
```

`actions.reorderSplits(newOrder)` accepts an array of split indices in the new desired order. Wire it to whatever reorderable list component your UI provides; the hook updates `priority` and shifts the remainder to the last item.

### With `formHookResult` prop

The radio field works the same way without `SDKFormProvider`:

```tsx
<Fields.SplitBy label="Split by" formHookResult={splitForm} getOptionLabel={value => value} />
```

The per-split number inputs need to read form context (via `SDKFormProvider`) since their names are dynamic. If you don't use `SDKFormProvider`, wire each split input to react-hook-form directly through `splitForm.form.hookFormInternals.formMethods`.
