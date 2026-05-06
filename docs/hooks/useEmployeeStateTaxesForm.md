---
title: useEmployeeStateTaxesForm
order: 7
---

# useEmployeeStateTaxesForm

Updates an employee's state tax withholding answers. The state-tax record(s) are created automatically with the employee, so this hook is always in update mode.

```tsx
import { useEmployeeStateTaxesForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

---

## How this hook differs from other form hooks

Unlike `useFederalTaxesForm`, `useEmployeeDetailsForm`, `useCompensationForm`, etc., this hook's field set is **dynamic** — driven entirely by the API response. The fields, their input types, their labels, descriptions, and option lists vary based on the employee's home state, work state(s), and even their state tax filing rules. As a result, several conventions you see in other SDK form hooks are different here:

| Concern                                   | Static-shape hooks (e.g. `useFederalTaxesForm`)                                                                   | `useEmployeeStateTaxesForm`                                                                                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `form.Fields`                             | A **named object** of components: `Fields.FilingStatus`, `Fields.TwoJobs`. Render with `<Fields.FilingStatus />`. | An **array of state groups**: `Fields[].questions[].Field`. Render by mapping over groups + questions.                                                               |
| Field discovery                           | Compile-time. You know every field name from the type.                                                            | Runtime. Discriminate at render time on `question.type` (`'select' \| 'radio' \| 'text' \| 'number' \| 'currency' \| 'date'`) or branch on the stable `question.id`. |
| `defaultValues`                           | Accepted as a hook option to pre-fill empty fields.                                                               | Not supported. The form is always pre-populated from the server response, and required answers must come from the user.                                              |
| `optionalFieldsToRequire`                 | Promote API-optional fields to required.                                                                          | Not supported. Every visible question is required; the API drives the requirement set.                                                                               |
| Option labels                             | Pass `getOptionLabel` (e.g. on `Fields.FilingStatus`) to localize.                                                | Options come from the API with their own labels. There is no `getOptionLabel`; override the entire `FieldComponent` if you need custom rendering.                    |
| Default `label` / `description`           | You pass them per-field.                                                                                          | API-supplied values are used by default. Pass `label` / `description` per `Field` to override.                                                                       |
| Identifying a field for one-off overrides | Use the type-safe field name.                                                                                     | Branch on `question.id` (camelCase form of the API key, e.g. `'fileNewHireReport'`). It is stable across re-fetches.                                                 |
| Validation messages                       | One static map per field.                                                                                         | Same shape, but pass per-question via `<question.Field validationMessages={...} />`.                                                                                 |

If you are migrating a Federal-Taxes-style flow to State Taxes, the biggest concrete change is iteration: instead of `<Fields.FilingStatus />`, you render

```tsx
{
  groups.map(group => group.questions.map(question => <question.Field key={question.id} />))
}
```

The rest (validation messages, `FieldComponent` overrides, `formHookResult` vs `SDKFormProvider`) follows the same shape as the static-shape hooks.

---

## Props

`useEmployeeStateTaxesForm` accepts a single options object:

| Prop               | Type                                                           | Required | Default      | Description                                                                                                           |
| ------------------ | -------------------------------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| `employeeId`       | `string`                                                       | Yes      | —            | The UUID of the employee whose state taxes are being updated.                                                         |
| `isAdmin`          | `boolean`                                                      | No       | `false`      | Render and submit admin-only questions (e.g. `file_new_hire_report`). When `false`, those questions are filtered out. |
| `validationMode`   | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                              |
| `shouldFocusError` | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                       |

See the comparison table above for why `defaultValues` and `optionalFieldsToRequire` are not accepted.

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
    employeeStateTaxes: EmployeeStateTaxesList[]
  }
  status: { isPending: boolean; mode: 'update' }
  actions: {
    onSubmit: () => Promise<HookSubmitResult<EmployeeStateTaxesList[]> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: StateTaxFieldsGroup[]
    fieldsMetadata: EmployeeStateTaxesFieldsMetadata
    hookFormInternals: { formMethods: UseFormReturn }
    getFormSubmissionValues: () => EmployeeStateTaxesFormOutputs | undefined
  }
}
```

