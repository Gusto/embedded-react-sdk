---
title: useBankForm
order: 7
---

# useBankForm

Creates an employee bank account — nickname, routing number, account number, and account type. Creating a bank account also updates the employee's payment method on the Gusto API.

```tsx
import { useBankForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

---

## Props

`useBankForm` accepts a single options object:

| Prop                      | Type                                                           | Required | Default      | Description                                                                                                                                                                     |
| ------------------------- | -------------------------------------------------------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `employeeId`              | `string`                                                       | No       | —            | The UUID of the employee. For composed create flows where the id isn't known until a prior form submits, omit and supply at submit time via `BankFormSubmitOptions.employeeId`. |
| `optionalFieldsToRequire` | `BankFormOptionalFieldsToRequire`                              | No       | —            | Override optional fields to be required. Today every field is required by default, so this is reserved for future schema expansion.                                             |
| `defaultValues`           | `Partial<BankFormData>`                                        | No       | —            | Pre-fill form values. `accountType` defaults to `'Checking'` when not supplied.                                                                                                 |
| `validationMode`          | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                                                                                        |
| `shouldFocusError`        | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                                                                                 |

### BankFormData

The shape of `defaultValues`:

```typescript
interface BankFormData {
  name: string // Account nickname
  routingNumber: string // 9-digit routing number
  accountNumber: string // 1–17 digit account number
  accountType: 'Checking' | 'Savings'
}
```

The constant `ACCOUNT_TYPES` (`['Checking', 'Savings']`) is exported for convenience.

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

`useBankForm` does not fetch any server data, so in practice it transitions to the ready state immediately. The loading branch exists to keep the return shape consistent with other form hooks.

### Ready state

```typescript
{
  isLoading: false
  data: Record<string, never>
  status: {
    isPending: boolean
    mode: 'create'
  }
  actions: {
    onSubmit: (options?: BankFormSubmitOptions) =>
      Promise<HookSubmitResult<EmployeeBankAccount> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: BankFormFields
    fieldsMetadata: BankFormFieldsMetadata
    hookFormInternals: {
      formMethods: UseFormReturn
    }
    getFormSubmissionValues: () => BankFormOutputs | undefined
  }
}
```

### Submit options

```typescript
interface BankFormSubmitOptions {
  /** Override the `employeeId` configured at hook construction. Useful when the employee is created in the same submit chain. */
  employeeId?: string
}
```

```tsx
await bankForm.actions.onSubmit({ employeeId: newEmployeeId })
```

`onSubmit` POSTs `/v1/employees/:id/bank_accounts` and returns `HookSubmitResult<EmployeeBankAccount>` with `mode: 'create'` and `data` set to the newly created bank account. Returns `undefined` if validation fails or the mutation errors (errors are captured in `errorHandling.errors`).

---

## Fields Reference

All fields accept `label` (required) and `description` (optional). Fields with validation accept `validationMessages` mapping error codes to display strings.

### Error Codes

```typescript
const BankFormErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_ROUTING_NUMBER: 'INVALID_ROUTING_NUMBER',
  INVALID_ACCOUNT_NUMBER: 'INVALID_ACCOUNT_NUMBER',
} as const
```

| Field           | Input type          | Required by default | Error codes                          | Conditional availability                              |
| --------------- | ------------------- | ------------------- | ------------------------------------ | ----------------------------------------------------- |
| `Name`          | Text input          | Yes                 | `REQUIRED`                           | Always rendered.                                      |
| `RoutingNumber` | Text input          | Yes                 | `REQUIRED`, `INVALID_ROUTING_NUMBER` | Always rendered. Validates against `/^[0-9]{9}$/`.    |
| `AccountNumber` | Text input          | Yes                 | `REQUIRED`, `INVALID_ACCOUNT_NUMBER` | Always rendered. Validates against `/^[0-9]{1,17}$/`. |
| `AccountType`   | Radio (two options) | Yes (has a default) | `REQUIRED`                           | Always rendered. Defaults to `'Checking'`.            |

`AccountType` always carries a non-empty default, so `REQUIRED` won't fire in practice and `validationMessages` can be omitted on that field. Supply `getOptionLabel` to translate the `Checking` / `Savings` labels in your UI.

---

## Usage Examples

### With `SDKFormProvider` (context)

```tsx
import {
  useBankForm,
  SDKFormProvider,
  type UseBankFormReady,
  type AccountType,
} from '@gusto/embedded-react-sdk'

function AddBankAccountPage({ employeeId }: { employeeId: string }) {
  const bankForm = useBankForm({ employeeId })

  if (bankForm.isLoading) {
    return <div>Loading...</div>
  }

  return <AddBankAccountFormReady bankForm={bankForm} />
}

function AddBankAccountFormReady({ bankForm }: { bankForm: UseBankFormReady }) {
  const { Fields } = bankForm.form

  const handleSubmit = async () => {
    const result = await bankForm.actions.onSubmit()
    if (result) {
      console.log('Created bank account', result.data.uuid)
    }
  }

  return (
    <SDKFormProvider formHookResult={bankForm}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <h2>Add bank account</h2>

        {bankForm.errorHandling.errors.length > 0 && (
          <div role="alert">
            {bankForm.errorHandling.errors.map((error, i) => (
              <p key={i}>{error.message}</p>
            ))}
          </div>
        )}

        <Fields.Name
          label="Account nickname"
          validationMessages={{ REQUIRED: 'Account name is required' }}
        />
        <Fields.RoutingNumber
          label="Routing number"
          description="9 digits"
          validationMessages={{
            REQUIRED: 'Routing number is required',
            INVALID_ROUTING_NUMBER: 'Routing number should be 9 digits',
          }}
        />
        <Fields.AccountNumber
          label="Account number"
          validationMessages={{
            REQUIRED: 'Account number is required',
            INVALID_ACCOUNT_NUMBER: 'Account number must be digits only',
          }}
        />
        <Fields.AccountType
          label="Account type"
          getOptionLabel={(type: AccountType) => (type === 'Checking' ? 'Checking' : 'Savings')}
        />

        <button type="submit" disabled={bankForm.status.isPending}>
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
import { useBankForm, type UseBankFormReady } from '@gusto/embedded-react-sdk'

function AddBankAccountPage({ employeeId }: { employeeId: string }) {
  const bankForm = useBankForm({ employeeId })

  if (bankForm.isLoading) {
    return <div>Loading...</div>
  }

  return <AddBankAccountFormReady bankForm={bankForm} />
}

function AddBankAccountFormReady({ bankForm }: { bankForm: UseBankFormReady }) {
  const { Fields } = bankForm.form

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        void bankForm.actions.onSubmit()
      }}
    >
      <Fields.Name
        label="Account nickname"
        formHookResult={bankForm}
        validationMessages={{ REQUIRED: 'Account name is required' }}
      />
      <Fields.RoutingNumber
        label="Routing number"
        formHookResult={bankForm}
        validationMessages={{
          REQUIRED: 'Routing number is required',
          INVALID_ROUTING_NUMBER: 'Routing number should be 9 digits',
        }}
      />
      <Fields.AccountNumber
        label="Account number"
        formHookResult={bankForm}
        validationMessages={{
          REQUIRED: 'Account number is required',
          INVALID_ACCOUNT_NUMBER: 'Account number must be digits only',
        }}
      />
      <Fields.AccountType label="Account type" formHookResult={bankForm} />

      <button type="submit" disabled={bankForm.status.isPending}>
        Save
      </button>
    </form>
  )
}
```

Both examples produce identical validation, error handling, and API behavior.
