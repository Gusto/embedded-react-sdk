---
title: useSignEmployeeForm
order: 5
---

# useSignEmployeeForm

Signs an employee form — captures a typed signature, electronic consent, and (for I-9 forms) preparer/translator certification with address fields. The hook fetches the form metadata and PDF, manages preparer sections dynamically, and submits the signature to the Gusto API.

```tsx
import { useSignEmployeeForm, SDKFormProvider } from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'
```

> This hook is form-type aware. When the form being signed is an I-9, additional fields and actions for preparer/translator certification are automatically available. For non-I-9 forms, only the signature and confirmation fields are exposed.

---

## Props

`useSignEmployeeForm` accepts a single options object:

| Prop         | Type     | Required | Description                                 |
| ------------ | -------- | -------- | ------------------------------------------- |
| `employeeId` | `string` | Yes      | The UUID of the employee who owns the form. |
| `formId`     | `string` | Yes      | The UUID of the employee form to be signed. |

This hook does not support `defaultValues`, `requiredFields`, or `validationMode` — the form shape is fixed and all fields use built-in validation.

---

## I-9 Form Detection and Preparer Lifecycle

The hook uses a single call for both I-9 and non-I-9 employee forms. It fetches the form entity from the API and inspects the `name` field — when the form is an I-9, additional fields, actions, and state are exposed automatically. You don't pass a flag or use a different hook; the same `useSignEmployeeForm({ employeeId, formId })` call adapts its return shape based on the form type.

### What changes for I-9 forms

When the form **is not** an I-9, the hook returns only two fields (`Signature` and `ConfirmSignature`) and a simple `onSubmit` action. The `form.preparers` object, `actions.addPreparer`, `actions.removePreparer`, and `Fields.UsedPreparer` / `Fields.Preparer1`–`Preparer4` are all `undefined`.

When the form **is** an I-9, the hook additionally returns:

- **`Fields.UsedPreparer`** — a radio group asking whether a preparer/translator assisted
- **`Fields.Preparer1` through `Fields.Preparer4`** — field groups for each preparer (name, address, signature, consent), conditionally present based on the current preparer count
- **`actions.addPreparer` / `actions.removePreparer`** — functions to manage the number of preparer sections
- **`form.preparers`** — state object tracking `count`, `canAdd`, and `canRemove`

### Preparer lifecycle

The hook manages the preparer lifecycle automatically. When the employee selects `'yes'` for `UsedPreparer`, the hook adds the first preparer section. When they switch back to `'no'`, the hook removes all preparer sections and unregisters their form fields. Consumers never need to watch form values or manage this state — just render whatever `Fields.PreparerN` groups are defined.

The `addPreparer()` and `removePreparer()` actions are exposed for building "Add preparer" / "Remove preparer" buttons. Each call to `addPreparer()` increments the count (up to 4), which causes the next `Fields.PreparerN` group to become defined. Calling `removePreparer()` decrements the count and cleans up the removed preparer's form fields.

A typical I-9 flow looks like:

1. Employee answers `UsedPreparer` → `'yes'`
2. The hook automatically adds the first preparer section
3. `Fields.Preparer1` becomes defined — your component renders its fields
4. Employee fills in `Preparer1` fields (name, address, signature, consent)
5. If a second preparer assisted, the employee clicks "Add preparer" → you call `addPreparer()`
6. `Fields.Preparer2` becomes defined and its fields appear
7. On submit, the hook builds the API payload with all active preparer data

### Detecting I-9 in your component

Since the hook handles detection internally, you check for the I-9-specific return values at render time rather than inspecting the form entity yourself. When the form is an I-9, `Fields.UsedPreparer` and `form.preparers` are both defined; for non-I-9 forms, both are `undefined`:

```tsx
const { Fields, preparers } = signForm.form

if (Fields.UsedPreparer && preparers) {
  // This is an I-9 — render UsedPreparer radio, preparer groups, and add/remove buttons
}
```

