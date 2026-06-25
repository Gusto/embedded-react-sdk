---
title: useContractorDetailsForm
description: Headless hook for creating or updating a contractor profile — individual vs. business type, wage type, names, SSN/EIN, work state, and self-onboarding preference — inside SDKFormProvider.
order: 11
---

# useContractorDetailsForm

Creates or updates a contractor's profile information — individual vs. business type, wage type, names, SSN/EIN, work state, and the self-onboarding preference.

```tsx
import { useContractorDetailsForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

---

## Props

`useContractorDetailsForm` accepts a single options object. The shape is discriminated by mode: in create mode supply `companyId` and omit `contractorId`; in update mode supply `contractorId` (and optionally `companyId`).

| Prop                      | Type                                                           | Required | Default      | Description                                                                                              |
| ------------------------- | -------------------------------------------------------------- | -------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| `companyId`               | `string`                                                       | Create   | —            | The UUID of the company the contractor belongs to. Required in create mode; not used in update mode.     |
| `contractorId`            | `string`                                                       | Update   | —            | The UUID of an existing contractor. Provide it to enter update mode; omit it to create a new contractor. |
| `withSelfOnboardingField` | `boolean`                                                      | No       | `true`       | Whether to expose the self-onboarding toggle as `form.Fields.SelfOnboarding`.                            |
| `optionalFieldsToRequire` | `ContractorDetailsOptionalFieldsToRequire`                     | No       | —            | Override specific fields that are optional in a given mode to be required.                               |
| `defaultValues`           | `Partial<ContractorDetailsFormData>`                           | No       | —            | Pre-fill form values. Server data takes precedence when editing an existing contractor.                  |
| `validationMode`          | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                 |
| `shouldFocusError`        | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.          |

### Configurable Required Fields

The `optionalFieldsToRequire` prop lets you override optional fields to be required in a given mode. Only fields that are optional by default in that mode can be promoted to required:

```tsx
useContractorDetailsForm({
  contractorId,
  optionalFieldsToRequire: {
    update: ['startDate'],
  },
})
```

`startDate` is required by default on create but optional on update, so it can be promoted to required in update mode. The type constrains which fields are available to require per mode.

### ContractorDetailsFormData

The shape of `defaultValues`:

```typescript
interface ContractorDetailsFormData {
  type: 'Individual' | 'Business'
  wageType: 'Hourly' | 'Fixed'
  startDate: string // ISO date string (YYYY-MM-DD)
  hourlyRate: number
  selfOnboarding: boolean
  fileNewHireReport: boolean
  email: string
  firstName: string
  lastName: string
  middleInitial: string
  businessName: string
  workState: string // two-letter state abbreviation
  ssn: string
  ein: string
}
```

The `ContractorType` (`'Individual' | 'Business'`) and `WageType` (`'Hourly' | 'Fixed'`) enums are exported from `@gusto/embedded-react-sdk` if you prefer referencing the constants directly.

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
    contractor: Contractor | null
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: {
    onSubmit: (options?: ContractorDetailsSubmitOptions) =>
      Promise<HookSubmitResult<Contractor> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: ContractorDetailsFields
    fieldsMetadata: ContractorDetailsFieldsMetadata
    hookFormInternals: {
      formMethods: UseFormReturn
    }
    getFormSubmissionValues: () => ContractorDetailsFormOutputs | undefined
  }
}
```

### Mode detection

The hook enters create mode when no `contractorId` is provided. When an existing contractor is loaded, it enters update mode and `data.contractor` holds the loaded entity (`null` in create mode).

### Submit

`onSubmit` runs exactly one mutation — `contractorsCreate` in create mode, `contractorsUpdate` in update mode — and returns the saved contractor. It accepts a single optional options object:

```typescript
interface ContractorDetailsSubmitOptions {
  companyId?: string // Override the company identifier (create mode only)
}
```

```tsx
const result = await contractorDetails.actions.onSubmit()

if (result) {
  // result.mode is 'create' or 'update'
  // result.data is the saved Contractor entity
  console.log(`Contractor ${result.mode}d:`, result.data.uuid)
}
```

In a create flow where the company is created in the same submit, pass `companyId` through the options to resolve it at submit time:

