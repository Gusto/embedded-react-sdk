---
title: usePaymentMethodForm
order: 8
---

# usePaymentMethodForm

Updates an employee's payment method between Direct Deposit and Check. Always operates in update mode — every employee has a payment method, defaulting to Check.

```tsx
import { usePaymentMethodForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

---

## Props

`usePaymentMethodForm` accepts a single options object:

| Prop                      | Type                                                           | Required | Default      | Description                                                                                             |
| ------------------------- | -------------------------------------------------------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `employeeId`              | `string`                                                       | Yes      | —            | The UUID of the employee whose payment method is being edited.                                          |
| `optionalFieldsToRequire` | `PaymentMethodFormOptionalFieldsToRequire`                     | No       | —            | Reserved for future schema expansion. `type` is always required and always has a default.               |
| `defaultValues`           | `Partial<PaymentMethodFormData>`                               | No       | —            | Pre-fill form values. Server data (the current payment method) takes precedence when supplied is empty. |
| `validationMode`          | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                |
| `shouldFocusError`        | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.         |

### PaymentMethodFormData

The shape of `defaultValues`:

```typescript
interface PaymentMethodFormData {
  type: 'Direct Deposit' | 'Check'
}
```

The constant `PAYMENT_METHOD_TYPES` (`['Direct Deposit', 'Check']`) is exported for convenience.

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

The hook fetches the existing payment method via `GET /v1/employees/:id/payment_method`. While that request is in flight, only `isLoading` and `errorHandling` are available.

### Ready state

```typescript
{
  isLoading: false
  data: {
    paymentMethod: EmployeePaymentMethod
  }
  status: {
    isPending: boolean
    mode: 'update'
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<EmployeePaymentMethod> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: PaymentMethodFormFields
    fieldsMetadata: PaymentMethodFormFieldsMetadata
    hookFormInternals: {
      formMethods: UseFormReturn
    }
    getFormSubmissionValues: () => PaymentMethodFormOutputs | undefined
  }
}
```

### Submit behavior

- Switching to **Check** sends a minimal PUT body (`{ version, type: 'Check' }`).
- Switching to or staying on **Direct Deposit** preserves the existing `splitBy`, `splits`, and `version` so split allocations are not lost when only the type changes.

`onSubmit` returns `HookSubmitResult<EmployeePaymentMethod>` with `mode: 'update'` and `data` set to the updated payment method, or `undefined` if validation fails or the mutation errors (errors are captured in `errorHandling.errors`).

---

## Fields Reference

All fields accept `label` (required) and `description` (optional). Fields with validation accept `validationMessages` mapping error codes to display strings.

### Error Codes

```typescript
const PaymentMethodFormErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const
```

| Field  | Input type          | Required by default | Error codes | Conditional availability                                       |
| ------ | ------------------- | ------------------- | ----------- | -------------------------------------------------------------- |
| `Type` | Radio (two options) | Yes (has a default) | `REQUIRED`  | Always rendered. Defaults to the existing payment method type. |

`Type` always carries the existing payment method as its default, so `REQUIRED` won't fire in practice and `validationMessages` can be omitted on that field. Supply `getOptionLabel` to translate the `Direct Deposit` / `Check` labels in your UI.

To render per-option descriptions or other UI customization, pass a `FieldComponent` that augments the options with descriptions before delegating to the SDK's radio primitive.

---

## Usage Examples

### With `SDKFormProvider` (context)

```tsx
import {
  usePaymentMethodForm,
  SDKFormProvider,
  PAYMENT_METHODS,
  type UsePaymentMethodFormReady,
  type PaymentMethodType,
} from '@gusto/embedded-react-sdk'

function PaymentMethodPage({ employeeId }: { employeeId: string }) {
  const paymentMethodForm = usePaymentMethodForm({ employeeId })

  if (paymentMethodForm.isLoading) {
    return <div>Loading...</div>
  }

  return <PaymentMethodFormReady paymentMethodForm={paymentMethodForm} />
}

function PaymentMethodFormReady({
  paymentMethodForm,
}: {
  paymentMethodForm: UsePaymentMethodFormReady
}) {
  const { Fields } = paymentMethodForm.form

  const handleSubmit = async () => {
    const result = await paymentMethodForm.actions.onSubmit()
    if (result) {
      console.log('Payment method updated:', result.data.type)
    }
  }

  return (
    <SDKFormProvider formHookResult={paymentMethodForm}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <h2>Payment method</h2>

        {paymentMethodForm.errorHandling.errors.length > 0 && (
          <div role="alert">
            {paymentMethodForm.errorHandling.errors.map((error, i) => (
              <p key={i}>{error.message}</p>
            ))}
          </div>
        )}

        <Fields.Type
          label="Select payment method"
          getOptionLabel={(value: PaymentMethodType) =>
            value === PAYMENT_METHODS.directDeposit ? 'Direct Deposit' : 'Check'
          }
        />

        <button type="submit" disabled={paymentMethodForm.status.isPending}>
          Save
        </button>
      </form>
    </SDKFormProvider>
  )
}
```

### With `formHookResult` prop

The same form using prop-based field connection. No `SDKFormProvider` wrapper needed:

```tsx
import { usePaymentMethodForm, type UsePaymentMethodFormReady } from '@gusto/embedded-react-sdk'

function PaymentMethodPage({ employeeId }: { employeeId: string }) {
  const paymentMethodForm = usePaymentMethodForm({ employeeId })

  if (paymentMethodForm.isLoading) {
    return <div>Loading...</div>
  }

  return <PaymentMethodFormReady paymentMethodForm={paymentMethodForm} />
}

function PaymentMethodFormReady({
  paymentMethodForm,
}: {
  paymentMethodForm: UsePaymentMethodFormReady
}) {
  const { Fields } = paymentMethodForm.form

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        void paymentMethodForm.actions.onSubmit()
      }}
    >
      <Fields.Type label="Select payment method" formHookResult={paymentMethodForm} />

      <button type="submit" disabled={paymentMethodForm.status.isPending}>
        Save
      </button>
    </form>
  )
}
```

Both examples produce identical validation, error handling, and API behavior.