This lets you build a single component that handles both I-9 and non-I-9 forms, or use separate components and route to the right one.

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
    form: Form
    pdfUrl: string | undefined
  }
  status: {
    isPending: boolean
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<Form> | undefined>
    addPreparer?: () => void   // I-9 forms only
    removePreparer?: () => void // I-9 forms only
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: SignEmployeeFormFields
    fieldsMetadata: SignEmployeeFormFieldsMetadata
    hookFormInternals: { formMethods: UseFormReturn }
    getFormSubmissionValues: () => SignEmployeeFormOutputs | undefined
    preparers?: {              // I-9 forms only
      count: number
      canAdd: boolean
      canRemove: boolean
    }
  }
}
```

### Data

| Property | Type                  | Description                                                                          |
| -------- | --------------------- | ------------------------------------------------------------------------------------ |
| `form`   | `Form`                | The employee form entity fetched from the API (includes `uuid`, `name`, `title`).    |
| `pdfUrl` | `string \| undefined` | URL to the form's PDF document for preview. May be `undefined` if not yet available. |

### Actions

| Action           | Availability | Description                                                                                                      |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `onSubmit`       | Always       | Validates the form and submits the signature to the API. Returns `HookSubmitResult<Form>`.                       |
| `addPreparer`    | I-9 only     | Adds an additional preparer/translator section (up to 4). Use for "Add preparer" buttons.                        |
| `removePreparer` | I-9 only     | Removes the last preparer/translator section and unregisters its form fields. Use for "Remove preparer" buttons. |

### Preparers (I-9 only)

When the form is an I-9, `form.preparers` provides state for managing preparer sections:

| Property    | Type      | Description                                    |
| ----------- | --------- | ---------------------------------------------- |
| `count`     | `number`  | Current number of preparer sections (0–4).     |
| `canAdd`    | `boolean` | `true` when fewer than 4 preparers are active. |
| `canRemove` | `boolean` | `true` when at least 1 preparer is active.     |

---

## Fields Reference

Fields are split into two groups: **base fields** that are always present, and **I-9 fields** that only appear when the form being signed is an I-9.

All fields accept `label` (required) and `description` (optional). Fields with validation accept `validationMessages`. All fields accept an optional `FieldComponent` prop to override the rendered UI component.

### Error Codes

```typescript
const SignEmployeeFormErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const
```

---

### Fields.Signature

Text input for the employee's typed signature. Always present.

| Prop                 | Type                            | Required |
| -------------------- | ------------------------------- | -------- |
| `label`              | `string`                        | Yes      |
| `description`        | `ReactNode`                     | No       |
| `validationMessages` | `{ REQUIRED: string }`          | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>` | No       |

**Always required.**

```tsx
<Fields.Signature
  label="Signature"
  description="Type your full, legal name."
  validationMessages={{ REQUIRED: 'Signature is required' }}
/>
```

---

### Fields.ConfirmSignature

Checkbox for electronic signature consent. Always present.

| Prop                 | Type                           | Required |
| -------------------- | ------------------------------ | -------- |
| `label`              | `string`                       | Yes      |
| `description`        | `ReactNode`                    | No       |
| `validationMessages` | `{ REQUIRED: string }`         | No       |
| `FieldComponent`     | `ComponentType<CheckboxProps>` | No       |

**Validation codes:**

| Code       | When it triggers                       |
| ---------- | -------------------------------------- |
| `REQUIRED` | The checkbox must be checked to submit |

**Always required.**

```tsx
<Fields.ConfirmSignature
  label="I agree to sign electronically"
  validationMessages={{ REQUIRED: 'You must agree to sign electronically' }}
/>
```

---

### Fields.UsedPreparer (I-9 only)

Radio group asking whether the employee used a preparer or translator to complete the I-9 form.

