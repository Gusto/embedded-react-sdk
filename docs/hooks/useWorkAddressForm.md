---
title: useWorkAddressForm
order: 4
---

# useWorkAddressForm

Creates or updates an employee's work address — selecting a company location and an effective date.

```tsx
import { useWorkAddressForm, SDKFormProvider } from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'
```

---

## Props

`useWorkAddressForm` accepts a single options object:

| Prop                     | Type                                                                                 | Required | Default      | Description                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------ | -------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `companyId`              | `string`                                                                             | Yes      | —            | The UUID of the company. Used to fetch available locations.                                                                   |
| `employeeId`             | `string`                                                                             | Yes      | —            | The UUID of the employee. Used to fetch existing work addresses.                                                              |
| `withEffectiveDateField` | `boolean`                                                                            | No       | `true`       | Whether to include the effective date field. When `false`, pass effective date via `onSubmit` options instead.                |
| `requiredFields`         | `WorkAddressField[] \| { create?: WorkAddressField[], update?: WorkAddressField[] }` | No       | —            | Additional fields to make required beyond API defaults. A flat array applies to both modes; an object targets specific modes. |
| `defaultValues`          | `Partial<WorkAddressFormData>`                                                       | No       | —            | Pre-fill form values. Server data takes precedence when editing an existing work address.                                     |
| `validationMode`         | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'`                       | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                                      |
| `shouldFocusError`       | `boolean`                                                                            | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                               |

### WorkAddressField

The `requiredFields` arrays accept these field names:

```typescript
type WorkAddressField = 'locationUuid' | 'effectiveDate'
```

### Required Fields

**Required by default on create:** `locationUuid`, `effectiveDate` (when `withEffectiveDateField` is `true`)
**Required by default on update:** `locationUuid`

All `WorkAddressField` values are available to require in either mode. Note that `effectiveDate` requirements are ignored when `withEffectiveDateField` is `false`. On update mode, the effective date field is always hidden (the API does not accept effective date changes on existing work addresses).

```tsx
// Flat array: require both fields in both modes
useWorkAddressForm({ companyId, employeeId, requiredFields: ['locationUuid', 'effectiveDate'] })
```

### WorkAddressFormData

The shape of `defaultValues`:

```typescript
interface WorkAddressFormData {
  locationUuid: string // UUID of a company location
  effectiveDate: string // ISO date string (YYYY-MM-DD)
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
    workAddress: EmployeeWorkAddress | null
    workAddresses: EmployeeWorkAddress[]
    companyLocations: Location[]
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: {
    onSubmit: (
      callbacks?: WorkAddressSubmitCallbacks,
      options?: WorkAddressSubmitOptions,
    ) => Promise<HookSubmitResult<EmployeeWorkAddress> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: WorkAddressFormFields
    fieldsMetadata: WorkAddressFieldsMetadata
    hookFormInternals: { formMethods: UseFormReturn }
  }
}
```

### Mode detection

The hook automatically detects create vs. update mode based on whether the employee has an active work address. If an active work address exists, the hook enters update mode. Otherwise, it enters create mode.

### Submit callbacks

`onSubmit` accepts an optional callbacks object:

```typescript
interface WorkAddressSubmitCallbacks {
  onWorkAddressCreated?: (workAddress: EmployeeWorkAddress) => void
  onWorkAddressUpdated?: (workAddress: EmployeeWorkAddress) => void
}
```

### Submit options

When `withEffectiveDateField` is `false`, you can pass the effective date programmatically via the second argument to `onSubmit`:

```typescript
interface WorkAddressSubmitOptions {
  effectiveDate?: string // ISO date string (YYYY-MM-DD)
}
```

```tsx
await workAddress.actions.onSubmit(callbacks, { effectiveDate: '2025-06-01' })
```

If `withEffectiveDateField` is `true`, the effective date from the form field takes precedence over the submit option.

---

## Fields Reference

All fields accept `label` (required) and `description` (optional). Fields with validation accept `validationMessages` mapping error codes to display strings.

### Error Codes

```typescript
const WorkAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const
```

---

### Fields.Location

Select dropdown for choosing the employee's work location from the company's registered locations.