### Submit result

`onSubmit` resolves to `undefined` when validation blocks the submit, or `{ mode: 'update', data: EmployeeStateTaxesList[] }` carrying the updated record list returned by the server. When the form has no states with submittable answers (e.g. an employee in a no-income-tax state like TX), the hook resolves with `data: <existing list>` without making a network request.

---

## Fields shape

`form.Fields` is an array of state groups in API response order. Each group exposes its visible questions as discriminated entries with a bound `Field` component:

```typescript
interface StateTaxFieldsGroup {
  state: string // 'CA', 'NY', etc.
  isWorkState: boolean
  questions: StateTaxQuestionFieldEntry[]
}

type StateTaxQuestionFieldEntry =
  | {
      type: 'select'
      id: string
      label: string
      description: string | null
      isAdminOnly: boolean
      isRequired: boolean
      Field: ComponentType<SelectStateTaxFieldProps>
    }
  | {
      type: 'radio'
      id: string
      label: string
      description: string | null
      isAdminOnly: boolean
      isRequired: boolean
      Field: ComponentType<RadioStateTaxFieldProps>
    }
  | {
      type: 'text'
      id: string
      label: string
      description: string | null
      isAdminOnly: boolean
      isRequired: boolean
      Field: ComponentType<TextStateTaxFieldProps>
    }
  | {
      type: 'number'
      id: string
      label: string
      description: string | null
      isAdminOnly: boolean
      isRequired: boolean
      Field: ComponentType<NumberStateTaxFieldProps>
    }
  | {
      type: 'currency'
      id: string
      label: string
      description: string | null
      isAdminOnly: boolean
      isRequired: boolean
      Field: ComponentType<CurrencyStateTaxFieldProps>
    }
  | {
      type: 'date'
      id: string
      label: string
      description: string | null
      isAdminOnly: boolean
      isRequired: boolean
      Field: ComponentType<DateStateTaxFieldProps>
    }
```

`id` is the camelCase form of the question's API key (e.g. `'fileNewHireReport'`). It's stable across re-fetches and safe to use as a React `key` prop and for conditional logic (`question.id === 'fileNewHireReport'`).

### Variant mapping

The hook resolves a question's UI variant from the API's `inputQuestionFormat.type`:

| API type    | Variant    | Notes                                               |
| ----------- | ---------- | --------------------------------------------------- |
| `Select`    | `select`   | Renders as a dropdown with API-supplied options.    |
| `Number`    | `number`   | Decimal number input.                               |
| `Currency`  | `currency` | Currency-formatted number input.                    |
| `Text`      | `text`     | Single-line text input.                             |
| `Date`      | `date`     | Date picker.                                        |
| _(unknown)_ | `text`     | Defensive fall-through for unrecognized wire types. |

**Per-key promotion rules:**

- `file_new_hire_report` is server-converted from internal `Radio` to wire `Select`. The hook re-promotes it to `radio` so it renders as a radio group, matching the canonical Ruby helper's intent. (The previous `Employee.StateTaxes` component had a snake_case-vs-camelCase comparison bug that prevented this promotion from firing.)

The hook also marks `file_new_hire_report` as `isDisabled: true` in metadata once an answer has been recorded server-side — once filed, the choice is locked.

---

## Field component props

All Field components share these base props. Every field accepts an optional `label` and `description`; when omitted, the API-supplied values are used (and the description is sanitized through DOMPurify before being rendered).

```typescript
interface BaseStateTaxFieldProps {
  label?: string
  description?: ReactNode
  formHookResult?: FormHookResult
  validationMessages?: ValidationMessages<...>
  FieldComponent?: ComponentType<...>
}
```

### Error codes