| Prop                 | Type                             | Required |
| -------------------- | -------------------------------- | -------- |
| `label`              | `string`                         | Yes      |
| `description`        | `ReactNode`                      | No       |
| `validationMessages` | `{ REQUIRED: string }`           | No       |
| `FieldComponent`     | `ComponentType<RadioGroupProps>` | No       |

**Options:**

| Value   | Default label                       |
| ------- | ----------------------------------- |
| `'no'`  | `No, I completed this myself`       |
| `'yes'` | `Yes, I used a preparer/translator` |

**Conditional availability:** This field is `undefined` when the form is not an I-9.

```tsx
{
  Fields.UsedPreparer && (
    <Fields.UsedPreparer
      label="Did you use a preparer/translator?"
      validationMessages={{ REQUIRED: 'Please select an option' }}
    />
  )
}
```

---

### Preparer Field Groups (I-9 only)

When `UsedPreparer` is set to `'yes'`, preparer sections become available. Each preparer is exposed as a field group (`Fields.Preparer1` through `Fields.Preparer4`) containing the same set of sub-fields.

**Conditional availability:** `Fields.Preparer1` through `Fields.Preparer4` are `undefined` when:

- The form is not an I-9
- The preparer count hasn't reached that index (e.g., `Preparer2` is `undefined` when `preparers.count < 2`)

Each preparer group (`PreparerFieldGroup`) contains:

| Sub-field          | Type     | Required | Description                               |
| ------------------ | -------- | -------- | ----------------------------------------- |
| `FirstName`        | Text     | Yes      | Preparer's first name                     |
| `LastName`         | Text     | Yes      | Preparer's last name                      |
| `Street1`          | Text     | Yes      | Preparer's street address                 |
| `Street2`          | Text     | No       | Preparer's street address line 2          |
| `City`             | Text     | Yes      | Preparer's city                           |
| `State`            | Select   | Yes      | Preparer's state (US state abbreviations) |
| `Zip`              | Text     | Yes      | Preparer's ZIP code                       |
| `Signature`        | Text     | Yes      | Preparer's typed signature                |
| `ConfirmSignature` | Checkbox | Yes      | Preparer's electronic consent             |

All preparer text fields use `PreparerTextFieldProps`, the state select uses `PreparerSelectFieldProps`, and the confirmation checkbox uses `PreparerCheckboxFieldProps`.

**Validation codes for preparer fields:**

| Code       | Fields              | When it triggers                                                  |
| ---------- | ------------------- | ----------------------------------------------------------------- |
| `REQUIRED` | All required fields | Field is empty, or (for `ConfirmSignature`) checkbox is unchecked |

```tsx
{
  Fields.Preparer1 && (
    <div>
      <h3>Preparer/translator certification</h3>

      <Fields.Preparer1.FirstName
        label="First name"
        validationMessages={{ REQUIRED: 'First name is required' }}
      />
      <Fields.Preparer1.LastName
        label="Last name"
        validationMessages={{ REQUIRED: 'Last name is required' }}
      />
      <Fields.Preparer1.Street1
        label="Street 1"
        validationMessages={{ REQUIRED: 'Street address is required' }}
      />
      <Fields.Preparer1.Street2 label="Street 2 (optional)" />
      <Fields.Preparer1.City label="City" validationMessages={{ REQUIRED: 'City is required' }} />
      <Fields.Preparer1.State
        label="State"
        validationMessages={{ REQUIRED: 'State is required' }}
      />
      <Fields.Preparer1.Zip label="Zip" validationMessages={{ REQUIRED: 'Zip is required' }} />
      <Fields.Preparer1.Signature
        label="Signature"
        description="Type your full, legal name."
        validationMessages={{ REQUIRED: 'Signature is required' }}
      />
      <Fields.Preparer1.ConfirmSignature
        label="I confirm all information is correct"
        validationMessages={{ REQUIRED: 'You must agree to sign electronically' }}
      />
    </div>
  )
}
```

---

## Usage Examples

### Basic form signing (non-I-9)

