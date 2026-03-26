---
title: useEmployeeDetailsForm
order: 2
---

# useEmployeeDetailsForm

Creates or updates an employee's profile information — name, email, SSN, date of birth, and self-onboarding preference.

```tsx
import { useEmployeeDetailsForm, SDKFormProvider } from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'
```

---

## Props

`useEmployeeDetailsForm` accepts a single options object:

| Prop                      | Type                                                                                             | Required | Default      | Description                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------ | -------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `companyId`               | `string`                                                                                         | Yes      | —            | The UUID of the company the employee belongs to.                                                                              |
| `employeeId`              | `string`                                                                                         | No       | —            | The UUID of an existing employee. Omit to create a new employee.                                                              |
| `withSelfOnboardingField` | `boolean`                                                                                        | No       | `true`       | Whether to include the self-onboarding toggle field.                                                                          |
| `requiredFields`          | `EmployeeDetailsField[] \| { create?: EmployeeDetailsField[], update?: EmployeeDetailsField[] }` | No       | —            | Additional fields to make required beyond API defaults. A flat array applies to both modes; an object targets specific modes. |
| `defaultValues`           | `Partial<EmployeeDetailsFormData>`                                                               | No       | —            | Pre-fill form values. Server data takes precedence when editing an existing employee.                                         |
| `validationMode`          | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'`                                   | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                                      |
| `shouldFocusError`        | `boolean`                                                                                        | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                               |

### EmployeeDetailsField

The `requiredFields` arrays accept these field names:

```typescript
type EmployeeDetailsField =
  | 'firstName'
  | 'middleInitial'
  | 'lastName'
  | 'email'
  | 'dateOfBirth'
  | 'ssn'
```

### Required Fields

**Required by default on create:** `firstName`, `lastName`
**Required by default on update:** (none)

All `EmployeeDetailsField` values are available to require in either mode. Note that the `ssn` requirement is automatically waived when the employee already has an SSN on file.

```tsx
// Flat array: require email in both modes
useEmployeeDetailsForm({
  companyId,
  requiredFields: ['email'],
})

// Per-mode: different requirements per mode
useEmployeeDetailsForm({
  companyId,
  requiredFields: {
    create: ['email'],
    update: ['ssn', 'dateOfBirth'],
  },
})
```

### EmployeeDetailsFormData

The shape of `defaultValues`:

```typescript
interface EmployeeDetailsFormData {
  firstName: string
  middleInitial: string
  lastName: string
  email: string
  dateOfBirth: string // ISO date string (YYYY-MM-DD)
  ssn: string
  selfOnboarding: boolean
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
    employee: Employee | null
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: {
    onSubmit: (callbacks?: EmployeeDetailsSubmitCallbacks) =>
      Promise<HookSubmitResult<Employee> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: EmployeeDetailsFormFields
    fieldsMetadata: EmployeeDetailsFieldsMetadata
    hookFormInternals: {
      formMethods: UseFormReturn
    }
  }
}
```

### Submit callbacks

`onSubmit` accepts an optional callbacks object:

```typescript
interface EmployeeDetailsSubmitCallbacks {
  onEmployeeCreated?: (employee: Employee) => void
  onEmployeeUpdated?: (employee: Employee) => void
  onOnboardingStatusUpdated?: (status: unknown) => void
}
```

---

## Fields Reference

All fields accept `label` (required) and `description` (optional). Fields with validation accept `validationMessages` mapping error codes to display strings. All fields accept an optional `FieldComponent` prop to override the rendered UI component.

### Error Codes

```typescript
const EmployeeDetailsErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_NAME: 'INVALID_NAME',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_SSN: 'INVALID_SSN',
  EMAIL_REQUIRED_FOR_SELF_ONBOARDING: 'EMAIL_REQUIRED_FOR_SELF_ONBOARDING',
} as const
```

---

### Fields.FirstName

Text input for the employee's first name. Validates against `NAME_REGEX` to reject special characters.

| Prop                 | Type                                         | Required |
| -------------------- | -------------------------------------------- | -------- |
| `label`              | `string`                                     | Yes      |
| `description`        | `ReactNode`                                  | No       |
| `validationMessages` | `{ REQUIRED: string, INVALID_NAME: string }` | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>`              | No       |

**Validation codes:**

| Code           | When it triggers                                                     |
| -------------- | -------------------------------------------------------------------- |
| `REQUIRED`     | Field is empty and required (always required on create)              |
| `INVALID_NAME` | Value contains characters not allowed by the name validation pattern |

**Required by default on create.**

```tsx
<Fields.FirstName
  label="First name"
  validationMessages={{
    REQUIRED: 'First name is required',
    INVALID_NAME: 'Enter a valid first name',
  }}