```tsx
await contractorDetails.actions.onSubmit({ companyId: newCompanyId })
```

If validation fails, `onSubmit` returns `undefined` and the form fields display their error messages. If the API mutation fails, the error is captured in `errorHandling.errors`.

---

## Fields Reference

All fields accept `label` (required) and `description` (optional). Fields with validation accept `validationMessages` mapping error codes to display strings. All fields accept an optional `FieldComponent` prop to override the rendered UI component.

Many fields are conditionally available — they are `undefined` on `form.Fields` when they do not apply to the current `type`, `wageType`, or self-onboarding selection. Always null-check before rendering.

### Error Codes

```typescript
const ContractorDetailsErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_NAME: 'INVALID_NAME',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_SSN: 'INVALID_SSN',
  INVALID_EIN: 'INVALID_EIN',
} as const
```

---

### Fields.Type

Radio group for whether the contractor is an `Individual` or a `Business`. The selection drives which downstream fields are available.

| Prop             | Type                                            | Required |
| ---------------- | ----------------------------------------------- | -------- |
| `label`          | `string`                                        | Yes      |
| `description`    | `ReactNode`                                     | No       |
| `getOptionLabel` | `(value: 'Individual' \| 'Business') => string` | No       |
| `FieldComponent` | `ComponentType<RadioGroupProps>`                | No       |

**Options:** `'Individual'`, `'Business'`

**Always available.** Use `getOptionLabel` to localize the option labels.

```tsx
<Fields.Type
  label="Contractor type"
  getOptionLabel={value => t(`contractorType.${value}`, value)}
/>
```

---

### Fields.WageType

Radio group for whether the contractor is paid a `Fixed` amount or an `Hourly` rate.

| Prop             | Type                                     | Required |
| ---------------- | ---------------------------------------- | -------- |
| `label`          | `string`                                 | Yes      |
| `description`    | `ReactNode`                              | No       |
| `getOptionLabel` | `(value: 'Hourly' \| 'Fixed') => string` | No       |
| `FieldComponent` | `ComponentType<RadioGroupProps>`         | No       |

**Options:** `'Hourly'`, `'Fixed'`

**Always available.** When `'Hourly'` is selected, the `HourlyRate` field becomes available.

---

### Fields.StartDate

Date picker for the contractor's start date.

| Prop                 | Type                             | Required |
| -------------------- | -------------------------------- | -------- |
| `label`              | `string`                         | Yes      |
| `description`        | `ReactNode`                      | No       |
| `validationMessages` | `{ REQUIRED: string }`           | No       |
| `FieldComponent`     | `ComponentType<DatePickerProps>` | No       |

**Validation codes:**

| Code       | When it triggers            |
| ---------- | --------------------------- |
| `REQUIRED` | Field is empty and required |

**Always available. Required by default on create.** Can be promoted to required on update via `optionalFieldsToRequire`.

---

### Fields.HourlyRate

Number input for the contractor's hourly rate.

| Prop                 | Type                              | Required |
| -------------------- | --------------------------------- | -------- |
| `label`              | `string`                          | Yes      |
| `description`        | `ReactNode`                       | No       |
| `validationMessages` | `{ REQUIRED: string }`            | No       |
| `FieldComponent`     | `ComponentType<NumberInputProps>` | No       |

**Validation codes:**

| Code       | When it triggers            |
| ---------- | --------------------------- |
| `REQUIRED` | Field is empty and required |

**Conditional availability:** This field is `undefined` unless `wageType` is `'Hourly'`. When available, it is required on create; on update it is optional unless promoted via `optionalFieldsToRequire`.

```tsx
{
  Fields.HourlyRate && (
    <Fields.HourlyRate
      label="Hourly rate"
      validationMessages={{ REQUIRED: 'Hourly rate is required' }}
    />
  )
}
```

---

### Fields.SelfOnboarding

Switch toggle for inviting the contractor to self-onboard. When enabled, the contractor receives an invitation to enter their own details, SSN/EIN are no longer collected by the admin, and `email` becomes required.

| Prop             | Type                         | Required |
| ---------------- | ---------------------------- | -------- |
| `label`          | `string`                     | Yes      |
| `description`    | `ReactNode`                  | No       |
| `FieldComponent` | `ComponentType<SwitchProps>` | No       |