```tsx
import { useSignEmployeeForm, SDKFormProvider } from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'

function SignFormPage({ employeeId, formId }: { employeeId: string; formId: string }) {
  const signForm = useSignEmployeeForm({ employeeId, formId })

  if (signForm.isLoading) {
    const { errors, retryQueries } = signForm.errorHandling

    if (errors.length > 0) {
      return (
        <div>
          <p>Failed to load form.</p>
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

  const { Fields } = signForm.form

  const handleSubmit = async () => {
    const result = await signForm.actions.onSubmit()
    if (result) {
      console.log('Form signed:', result.data.uuid)
    }
  }

  return (
    <SDKFormProvider formHookResult={signForm}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <h2>Sign {signForm.data.form.title}</h2>

        {signForm.data.pdfUrl && (
          <a href={signForm.data.pdfUrl} target="_blank" rel="noopener noreferrer">
            View document
          </a>
        )}

        {signForm.errorHandling.errors.length > 0 && (
          <div role="alert">
            {signForm.errorHandling.errors.map((error, i) => (
              <p key={i}>{error.message}</p>
            ))}
          </div>
        )}

        <Fields.Signature
          label="Signature"
          description="Type your full, legal name."
          validationMessages={{ REQUIRED: 'Signature is required' }}
        />

        <Fields.ConfirmSignature
          label="I am the employee and I agree to sign electronically"
          validationMessages={{ REQUIRED: 'You must agree to sign electronically' }}
        />

        <button type="submit" disabled={signForm.status.isPending}>
          {signForm.status.isPending ? 'Signing...' : 'Sign form'}
        </button>
      </form>
    </SDKFormProvider>
  )
}
```

### I-9 form with preparer/translator sections

When the form is an I-9, additional fields are available for preparer sections. The hook detects the form type and manages the preparer lifecycle automatically — when the employee selects "yes" for `UsedPreparer`, the first preparer section appears; when they switch to "no", all preparer sections are removed. You only need to call `addPreparer()` / `removePreparer()` for manual add/remove buttons.