/>
```

---

### Fields.MiddleInitial

Text input for the employee's middle initial.

| Prop             | Type                            | Required |
| ---------------- | ------------------------------- | -------- |
| `label`          | `string`                        | Yes      |
| `description`    | `ReactNode`                     | No       |
| `FieldComponent` | `ComponentType<TextInputProps>` | No       |

No validation codes — this field is always optional.

```tsx
<Fields.MiddleInitial label="Middle initial" />
```

---

### Fields.LastName

Text input for the employee's last name. Validates against `NAME_REGEX` to reject special characters.

| Prop                 | Type                                         | Required |
| -------------------- | -------------------------------------------- | -------- |
| `label`              | `string`                                     | Yes      |
| `description`        | `ReactNode`                                  | No       |
| `validationMessages` | `{ REQUIRED: string, INVALID_NAME: string }` | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>`              | No       |

**Validation codes:**

| Code           | When it triggers                                                     |
| -------------- | -------------------------------------------------------------------- |
| `REQUIRED`     | Field is empty and required (always required on create)              |
| `INVALID_NAME` | Value contains characters not allowed by the name validation pattern |

**Required by default on create.**

```tsx
<Fields.LastName
  label="Last name"
  validationMessages={{
    REQUIRED: 'Last name is required',
    INVALID_NAME: 'Enter a valid last name',
  }}
/>
```

---

### Fields.Email

Text input for the employee's personal email address.

| Prop                 | Type                                                                                      | Required |
| -------------------- | ----------------------------------------------------------------------------------------- | -------- |
| `label`              | `string`                                                                                  | Yes      |
| `description`        | `ReactNode`                                                                               | No       |
| `validationMessages` | `{ REQUIRED: string, INVALID_EMAIL: string, EMAIL_REQUIRED_FOR_SELF_ONBOARDING: string }` | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>`                                                           | No       |

**Validation codes:**

| Code                                 | When it triggers                                                 |
| ------------------------------------ | ---------------------------------------------------------------- |
| `REQUIRED`                           | Field is empty and marked required via `requiredFields`          |
| `INVALID_EMAIL`                      | Non-empty value that is not a valid email format                 |
| `EMAIL_REQUIRED_FOR_SELF_ONBOARDING` | Self-onboarding is enabled but email is empty (create mode only) |

```tsx
<Fields.Email
  label="Personal email"
  description="Used for self-onboarding invitations and employee communications."
  validationMessages={{
    REQUIRED: 'Email is required',
    INVALID_EMAIL: 'Enter a valid email address',
    EMAIL_REQUIRED_FOR_SELF_ONBOARDING: 'Email is required when self-onboarding is enabled',
  }}
/>
```

---

### Fields.DateOfBirth

Date picker for the employee's date of birth.

| Prop                 | Type                             | Required |
| -------------------- | -------------------------------- | -------- |
| `label`              | `string`                         | Yes      |
| `description`        | `ReactNode`                      | No       |
| `validationMessages` | `{ REQUIRED: string }`           | No       |
| `FieldComponent`     | `ComponentType<DatePickerProps>` | No       |

```tsx
<Fields.DateOfBirth
  label="Date of birth"
  validationMessages={{
    REQUIRED: 'Date of birth is required',
  }}
/>
```

---

### Fields.Ssn

Text input for the employee's Social Security number. Automatically formats input with dashes (XXX-XX-XXXX). When the employee already has an SSN on file, the field shows a masked placeholder.

| Prop                 | Type                            | Required |
| -------------------- | ------------------------------- | -------- |
| `label`              | `string`                        | Yes      |
| `description`        | `ReactNode`                     | No       |
| `validationMessages` | `{ INVALID_SSN: string }`       | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>` | No       |

**Validation codes:**

| Code          | When it triggers                             |
| ------------- | -------------------------------------------- |
| `INVALID_SSN` | Value does not match the expected SSN format |

The `fieldsMetadata.ssn.hasRedactedValue` flag indicates whether the employee already has an SSN on file. When `true`, the field renders with a masked placeholder (e.g., `•••-••-1234`). If the field is included in `requiredFields` but `hasSsn` is already `true` on the employee, the requirement is automatically waived.