No validation codes.

**Conditional availability:** This field is `undefined` when:

- `withSelfOnboardingField` is `false`
- The contractor's onboarding status does not allow toggling (e.g., self-onboarding is already in progress or completed)

The default toggle state is derived from the contractor's onboarding status. Always check for existence before rendering:

```tsx
{
  Fields.SelfOnboarding && (
    <Fields.SelfOnboarding
      label="Invite contractor to self-onboard"
      description="The contractor will receive an invitation to enter their own details."
    />
  )
}
```

---

### Fields.FileNewHireReport

Switch toggle for filing a new-hire report for the contractor.

| Prop             | Type                         | Required |
| ---------------- | ---------------------------- | -------- |
| `label`          | `string`                     | Yes      |
| `description`    | `ReactNode`                  | No       |
| `FieldComponent` | `ComponentType<SwitchProps>` | No       |

No validation codes.

**Conditional availability:** This field is `undefined` unless `type` is `'Individual'`. When enabled, the `WorkState` field becomes available and required.

---

### Fields.Email

Text input for the contractor's email address.

| Prop                 | Type                                          | Required |
| -------------------- | --------------------------------------------- | -------- |
| `label`              | `string`                                      | Yes      |
| `description`        | `ReactNode`                                   | No       |
| `validationMessages` | `{ REQUIRED: string, INVALID_EMAIL: string }` | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>`               | No       |

**Validation codes:**

| Code            | When it triggers                                                 |
| --------------- | ---------------------------------------------------------------- |
| `REQUIRED`      | Self-onboarding is enabled but email is empty (create or update) |
| `INVALID_EMAIL` | Non-empty value that is not a valid email format                 |

**Conditional availability:** This field is `undefined` unless self-onboarding is enabled. When available, it is required (on both create and update).

```tsx
{
  Fields.Email && (
    <Fields.Email
      label="Email"
      validationMessages={{
        REQUIRED: 'Email is required when inviting the contractor',
        INVALID_EMAIL: 'Enter a valid email address',
      }}
    />
  )
}
```

---

### Fields.FirstName

Text input for an individual contractor's first name. Validates that the value contains only allowed name characters.

| Prop                 | Type                                         | Required |
| -------------------- | -------------------------------------------- | -------- |
| `label`              | `string`                                     | Yes      |
| `description`        | `ReactNode`                                  | No       |
| `validationMessages` | `{ REQUIRED: string, INVALID_NAME: string }` | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>`              | No       |

**Validation codes:**

| Code           | When it triggers                                                     |
| -------------- | -------------------------------------------------------------------- |
| `REQUIRED`     | Field is empty and required                                          |
| `INVALID_NAME` | Value contains characters not allowed by the name validation pattern |

**Conditional availability:** This field is `undefined` unless `type` is `'Individual'`. When available, it is required on create; on update it is optional unless promoted via `optionalFieldsToRequire`.

---

### Fields.LastName

Text input for an individual contractor's last name. Validates that the value contains only allowed name characters.

| Prop                 | Type                                         | Required |
| -------------------- | -------------------------------------------- | -------- |
| `label`              | `string`                                     | Yes      |
| `description`        | `ReactNode`                                  | No       |
| `validationMessages` | `{ REQUIRED: string, INVALID_NAME: string }` | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>`              | No       |

**Validation codes:**

| Code           | When it triggers                                                     |
| -------------- | -------------------------------------------------------------------- |
| `REQUIRED`     | Field is empty and required                                          |
| `INVALID_NAME` | Value contains characters not allowed by the name validation pattern |

**Conditional availability:** This field is `undefined` unless `type` is `'Individual'`. When available, it is required on create; on update it is optional unless promoted via `optionalFieldsToRequire`.

---

### Fields.MiddleInitial

Text input for an individual contractor's middle initial.

| Prop             | Type                            | Required |
| ---------------- | ------------------------------- | -------- |
| `label`          | `string`                        | Yes      |
| `description`    | `ReactNode`                     | No       |
| `FieldComponent` | `ComponentType<TextInputProps>` | No       |

No validation codes — this field is always optional.

**Conditional availability:** This field is `undefined` unless `type` is `'Individual'`.

---

### Fields.BusinessName

Text input for a business contractor's business name.

| Prop                 | Type                            | Required |
| -------------------- | ------------------------------- | -------- |
| `label`              | `string`                        | Yes      |
| `description`        | `ReactNode`                     | No       |
| `validationMessages` | `{ REQUIRED: string }`          | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>` | No       |