See [I-9 Form Detection and Preparer Lifecycle](#i-9-form-detection-and-preparer-lifecycle) for details.

```tsx
import {
  useSignEmployeeForm,
  SDKFormProvider,
  type UseSignEmployeeFormReady,
} from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'

function SignI9Page({ employeeId, formId }: { employeeId: string; formId: string }) {
  const signForm = useSignEmployeeForm({ employeeId, formId })

  if (signForm.isLoading) {
    const { errors, retryQueries } = signForm.errorHandling

    if (errors.length > 0) {
      return (
        <div>
          <p>Failed to load I-9 form.</p>
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

  return <SignI9FormReady signForm={signForm} />
}

function SignI9FormReady({ signForm }: { signForm: UseSignEmployeeFormReady }) {
  const { Fields } = signForm.form

  const handleSubmit = async () => {
    const result = await signForm.actions.onSubmit()
    if (result) {
      console.log('I-9 signed:', result.data.uuid)
    }
  }

  return (
    <SDKFormProvider formHookResult={signForm}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <h2>Sign I-9 document</h2>

        {signForm.data.pdfUrl && (
          <a href={signForm.data.pdfUrl} target="_blank" rel="noopener noreferrer">
            View document
          </a>
        )}

        {signForm.errorHandling.errors.length > 0 && (
          <div role="alert">
            {signForm.errorHandling.errors.map((error, i) => (
              <p key={i}>{error.message}</p>
            ))}
          </div>
        )}

        <Fields.Signature
          label="Signature"
          description="Type your full, legal name."
          validationMessages={{ REQUIRED: 'Signature is required' }}
        />

        <Fields.ConfirmSignature
          label="I agree to electronically sign this form"
          validationMessages={{ REQUIRED: 'You must agree to sign electronically' }}
        />

        {Fields.UsedPreparer && <PreparerSection signForm={signForm} />}

        <button type="submit" disabled={signForm.status.isPending}>
          Sign
        </button>
      </form>
    </SDKFormProvider>
  )
}

function PreparerSection({ signForm }: { signForm: UseSignEmployeeFormReady }) {
  const { Fields } = signForm.form
  const preparers = signForm.form.preparers

  if (!Fields.UsedPreparer || !preparers) return null

  const preparerGroups = [
    Fields.Preparer1,
    Fields.Preparer2,
    Fields.Preparer3,
    Fields.Preparer4,
  ].filter(Group => Group !== undefined)

  return (
    <div>
      <Fields.UsedPreparer label="Did you use a preparer/translator?" />

      {preparerGroups.map((Group, index) => {
        const isLast = index === preparerGroups.length - 1

        return (
          <div key={index}>
            <h3>Preparer/translator certification</h3>

            <Group.FirstName
              label="First name"
              validationMessages={{ REQUIRED: 'First name is required' }}
            />
            <Group.LastName
              label="Last name"
              validationMessages={{ REQUIRED: 'Last name is required' }}
            />
            <Group.Street1
              label="Street 1"
              validationMessages={{ REQUIRED: 'Street address is required' }}
            />
            <Group.Street2 label="Street 2 (optional)" />
            <Group.City label="City" validationMessages={{ REQUIRED: 'City is required' }} />
            <Group.State label="State" validationMessages={{ REQUIRED: 'State is required' }} />
            <Group.Zip label="Zip" validationMessages={{ REQUIRED: 'Zip is required' }} />
            <Group.Signature
              label="Signature"
              description="Type your full, legal name."
              validationMessages={{ REQUIRED: 'Signature is required' }}
            />
            <Group.ConfirmSignature
              label="I confirm all information is correct"
              validationMessages={{ REQUIRED: 'You must agree to sign electronically' }}
            />

            {isLast && (
              <div>
                {preparers.canAdd && (
                  <button type="button" onClick={() => signForm.actions.addPreparer?.()}>
                    Add preparer
                  </button>
                )}
                {preparers.canRemove && preparerGroups.length > 1 && (
                  <button type="button" onClick={() => signForm.actions.removePreparer?.()}>
                    Remove preparer
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

### Handling both I-9 and non-I-9 with a single component

Since the hook adapts its return shape based on the form type, you can build one component that handles both cases by checking for the I-9-specific fields:

```tsx
import { useSignEmployeeForm, SDKFormProvider } from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'

function SignAnyFormPage({ employeeId, formId }: { employeeId: string; formId: string }) {
  const signForm = useSignEmployeeForm({ employeeId, formId })

  if (signForm.isLoading) {
    return <div>Loading...</div>
  }

  const { Fields } = signForm.form
  const isI9 = !!Fields.UsedPreparer

  return (
    <SDKFormProvider formHookResult={signForm}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void signForm.actions.onSubmit()
        }}
      >
        <h2>{isI9 ? 'Sign I-9 document' : `Sign ${signForm.data.form.title}`}</h2>

        <Fields.Signature
          label="Signature"
          description="Type your full, legal name."
          validationMessages={{ REQUIRED: 'Signature is required' }}
        />

        <Fields.ConfirmSignature
          label={
            isI9
              ? 'I agree to electronically sign this form and confirm all information is correct'
              : 'I am the employee and I agree to sign electronically'
          }
          validationMessages={{ REQUIRED: 'You must agree to sign electronically' }}
        />

        {/* I-9 preparer section — only rendered when the form is an I-9 */}
        {Fields.UsedPreparer && <PreparerSection signForm={signForm} />}

        <button type="submit" disabled={signForm.status.isPending}>
          Sign
        </button>
      </form>
    </SDKFormProvider>
  )
}
```

The `PreparerSection` component from the I-9 example above renders the preparer fields and add/remove buttons. The hook manages the preparer lifecycle automatically — no extra wiring needed. For non-I-9 forms, `Fields.UsedPreparer` is `undefined` and the preparer UI is never rendered.

### With `formHookResult` prop

The same basic signing form using prop-based field connection instead of `SDKFormProvider`:

```tsx
import { useSignEmployeeForm } from '@gusto/embedded-react-sdk/UNSTABLE_Hooks'