```tsx
<Fields.Ssn
  label="Social Security number"
  validationMessages={{
    INVALID_SSN: 'Enter a valid Social Security number',
  }}
/>
```

---

### Fields.SelfOnboarding

Switch toggle for inviting the employee to self-onboard. When enabled, the employee receives an email invitation to enter their own personal, tax, and banking details.

| Prop             | Type                         | Required |
| ---------------- | ---------------------------- | -------- |
| `label`          | `string`                     | Yes      |
| `description`    | `ReactNode`                  | No       |
| `FieldComponent` | `ComponentType<SwitchProps>` | No       |

No validation codes.

**Conditional availability:** This field is `undefined` when:

- `withSelfOnboardingField` is `false`
- The employee's onboarding status does not allow toggling (e.g., self-onboarding is already in progress or has already been completed)

Always check for existence before rendering:

```tsx
{
  Fields.SelfOnboarding && (
    <Fields.SelfOnboarding
      label="Invite employee to self-onboard"
      description="The employee will receive an email invitation to enter their own personal, tax, and banking details."
    />
  )
}
```

---

## Usage Example

A complete example showing all fields, validation messages, and submit handling:

```tsx
import {
  useEmployeeDetailsForm,
  SDKFormProvider,
  type UseEmployeeDetailsFormReady,
} from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'

function EmployeeDetailsPage({
  companyId,
  employeeId,
}: {
  companyId: string
  employeeId?: string
}) {
  const employeeDetails = useEmployeeDetailsForm({
    companyId,
    employeeId,
    requiredFields: {
      update: ['ssn'],
    },
  })

  if (employeeDetails.isLoading) {
    const { errors, retryQueries } = employeeDetails.errorHandling

    if (errors.length > 0) {
      return (
        <div>
          <p>Failed to load employee data.</p>
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

  return <EmployeeDetailsFormReady employeeDetails={employeeDetails} />
}

function EmployeeDetailsFormReady({
  employeeDetails,
}: {
  employeeDetails: UseEmployeeDetailsFormReady
}) {
  const { Fields } = employeeDetails.form

  const handleSubmit = async () => {
    const result = await employeeDetails.actions.onSubmit({
      onEmployeeCreated: employee => {
        console.log('Employee created:', employee.uuid)
      },
      onEmployeeUpdated: employee => {
        console.log('Employee updated:', employee.uuid)
      },
    })

    if (result) {
      console.log(`${result.mode}d employee:`, result.data.uuid)
    }
  }

  return (
    <SDKFormProvider formHookResult={employeeDetails}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <h2>{employeeDetails.status.mode === 'create' ? 'Add Employee' : 'Edit Employee'}</h2>

        {employeeDetails.errorHandling.errors.length > 0 && (
          <div role="alert">
            {employeeDetails.errorHandling.errors.map((error, i) => (
              <p key={i}>{error.message}</p>
            ))}
          </div>
        )}

        <Fields.FirstName
          label="First name"
          validationMessages={{
            REQUIRED: 'First name is required',
            INVALID_NAME: 'Enter a valid first name',
          }}
        />

        <Fields.MiddleInitial label="Middle initial" />

        <Fields.LastName
          label="Last name"
          validationMessages={{
            REQUIRED: 'Last name is required',
            INVALID_NAME: 'Enter a valid last name',
          }}
        />

        <Fields.Email
          label="Personal email"
          description="Used for self-onboarding invitations and employee communications."
          validationMessages={{
            REQUIRED: 'Email is required',
            INVALID_EMAIL: 'Enter a valid email address',
            EMAIL_REQUIRED_FOR_SELF_ONBOARDING: 'Email is required when self-onboarding is enabled',
          }}
        />

        {Fields.SelfOnboarding && (
          <Fields.SelfOnboarding
            label="Invite employee to self-onboard"
            description="The employee will receive an email invitation to enter their own details."
          />
        )}

        <Fields.DateOfBirth
          label="Date of birth"
          validationMessages={{ REQUIRED: 'Date of birth is required' }}
        />

        <Fields.Ssn
          label="Social Security number"
          validationMessages={{ INVALID_SSN: 'Enter a valid Social Security number' }}
        />

        <button type="submit" disabled={employeeDetails.status.isPending}>
          {employeeDetails.status.mode === 'create' ? 'Add employee' : 'Save changes'}
        </button>
      </form>
    </SDKFormProvider>
  )
}
```