```typescript
const EmployeeStateTaxesErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const
```

| Variant    | Error codes | Field props    |
| ---------- | ----------- | -------------- |
| `select`   | `REQUIRED`  | `placeholder?` |
| `radio`    | `REQUIRED`  | —              |
| `text`     | `REQUIRED`  | `placeholder?` |
| `number`   | `REQUIRED`  | —              |
| `currency` | `REQUIRED`  | —              |
| `date`     | `REQUIRED`  | —              |

Each Field renders a **localized default validation message** out of the box (`Employee.StateTaxes.validations.required`). Pass `validationMessages={{ REQUIRED: '...' }}` to override per field. The hook intentionally surfaces only one error code: number and date inputs come from type-safe UI primitives (react-aria `NumberField` and `DatePicker`), so any "invalid" entry is normalized to empty in the schema preprocessor and lands on `REQUIRED`.

---

## Usage Examples

### With `SDKFormProvider` (context)

```tsx
import {
  useEmployeeStateTaxesForm,
  SDKFormProvider,
  type UseEmployeeStateTaxesFormReady,
  type StateTaxQuestionFieldEntry,
} from '@gusto/embedded-react-sdk'

function StateTaxesPage({ employeeId, isAdmin }: { employeeId: string; isAdmin: boolean }) {
  const stateTaxes = useEmployeeStateTaxesForm({ employeeId, isAdmin })

  if (stateTaxes.isLoading) return <div>Loading...</div>

  return <StateTaxesFormReady stateTaxes={stateTaxes} />
}

function StateTaxesFormReady({ stateTaxes }: { stateTaxes: UseEmployeeStateTaxesFormReady }) {
  const groups = stateTaxes.form.Fields

  const handleSubmit = async () => {
    const result = await stateTaxes.actions.onSubmit()
    if (result) console.log('Updated state tax records:', result.data)
  }

  return (
    <SDKFormProvider formHookResult={stateTaxes}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        {groups.map(group => (
          <section key={group.state}>
            <h2>{group.state} Tax Requirements</h2>
            {group.questions.map(question => (
              <RenderQuestion key={question.id} question={question} />
            ))}
          </section>
        ))}

        <button type="submit" disabled={stateTaxes.status.isPending}>
          Save
        </button>
      </form>
    </SDKFormProvider>
  )
}

function RenderQuestion({ question }: { question: StateTaxQuestionFieldEntry }) {
  return <question.Field />
}
```

Default validation messages come from the SDK's translation files. To override per question, pass `validationMessages` directly:

```tsx
<question.Field validationMessages={{ REQUIRED: 'Please pick an option' }} />
```

### Per-question overrides

Each Field accepts a `FieldComponent` prop for swapping the rendered control, and a `label`/`description` for overriding the API defaults. To override behavior for one question only, branch on its stable `id`:

```tsx
{
  group.questions.map(question => {
    if (question.id === 'fileNewHireReport') {
      return (
        <question.Field
          key={question.id}
          label="Will Gusto file the new-hire report?"
          validationMessages={{ REQUIRED: 'Please choose an option' }}
        />
      )
    }
    return <RenderQuestion key={question.id} question={question} />
  })
}
```

### `formHookResult` prop (no provider)

```tsx
{
  groups.map(group =>
    group.questions.map(question => (
      <question.Field key={`${group.state}-${question.id}`} formHookResult={stateTaxes} />
    )),
  )
}
```

---

## Caveats

- **The submit payload preserves the API's `validFrom`/`validUpTo` per question.** When no answer was recorded server-side, the hook defaults `validFrom` to `'2010-01-01'` (matching the existing component's behavior) and `validUpTo` to `null`.
- **Empty states are supported.** A state with zero visible questions still renders its heading; submitting an empty form produces no network request and resolves with the existing data.
- **Admin filtering applies symmetrically.** When `isAdmin=false`, admin-only questions are hidden from `Fields` and excluded from both validation and the submitted payload.