function SignFormPage({ employeeId, formId }: { employeeId: string; formId: string }) {
  const signForm = useSignEmployeeForm({ employeeId, formId })

  if (signForm.isLoading) {
    return <div>Loading...</div>
  }

  const { Fields } = signForm.form

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        void signForm.actions.onSubmit()
      }}
    >
      <h2>Sign {signForm.data.form.title}</h2>

      <Fields.Signature
        label="Signature"
        description="Type your full, legal name."
        formHookResult={signForm}
        validationMessages={{ REQUIRED: 'Signature is required' }}
      />

      <Fields.ConfirmSignature
        label="I agree to sign electronically"
        formHookResult={signForm}
        validationMessages={{ REQUIRED: 'You must agree to sign electronically' }}
      />

      <button type="submit" disabled={signForm.status.isPending}>
        Sign form
      </button>
    </form>
  )
}
```

Both approaches produce identical validation, error handling, and API behavior. See [Connecting Fields to the Form](./hooks.md#connecting-fields-to-the-form) for guidance on choosing between them.

---

## Key Differences from Other Hooks

This hook differs from the CRUD-oriented form hooks (`useEmployeeDetailsForm`, `useCompensationForm`, `useWorkAddressForm`) in several ways:

| Aspect                       | CRUD hooks                                         | `useSignEmployeeForm`                                                |
| ---------------------------- | -------------------------------------------------- | -------------------------------------------------------------------- |
| **Mode**                     | `'create'` or `'update'` based on entity existence | Always submits as a signing operation (no mode distinction)          |
| **`defaultValues`**          | Accepted via props, merged with server data        | Not supported — the form starts with empty signature fields          |
| **`requiredFields`**         | Configurable via props                             | Fixed — all fields except `Street2` are always required              |
| **Conditional field groups** | Individual fields are conditionally `undefined`    | Entire preparer groups are conditionally `undefined`                 |
| **Dynamic sections**         | Field count is fixed at render time                | Preparer count changes at runtime via `addPreparer`/`removePreparer` |
| **`status.mode`**            | `'create' \| 'update'`                             | Not present — the hook always signs                                  |

---

## Exported Types

Key types available from `@gusto/embedded-react-sdk/UNSTABLE_Hooks`:

| Type                                 | Description                                               |
| ------------------------------------ | --------------------------------------------------------- |
| `UseSignEmployeeFormProps`           | Props accepted by the hook                                |
| `UseSignEmployeeFormResult`          | Full return type (loading or ready)                       |
| `UseSignEmployeeFormReady`           | Narrowed ready state (use after `isLoading` check)        |
| `SignEmployeeFormFields`             | Shape of `form.Fields`                                    |
| `SignEmployeeFormFieldsMetadata`     | Shape of `form.fieldsMetadata`                            |
| `PreparerFieldGroup`                 | Shape of a single preparer's field group                  |
| `SignEmployeeFormData`               | Form input data shape                                     |
| `SignEmployeeFormOutputs`            | Validated output data shape                               |
| `SignEmployeeFormErrorCode`          | Union of error code string literals                       |
| `SignEmployeeFormRequiredValidation` | `'REQUIRED'` validation type                              |
| `SignatureFieldProps`                | Props for the `Signature` field                           |
| `ConfirmSignatureFieldProps`         | Props for the `ConfirmSignature` field                    |
| `UsedPreparerFieldProps`             | Props for the `UsedPreparer` field                        |
| `PreparerTextFieldProps`             | Props for preparer text fields (name, address, signature) |
| `PreparerCheckboxFieldProps`         | Props for preparer confirmation checkbox fields           |