| Prop                 | Type                             | Required |
| -------------------- | -------------------------------- | -------- |
| `label`              | `string`                         | Yes      |
| `description`        | `ReactNode`                      | No       |
| `validationMessages` | `{ REQUIRED: string }`           | No       |
| `getOptionLabel`     | `(location: Location) => string` | No       |
| `FieldComponent`     | `ComponentType<SelectProps>`     | No       |

**Options:** Dynamically populated from the company's locations. By default, each option displays the location's formatted inline address (e.g., `"123 Main St, San Francisco, CA 94105"`). This works without any extra configuration:

```tsx
<Fields.Location
  label="Work address"
  description="The primary location where the employee will be working."
  validationMessages={{ REQUIRED: 'Work address is required' }}
/>
```

If you want to customize how locations are displayed, pass `getOptionLabel`. The callback receives the full `Location` entity, giving you access to all address fields:

```tsx
<Fields.Location
  label="Work address"
  description="The primary location where the employee will be working."
  getOptionLabel={location =>
    `${location.streetOne}, ${location.city}, ${location.state} ${location.zip}`
  }
  validationMessages={{ REQUIRED: 'Work address is required' }}
/>
```

**Always required** (in both create and update modes).

---

### Fields.EffectiveDate

Date picker for when the work address takes effect.

| Prop                 | Type                             | Required |
| -------------------- | -------------------------------- | -------- |
| `label`              | `string`                         | Yes      |
| `description`        | `ReactNode`                      | No       |
| `validationMessages` | `{ REQUIRED: string }`           | No       |
| `FieldComponent`     | `ComponentType<DatePickerProps>` | No       |

**Conditional availability:** This field is `undefined` in update mode or when `withEffectiveDateField` is `false`. The API does not accept effective date changes on existing work addresses, so the field is only shown when creating a new work address with `withEffectiveDateField` enabled.

Always check for existence before rendering:

```tsx
{
  Fields.EffectiveDate && (
    <Fields.EffectiveDate
      label="Effective date"
      description="The date this work address takes effect."
      validationMessages={{ REQUIRED: 'Effective date is required' }}
    />
  )
}
```

---

## Usage Example

A complete example showing both fields, `getOptionLabel` usage, and submit handling:

```tsx
import {
  useWorkAddressForm,
  SDKFormProvider,
  type UseWorkAddressFormReady,
} from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'

function WorkAddressPage({ companyId, employeeId }: { companyId: string; employeeId: string }) {
  const workAddress = useWorkAddressForm({ companyId, employeeId })

  if (workAddress.isLoading) {
    const { errors, retryQueries } = workAddress.errorHandling

    if (errors.length > 0) {
      return (
        <div>
          <p>Failed to load work address data.</p>
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

  return <WorkAddressFormReady workAddress={workAddress} />
}

function WorkAddressFormReady({ workAddress }: { workAddress: UseWorkAddressFormReady }) {
  const { Fields } = workAddress.form

  const handleSubmit = async () => {
    const result = await workAddress.actions.onSubmit({
      onWorkAddressCreated: wa => {
        console.log('Work address created:', wa.uuid)
      },
      onWorkAddressUpdated: wa => {
        console.log('Work address updated:', wa.uuid)
      },
    })

    if (result) {
      console.log(`${result.mode}d work address:`, result.data.uuid)
    }
  }

  return (
    <SDKFormProvider formHookResult={workAddress}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <h2>{workAddress.status.mode === 'create' ? 'Add Work Address' : 'Edit Work Address'}</h2>

        {workAddress.errorHandling.errors.length > 0 && (
          <div role="alert">
            {workAddress.errorHandling.errors.map((error, i) => (
              <p key={i}>{error.message}</p>
            ))}
          </div>
        )}

        <Fields.Location
          label="Work address"
          description="The primary location where the employee will be working."
          getOptionLabel={location =>
            `${location.streetOne}, ${location.city}, ${location.state} ${location.zip}`
          }
          validationMessages={{ REQUIRED: 'Work address is required' }}
        />

        {Fields.EffectiveDate && (
          <Fields.EffectiveDate
            label="Effective date"
            description="The date this work address takes effect."
            validationMessages={{ REQUIRED: 'Effective date is required' }}
          />
        )}

        <button type="submit" disabled={workAddress.status.isPending}>
          {workAddress.status.mode === 'create' ? 'Save work address' : 'Save changes'}
        </button>
      </form>
    </SDKFormProvider>
  )
}
```
