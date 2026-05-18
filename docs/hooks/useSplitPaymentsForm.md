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

| Prop                      | Type                                                           | Required | Default      | Description                                                                                                                                                                                                                      |
| ------------------------- | -------------------------------------------------------------- | -------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `employeeId`              | `string`                                                       | Yes      | —            | The UUID of the employee whose payment splits are being edited.                                                                                                                                                                  |
| `optionalFieldsToRequire` | `SplitPaymentsFormOptionalFieldsToRequire`                     | No       | —            | Maps optional schema fields to force-required. Currently a no-op — `splitBy` and `priority` are always required, and per-split `splitAmount` required-ness is intrinsic (see [Cross-field validation](#cross-field-validation)). |
| `validationMode`          | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                                                                                                                                         |
| `shouldFocusError`        | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                                                                                                                                  |

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
  }
  status: {
    isPending: boolean
    mode: 'update'
    /** The currently selected split mode. */
    splitBy: 'Percentage' | 'Amount'
    /** Live sum of `splitAmount` values; useful for displaying the current total in Percentage mode. */
    percentageTotal: number
    /**
     * Mirrors the schema-emitted `PERCENTAGE_TOTAL_MISMATCH` error and is the
     * only place this invariant surfaces — there are no per-field
     * `PERCENTAGE_TOTAL_MISMATCH` errors. Tracks `formState.errors` directly
     * and follows the standard react-hook-form validation lifecycle: with
     * the default `validationMode: 'onSubmit'`, becomes `true` after the
     * first failed Save attempt and clears live as the user corrects the
     * total. The hook keeps the synthetic error in sync as splits change
     * post-submit, so a corrected total dismisses the imbalance immediately
     * without waiting for the next submit. The schema only emits the
     * imbalance when every split has a finite percentage value, so
     * missing-value cases are surfaced as per-field `REQUIRED` errors
     * instead. Only `true` in Percentage mode.
     */
    hasPercentageImbalance: boolean
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<EmployeePaymentMethod> | undefined>
    /**
     * Reorder splits in Amount mode by uuid. The last uuid in the array
     * becomes the remainder.
     */
    reorderSplits: (orderedUuids: string[]) => void
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

`data.splits` is derived from `paymentMethod.splits` when present, otherwise from `bankAccounts` (one entry per account, no allocated amount). It carries the raw domain data — use it for label construction or lookups by uuid.

### Submit behavior

`onSubmit` runs schema validation via react-hook-form. When any field error is present — including the synthetic `PERCENTAGE_TOTAL_MISMATCH` invariant — submission is blocked and `onSubmit` returns `undefined`. Surface the imbalance via `status.hasPercentageImbalance`. On success it updates the employee's payment method with the chosen `splitBy` and the current splits, and returns `HookSubmitResult<EmployeePaymentMethod>` with `mode: 'update'`.

---

## Fields Reference

### Error Codes

```typescript
const SplitPaymentsFormErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_PERCENTAGE: 'INVALID_PERCENTAGE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  DUPLICATE_PRIORITIES: 'DUPLICATE_PRIORITIES',
  PERCENTAGE_TOTAL_MISMATCH: 'PERCENTAGE_TOTAL_MISMATCH',
} as const
```

`PERCENTAGE_TOTAL_MISMATCH` is a form-level invariant — it is not attached to any individual split's error slot. Read `status.hasPercentageImbalance` and render your own alert / banner / inline summary. It follows the standard react-hook-form validation lifecycle (driven by `validationMode`), so it appears and clears in lockstep with per-field errors.

### Static fields

| Field     | Input type          | Required by default | Error codes | Conditional availability                                                |
| --------- | ------------------- | ------------------- | ----------- | ----------------------------------------------------------------------- |
| `SplitBy` | Radio (two options) | Yes (has a default) | `REQUIRED`  | Always rendered. Defaults to `paymentMethod.splitBy` or `'Percentage'`. |

### Dynamic per-split Fields

`form.Fields.splits` is an array of `SplitFieldEntry` objects — one per bank account — pairing each split's identity with a render-ready `Field` component:

```typescript
interface SplitFieldEntry {
  uuid: string
  name: string | null
  hiddenAccountNumber: string | null
  Field: ComponentType<SplitFieldProps>
}
```

Each `Field` is pre-bound to its split. It formats values as currency in Amount mode and as a percentage in Percentage mode, switching automatically when `splitBy` changes. Required-ness and disabled state are intrinsic — every split is required, except the remainder in Amount mode, which is automatically disabled and not required. Supply `REQUIRED` in `validationMessages` to translate the "missing value" error. The sum-to-100 invariant is surfaced separately via `status.hasPercentageImbalance` (see [Cross-field validation](#cross-field-validation)) — not as a per-field error.

```typescript
interface SplitFieldProps {
  label: string
  description?: ReactNode
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<SplitFieldValidation>
  min?: number | string
  max?: number | string
  placeholder?: string
  FieldComponent?: ComponentType<NumberInputProps>
}

type SplitFieldValidation = 'REQUIRED' | 'INVALID_AMOUNT' | 'INVALID_PERCENTAGE'
```

Construct the label from `entry.name` and `entry.hiddenAccountNumber`, supply `validationMessages` for all three codes, and use `entry.uuid === data.remainderId` if you want to decorate the remainder split visually (e.g. placeholder text).

### Cross-field validation

- **Per-split required**: each `splitAmount.<uuid>` is required and emits `REQUIRED` if cleared. The remainder split in Amount mode is exempt — it is intentionally null to absorb leftover pay.
- **Percentage mode**: read `status.hasPercentageImbalance` and `status.percentageTotal` to drive an inline alert. The flag is tied to react-hook-form's validation lifecycle — with the default `validationMode: 'onSubmit'`, the alert appears after the first Save attempt and clears as the user corrects the total. Configure `validationMode` if you want a different cadence (e.g. `'onBlur'` or `'onChange'`). `status.percentageTotal` is always a finite running sum — non-numeric values contribute 0 — so it is safe to render unconditionally.
- **Amount mode**: `DUPLICATE_PRIORITIES` fires when two splits share a priority value. Use `actions.reorderSplits` to keep priorities unique.

---

## Usage Examples

### With `SDKFormProvider` (context)

A complete split-paycheck screen showing both modes, reorderable Amount layout, and the percentage-total alert.

```tsx
import {
  useSplitPaymentsForm,
  SDKFormProvider,
  type SplitFieldEntry,
  type SplitByValue,
  type UseSplitPaymentsFormReady,
} from '@gusto/embedded-react-sdk'

function SplitPaycheckPage({ employeeId }: { employeeId: string }) {
  const splitForm = useSplitPaymentsForm({ employeeId })

  if (splitForm.isLoading) {
    return <div>Loading…</div>
  }

  return <SplitPaycheckFormReady splitForm={splitForm} />
}

function SplitPaycheckFormReady({ splitForm }: { splitForm: UseSplitPaymentsFormReady }) {
  const { Fields } = splitForm.form
  const { remainderId } = splitForm.data
  const { splitBy, percentageTotal, hasPercentageImbalance } = splitForm.status

  const labelForSplit = (split: SplitFieldEntry) =>
    `${split.name ?? 'Account'} (${split.hiddenAccountNumber ?? ''})`

  return (
    <SDKFormProvider formHookResult={splitForm}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void splitForm.actions.onSubmit()
        }}
      >
        {hasPercentageImbalance && (
          <div role="alert">Splits must total 100%. Currently {percentageTotal}%.</div>
        )}

        <Fields.SplitBy label="Split by" getOptionLabel={(value: SplitByValue) => value} />

        {splitBy === 'Amount'
          ? Fields.splits.map(split => (
              <split.Field
                key={split.uuid}
                label={labelForSplit(split)}
                min={0}
                validationMessages={{
                  REQUIRED: 'Enter an amount',
                  INVALID_AMOUNT: 'Amount must be at least 0',
                  INVALID_PERCENTAGE: 'Amount must be at least 0',
                }}
                placeholder={remainderId === split.uuid ? 'rest of paycheck' : undefined}
              />
            ))
          : Fields.splits.map(split => (
              <split.Field
                key={split.uuid}
                label={labelForSplit(split)}
                min={0}
                validationMessages={{
                  REQUIRED: 'Enter a percentage',
                  INVALID_AMOUNT: 'Percentage must be a whole number 0–100',
                  INVALID_PERCENTAGE: 'Percentage must be a whole number 0–100',
                }}
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

### Wiring `reorderSplits` to a reorderable list

`actions.reorderSplits(orderedUuids)` accepts an array of split uuids in the new desired order. The last uuid in the array becomes the remainder. If your reorder UI emits indices, translate them to uuids at the call boundary:

```tsx
function handleReorder(indices: number[]) {
  const orderedUuids = indices
    .map(i => splitForm.form.Fields.splits[i]?.uuid)
    .filter((uuid): uuid is string => Boolean(uuid))
  splitForm.actions.reorderSplits(orderedUuids)
}
```

For non-drag UIs (up/down buttons, keyboard reorder), build the array of uuids directly.

### With `formHookResult` prop

The static `SplitBy` field works the same way without `SDKFormProvider`:

```tsx
<Fields.SplitBy label="Split by" formHookResult={splitForm} getOptionLabel={value => value} />
```

Each `splits[i].Field` also accepts `formHookResult`:

```tsx
<split.Field
  label={labelForSplit(split)}
  formHookResult={splitForm}
  validationMessages={{
    REQUIRED: 'Required',
    INVALID_AMOUNT: '…',
    INVALID_PERCENTAGE: '…',
  }}
/>
```

The per-split Fields need access to the form to keep `splitBy` and remainder state in sync. Either pass `formHookResult` to each Field, or wrap the form tree with `SDKFormProvider` once and let every Field resolve through it.
