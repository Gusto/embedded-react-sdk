---
title: useSignCompanyForm
order: 5
---

# useSignCompanyForm

Signs a company form — displays the form PDF and collects a typed signature with confirmation.

```tsx
import { useSignCompanyForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

---

## Props

`useSignCompanyForm` accepts a single options object:

| Prop                      | Type                                                           | Required | Default      | Description                                                                                                                           |
| ------------------------- | -------------------------------------------------------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `formId`                  | `string`                                                       | Yes      | —            | The UUID of the company form to sign.                                                                                                 |
| `optionalFieldsToRequire` | `SignCompanyFormOptionalFieldsToRequire`                       | No       | —            | Override specific fields to be required. Both fields are already required by default, so this is typically unnecessary for this hook. |
| `defaultValues`           | `Partial<SignCompanyFormData>`                                 | No       | —            | Pre-fill form values (e.g., pre-populate the signature field).                                                                        |
| `validationMode`          | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                                              |
| `shouldFocusError`        | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                                       |

### SignCompanyFormData

The shape of `defaultValues`:

```typescript
interface SignCompanyFormData {
  signature: string // The signer's typed name
  confirmSignature: boolean // Acknowledgement checkbox
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
    companyForm: Form // The company form entity (title, description, etc.)
    pdfUrl: string | null // URL to the form's PDF document
  }
  status: {
    isPending: boolean
  }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<Form> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: SignCompanyFormFields
    fieldsMetadata: SignCompanyFormFieldsMetadata
    hookFormInternals: {
      formMethods: UseFormReturn
    }
    getFormSubmissionValues: () => SignCompanyFormOutputs | undefined
  }
}
```

### Data

The `data` object contains the company form entity and its PDF URL. Use `data.companyForm` to display the form's title and description, and `data.pdfUrl` to render the document for the user to review before signing.

### Submit result

`onSubmit` returns a `HookSubmitResult<Form> | undefined`. On success, `result.data` is the signed `Form` — use it for any post-submit side effects. On validation or API failure, `onSubmit` returns `undefined` and the error is exposed via `errorHandling.errors`.

---

## Fields Reference

All fields accept `label` (required) and `description` (optional). Fields with validation accept `validationMessages`. All fields accept an optional `FieldComponent` prop to override the rendered UI component.

### Error Codes

```typescript
const SignCompanyFormErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const
```

---

### Fields.Signature

Text input for the signer's typed name.

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
  description="Type your full legal name"
  validationMessages={{ REQUIRED: 'Signature is required' }}
/>
```

---

### Fields.ConfirmSignature

Checkbox to confirm the signature and agree to the form's terms.

| Prop                 | Type                           | Required |
| -------------------- | ------------------------------ | -------- |
| `label`              | `string`                       | Yes      |
| `description`        | `ReactNode`                    | No       |
| `validationMessages` | `{ REQUIRED: string }`         | No       |
| `FieldComponent`     | `ComponentType<CheckboxProps>` | No       |

**Always required.** The checkbox must be checked for the form to submit.

```tsx
<Fields.ConfirmSignature
  label="I agree to the terms above"
  validationMessages={{ REQUIRED: 'You must confirm to sign this form' }}
/>
```

---

## Usage Examples

### With `SDKFormProvider` (context)

A complete example showing form PDF display, both fields, validation messages, and submit handling:

```tsx
import {
  useSignCompanyForm,
  SDKFormProvider,
  type UseSignCompanyFormReady,
} from '@gusto/embedded-react-sdk'

function SignFormPage({ formId }: { formId: string }) {
  const signForm = useSignCompanyForm({ formId })

  if (signForm.isLoading) {
    const { errors, retryQueries } = signForm.errorHandling

    if (errors.length > 0) {
      return (
        <div>
          <p>Failed to load form data.</p>
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

  return <SignFormReady signForm={signForm} />
}

function SignFormReady({ signForm }: { signForm: UseSignCompanyFormReady }) {
  const { Fields } = signForm.form

  const handleSubmit = async () => {
    const result = await signForm.actions.onSubmit()

    if (result) {
      console.log('Signed form:', result.data.uuid)
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
        <h2>{signForm.data.companyForm.title}</h2>

        {signForm.data.companyForm.description && <p>{signForm.data.companyForm.description}</p>}

        {signForm.data.pdfUrl && (
          <iframe src={signForm.data.pdfUrl} title="Form document" width="100%" height="600" />
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
          description="Type your full legal name"
          validationMessages={{ REQUIRED: 'Signature is required' }}
        />

        <Fields.ConfirmSignature
          label="I agree to the terms above"
          validationMessages={{ REQUIRED: 'You must confirm to sign this form' }}
        />

        <button type="submit" disabled={signForm.status.isPending}>
          {signForm.status.isPending ? 'Signing...' : 'Sign form'}
        </button>
      </form>
    </SDKFormProvider>
  )
}
```

### With `formHookResult` prop

The same form using prop-based field connection. No `SDKFormProvider` wrapper needed:

```tsx
import { useSignCompanyForm, type UseSignCompanyFormReady } from '@gusto/embedded-react-sdk'

function SignFormPage({ formId }: { formId: string }) {
  const signForm = useSignCompanyForm({ formId })

  if (signForm.isLoading) {
    return <div>Loading...</div>
  }

  return <SignFormReady signForm={signForm} />
}

function SignFormReady({ signForm }: { signForm: UseSignCompanyFormReady }) {
  const { Fields } = signForm.form

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        void signForm.actions.onSubmit()
      }}
    >
      <h2>{signForm.data.companyForm.title}</h2>

      {signForm.data.pdfUrl && (
        <iframe src={signForm.data.pdfUrl} title="Form document" width="100%" height="600" />
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
        formHookResult={signForm}
        description="Type your full legal name"
        validationMessages={{ REQUIRED: 'Signature is required' }}
      />

      <Fields.ConfirmSignature
        label="I agree to the terms above"
        formHookResult={signForm}
        validationMessages={{ REQUIRED: 'You must confirm to sign this form' }}
      />

      <button type="submit" disabled={signForm.status.isPending}>
        Sign form
      </button>
    </form>
  )
}
```

Both examples produce identical validation, error handling, and API behavior. The prop-based approach is particularly useful when embedding sign form fields within a larger composed form — see [Composing Multiple Hooks](./hooks.md#composing-multiple-hooks).