**Validation codes:**

| Code       | When it triggers            |
| ---------- | --------------------------- |
| `REQUIRED` | Field is empty and required |

**Conditional availability:** This field is `undefined` unless `type` is `'Business'`. When available, it is required on create; on update it is optional unless promoted via `optionalFieldsToRequire`.

---

### Fields.Ssn

Text input for an individual contractor's Social Security number. Automatically formats input with dashes (XXX-XX-XXXX). When the contractor already has an SSN on file, the field shows a masked placeholder.

| Prop                 | Type                                        | Required |
| -------------------- | ------------------------------------------- | -------- |
| `label`              | `string`                                    | Yes      |
| `description`        | `ReactNode`                                 | No       |
| `validationMessages` | `{ REQUIRED: string, INVALID_SSN: string }` | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>`             | No       |

**Validation codes:**

| Code          | When it triggers                             |
| ------------- | -------------------------------------------- |
| `REQUIRED`    | Field is empty and required                  |
| `INVALID_SSN` | Value does not match the expected SSN format |

**Conditional availability:** This field is `undefined` unless `type` is `'Individual'` and self-onboarding is disabled. When available, it is optional by default (the contractor create/update API does not require an SSN); promote it to required via `optionalFieldsToRequire`. If the contractor already has an SSN on record, any required rule is waived and the field shows a masked placeholder.

```tsx
{
  Fields.Ssn && (
    <Fields.Ssn
      label="Social Security number"
      validationMessages={{
        REQUIRED: 'Social Security number is required',
        INVALID_SSN: 'Enter a valid Social Security number',
      }}
    />
  )
}
```

---

### Fields.Ein

Text input for a business contractor's Employer Identification Number. Automatically formats input as XX-XXXXXXX. When the contractor already has an EIN on file, the field shows a masked placeholder.

| Prop                 | Type                                        | Required |
| -------------------- | ------------------------------------------- | -------- |
| `label`              | `string`                                    | Yes      |
| `description`        | `ReactNode`                                 | No       |
| `validationMessages` | `{ REQUIRED: string, INVALID_EIN: string }` | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>`             | No       |

**Validation codes:**

| Code          | When it triggers                             |
| ------------- | -------------------------------------------- |
| `REQUIRED`    | Field is empty and required                  |
| `INVALID_EIN` | Value does not match the expected EIN format |

**Conditional availability:** This field is `undefined` unless `type` is `'Business'` and self-onboarding is disabled. When available, it is optional by default (the contractor create/update API does not require an EIN); promote it to required via `optionalFieldsToRequire`. If the contractor already has an EIN on record, any required rule is waived and the field shows a masked placeholder.

---

### Fields.WorkState

Select dropdown for the contractor's work state, used when filing a new-hire report.

| Prop                 | Type                         | Required |
| -------------------- | ---------------------------- | -------- |
| `label`              | `string`                     | Yes      |
| `description`        | `ReactNode`                  | No       |
| `validationMessages` | `{ REQUIRED: string }`       | No       |
| `getOptionLabel`     | `(value: string) => string`  | No       |
| `FieldComponent`     | `ComponentType<SelectProps>` | No       |

**Validation codes:**

| Code       | When it triggers            |
| ---------- | --------------------------- |
| `REQUIRED` | Field is empty and required |

**Options:** two-letter state abbreviations.

**Conditional availability:** This field is `undefined` unless `type` is `'Individual'` and `fileNewHireReport` is enabled. When available, it is required on create; on update it is optional unless promoted via `optionalFieldsToRequire`.

```tsx
{
  Fields.WorkState && (
    <Fields.WorkState
      label="Work state"
      validationMessages={{ REQUIRED: 'Work state is required' }}
    />
  )
}
```

---

## Usage Examples

### With `SDKFormProvider` (context)

A complete example showing the field set, conditional rendering, and submit handling using the context-based approach:

```tsx
import {
  useContractorDetailsForm,
  SDKFormProvider,
  type UseContractorDetailsFormReady,
} from '@gusto/embedded-react-sdk'

function ContractorDetailsPage({
  companyId,
  contractorId,
}: {
  companyId: string
  contractorId?: string
}) {
  const contractorDetails = useContractorDetailsForm(
    contractorId ? { contractorId, companyId } : { companyId },
  )

  if (contractorDetails.isLoading) {
    const { errors, retryQueries } = contractorDetails.errorHandling

    if (errors.length > 0) {
      return (
        <div>
          <p>Failed to load contractor data.</p>
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

  return <ContractorDetailsFormReady contractorDetails={contractorDetails} />
}

function ContractorDetailsFormReady({
  contractorDetails,
}: {
  contractorDetails: UseContractorDetailsFormReady
}) {
  const { Fields } = contractorDetails.form

  const handleSubmit = async () => {
    const result = await contractorDetails.actions.onSubmit()

    if (result) {
      console.log(`${result.mode}d contractor:`, result.data.uuid)
    }
  }

  return (
    <SDKFormProvider formHookResult={contractorDetails}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <h2>{contractorDetails.status.mode === 'create' ? 'Add Contractor' : 'Edit Contractor'}</h2>

        {contractorDetails.errorHandling.errors.length > 0 && (
          <div role="alert">
            {contractorDetails.errorHandling.errors.map((error, i) => (
              <p key={i}>{error.message}</p>
            ))}
          </div>
        )}

        <Fields.Type label="Contractor type" />
        <Fields.WageType label="Wage type" />
        <Fields.StartDate
          label="Start date"
          validationMessages={{ REQUIRED: 'Start date is required' }}
        />

        {Fields.HourlyRate && (
          <Fields.HourlyRate
            label="Hourly rate"
            validationMessages={{ REQUIRED: 'Hourly rate is required' }}
          />
        )}

        {Fields.SelfOnboarding && (
          <Fields.SelfOnboarding
            label="Invite contractor to self-onboard"
            description="The contractor will receive an invitation to enter their own details."
          />
        )}

        {Fields.Email && (
          <Fields.Email
            label="Email"
            validationMessages={{
              REQUIRED: 'Email is required when inviting the contractor',
              INVALID_EMAIL: 'Enter a valid email address',
            }}
          />
        )}

        {Fields.FirstName && (
          <Fields.FirstName
            label="First name"
            validationMessages={{
              REQUIRED: 'First name is required',
              INVALID_NAME: 'Enter a valid first name',
            }}
          />
        )}

        {Fields.MiddleInitial && <Fields.MiddleInitial label="Middle initial" />}

        {Fields.LastName && (
          <Fields.LastName
            label="Last name"
            validationMessages={{
              REQUIRED: 'Last name is required',
              INVALID_NAME: 'Enter a valid last name',
            }}
          />
        )}

        {Fields.BusinessName && (
          <Fields.BusinessName
            label="Business name"
            validationMessages={{ REQUIRED: 'Business name is required' }}
          />
        )}

        {Fields.FileNewHireReport && <Fields.FileNewHireReport label="File a new-hire report" />}

        {Fields.WorkState && (
          <Fields.WorkState
            label="Work state"
            validationMessages={{ REQUIRED: 'Work state is required' }}
          />
        )}

        {Fields.Ssn && (
          <Fields.Ssn
            label="Social Security number"
            validationMessages={{
              REQUIRED: 'Social Security number is required',
              INVALID_SSN: 'Enter a valid Social Security number',
            }}
          />
        )}

        {Fields.Ein && (
          <Fields.Ein
            label="EIN"
            validationMessages={{
              REQUIRED: 'EIN is required',
              INVALID_EIN: 'Enter a valid EIN',
            }}
          />
        )}

        <button type="submit" disabled={contractorDetails.status.isPending}>
          {contractorDetails.status.mode === 'create' ? 'Add contractor' : 'Save changes'}
        </button>
      </form>
    </SDKFormProvider>
  )
}
```

### With `formHookResult` prop

The same form using prop-based field connection. No `SDKFormProvider` wrapper needed — each field receives the hook result directly:

```tsx
import {
  useContractorDetailsForm,
  type UseContractorDetailsFormReady,
} from '@gusto/embedded-react-sdk'

function ContractorDetailsPage({ companyId }: { companyId: string }) {
  const contractorDetails = useContractorDetailsForm({ companyId })

  if (contractorDetails.isLoading) {
    return <div>Loading...</div>
  }

  return <ContractorDetailsFormReady contractorDetails={contractorDetails} />
}

function ContractorDetailsFormReady({
  contractorDetails,
}: {
  contractorDetails: UseContractorDetailsFormReady
}) {
  const { Fields } = contractorDetails.form

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        void contractorDetails.actions.onSubmit()
      }}
    >
      <h2>{contractorDetails.status.mode === 'create' ? 'Add Contractor' : 'Edit Contractor'}</h2>

      {contractorDetails.errorHandling.errors.length > 0 && (
        <div role="alert">
          {contractorDetails.errorHandling.errors.map((error, i) => (
            <p key={i}>{error.message}</p>
          ))}
        </div>
      )}

      <Fields.Type label="Contractor type" formHookResult={contractorDetails} />
      <Fields.WageType label="Wage type" formHookResult={contractorDetails} />
      <Fields.StartDate
        label="Start date"
        formHookResult={contractorDetails}
        validationMessages={{ REQUIRED: 'Start date is required' }}
      />

      {Fields.HourlyRate && (
        <Fields.HourlyRate
          label="Hourly rate"
          formHookResult={contractorDetails}
          validationMessages={{ REQUIRED: 'Hourly rate is required' }}
        />
      )}

      {Fields.SelfOnboarding && (
        <Fields.SelfOnboarding
          label="Invite contractor to self-onboard"
          formHookResult={contractorDetails}
          description="The contractor will receive an invitation to enter their own details."
        />
      )}

      {Fields.Email && (
        <Fields.Email
          label="Email"
          formHookResult={contractorDetails}
          validationMessages={{
            REQUIRED: 'Email is required when inviting the contractor',
            INVALID_EMAIL: 'Enter a valid email address',
          }}
        />
      )}

      {Fields.FirstName && (
        <Fields.FirstName
          label="First name"
          formHookResult={contractorDetails}
          validationMessages={{
            REQUIRED: 'First name is required',
            INVALID_NAME: 'Enter a valid first name',
          }}
        />
      )}

      {Fields.MiddleInitial && (
        <Fields.MiddleInitial label="Middle initial" formHookResult={contractorDetails} />
      )}

      {Fields.LastName && (
        <Fields.LastName
          label="Last name"
          formHookResult={contractorDetails}
          validationMessages={{
            REQUIRED: 'Last name is required',
            INVALID_NAME: 'Enter a valid last name',
          }}
        />
      )}

      {Fields.BusinessName && (
        <Fields.BusinessName
          label="Business name"
          formHookResult={contractorDetails}
          validationMessages={{ REQUIRED: 'Business name is required' }}
        />
      )}

      {Fields.FileNewHireReport && (
        <Fields.FileNewHireReport
          label="File a new-hire report"
          formHookResult={contractorDetails}
        />
      )}

      {Fields.WorkState && (
        <Fields.WorkState
          label="Work state"
          formHookResult={contractorDetails}
          validationMessages={{ REQUIRED: 'Work state is required' }}
        />
      )}

      {Fields.Ssn && (
        <Fields.Ssn
          label="Social Security number"
          formHookResult={contractorDetails}
          validationMessages={{
            REQUIRED: 'Social Security number is required',
            INVALID_SSN: 'Enter a valid Social Security number',
          }}
        />
      )}

      {Fields.Ein && (
        <Fields.Ein
          label="EIN"
          formHookResult={contractorDetails}
          validationMessages={{
            REQUIRED: 'EIN is required',
            INVALID_EIN: 'Enter a valid EIN',
          }}
        />
      )}

      <button type="submit" disabled={contractorDetails.status.isPending}>
        {contractorDetails.status.mode === 'create' ? 'Add contractor' : 'Save changes'}
      </button>
    </form>
  )
}
```

Both examples produce identical validation, error handling, and API behavior. The prop-based approach is particularly useful when embedding contractor detail fields within a larger composed form — see [Composing Multiple Hooks](./hooks.md#composing-multiple-hooks).
