---
title: useEmployeeStateTaxesForm
description: Headless hook for updating an employee's state tax withholding answers with a dynamic, API-driven field set rendered per-state inside SDKFormProvider.
---

# useEmployeeStateTaxesForm

Updates an employee's state tax withholding answers. The state-tax record(s) are created automatically with the employee, so this hook is always in update mode.

```tsx
import { useEmployeeStateTaxesForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

[**Jump to Usage Examples →**](#usage-examples)

> **Note.** Unlike most SDK form hooks, the field set here is **dynamic** — driven by the API response. `form.Fields` is an array of state groups (one per state, each with its own list of questions) rather than a named object, and a few static-shape options (`defaultValues`, `optionalFieldsToRequire`, `getOptionLabel`) don't apply. The shapes, render pattern, and per-question overrides are all demonstrated below.

---

## Props

`useEmployeeStateTaxesForm` accepts a single options object:

| Prop               | Type                                                           | Required | Default      | Description                                                                                                           |
| ------------------ | -------------------------------------------------------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| `employeeId`       | `string`                                                       | Yes      | —            | The UUID of the employee whose state taxes are being updated.                                                         |
| `isAdmin`          | `boolean`                                                      | No       | `false`      | Render and submit admin-only questions (e.g. `file_new_hire_report`). When `false`, those questions are filtered out. |
| `validationMode`   | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | When validation runs. Passed through to react-hook-form.                                                              |
| `shouldFocusError` | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                       |

`defaultValues` and `optionalFieldsToRequire` are intentionally not accepted: the form is always pre-populated from the server response, and the required-question set is driven entirely by the API.

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

The non-primitive types in the Ready state are all re-exported from `@gusto/embedded-react-sdk`:

| Type                               | What it is                                                                                                                                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UseEmployeeStateTaxesFormReady`   | The full Ready-state object (the discriminated `isLoading: false` branch). Use this as the prop type for components that receive a ready form, so you don't have to repeat the `Extract<...>` narrowing. |
| `EmployeeStateTaxesList`           | API record for one state's tax answers, re-exported from `@gusto/embedded-api-v-2026-02-01`. Each entry in `data.employeeStateTaxes` is one of these.                                                    |
| `StateTaxFieldsGroup`              | One state's render-ready bundle: `{ state, questions: StateTaxQuestionFieldEntry[] }`. The full shape is documented under [Fields shape](#fields-shape).                                                 |
| `StateTaxQuestionFieldEntry`       | The discriminated entry for a single question — `type` + metadata + bound `Field` component. See [Fields shape](#fields-shape).                                                                          |
| `EmployeeStateTaxesFieldsMetadata` | Static field metadata keyed by full form path (`states.<STATE>.<camelKey>`), with `isRequired` / `isDisabled` / option lists. Same shape as other SDK form hooks' `fieldsMetadata`.                      |
| `EmployeeStateTaxesFormOutputs`    | The submit-time form data shape: `{ states: Record<string, Record<string, StateTaxValue>> }`. Returned by `getFormSubmissionValues()` and consumed by the internal serializer.                           |
| `HookSubmitResult<T>`              | Standard SDK submit-result envelope: `{ mode: 'update', data: T }`. Same shape as other form hooks.                                                                                                      |
| `HookErrorHandling`                | Standard SDK error-handling object exposed by `composeErrorHandler`.                                                                                                                                     |

```typescript
import type {
  UseEmployeeStateTaxesFormReady,
  StateTaxFieldsGroup,
  StateTaxQuestionFieldEntry,
  EmployeeStateTaxesFieldsMetadata,
  EmployeeStateTaxesFormOutputs,
} from '@gusto/embedded-react-sdk'
```

### Submit result

`onSubmit` resolves to `undefined` when validation blocks the submit, or `{ mode: 'update', data: EmployeeStateTaxesList[] }` carrying the updated record list returned by the server. When the form has no states with submittable answers (e.g. an employee in a no-income-tax state like TX), the hook resolves with `data: <existing list>` without making a network request.

---

## Fields shape

`form.Fields` is an array of state groups in API response order. Each group exposes its visible questions as discriminated entries with a bound `Field` component. All of the types below are exported from `@gusto/embedded-react-sdk`:

```typescript
import type {
  StateTaxFieldsGroup,
  StateTaxQuestionFieldEntry,
  SelectStateTaxFieldProps,
  RadioStateTaxFieldProps,
  TextStateTaxFieldProps,
  NumberStateTaxFieldProps,
  CurrencyStateTaxFieldProps,
  DateStateTaxFieldProps,
} from '@gusto/embedded-react-sdk'
```

```typescript
interface StateTaxFieldsGroup {
  /** Two-letter state code, e.g. `'CA'`, `'NY'`. */
  state: string
  questions: StateTaxQuestionFieldEntry[]
}

interface BaseStateTaxQuestionMetadata {
  /** camelCase form of the API question key, e.g. `'fileNewHireReport'`.
   *  Stable across re-fetches; safe as a React `key` and for branching. */
  questionId: string
  /** API-supplied label; shown by default unless overridden via `<Field label="..." />`. */
  label: string
  /** API-supplied description (HTML, sanitized via DOMPurify before render).
   *  May be `null` for questions without a description. */
  description: string | null
}

type StateTaxQuestionFieldEntry =
  | (BaseStateTaxQuestionMetadata & {
      type: 'select'
      Field: ComponentType<SelectStateTaxFieldProps>
    })
  | (BaseStateTaxQuestionMetadata & {
      type: 'radio'
      Field: ComponentType<RadioStateTaxFieldProps>
    })
  | (BaseStateTaxQuestionMetadata & { type: 'text'; Field: ComponentType<TextStateTaxFieldProps> })
  | (BaseStateTaxQuestionMetadata & {
      type: 'number'
      Field: ComponentType<NumberStateTaxFieldProps>
    })
  | (BaseStateTaxQuestionMetadata & {
      type: 'currency'
      Field: ComponentType<CurrencyStateTaxFieldProps>
    })
  | (BaseStateTaxQuestionMetadata & { type: 'date'; Field: ComponentType<DateStateTaxFieldProps> })
```

Discriminate on `type` to access variant-specific props (each variant's `Field` accepts a different `FieldComponent` shape — see [Field component props](#field-component-props)).

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
  validationMessages?: ValidationMessages<EmployeeStateTaxesErrorCode>
  FieldComponent?: ComponentType<...>
}
```

### Variant-specific props

Two variants extend `BaseStateTaxFieldProps` with an additional optional prop:

| Variant  | Adds                   |
| -------- | ---------------------- |
| `select` | `placeholder?: string` |
| `text`   | `placeholder?: string` |

The other four variants (`radio`, `number`, `currency`, `date`) accept only the base props.

### Choosing a `FieldComponent`

The `<...>` in `ComponentType<...>` above is **variant-specific**: each variant's `FieldComponent` must match the prop contract of the underlying SDK UI primitive that variant renders. To override, discriminate on `question.type` first, then plug in a component whose props satisfy the matching SDK prop type:

| Variant    | Required `FieldComponent` shape   | SDK primitive it replaces |
| ---------- | --------------------------------- | ------------------------- |
| `select`   | `ComponentType<SelectProps>`      | `Components.Select`       |
| `radio`    | `ComponentType<RadioGroupProps>`  | `Components.RadioGroup`   |
| `text`     | `ComponentType<TextInputProps>`   | `Components.TextInput`    |
| `number`   | `ComponentType<NumberInputProps>` | `Components.NumberInput`  |
| `currency` | `ComponentType<NumberInputProps>` | `Components.NumberInput`  |
| `date`     | `ComponentType<DatePickerProps>`  | `Components.DatePicker`   |

All six prop types (`SelectProps`, `RadioGroupProps`, `TextInputProps`, `NumberInputProps`, `DatePickerProps`) are re-exported from `@gusto/embedded-react-sdk`, alongside the variant-specific `*StateTaxFieldProps` types whose `FieldComponent` field encodes the same constraint (e.g. `SelectStateTaxFieldProps['FieldComponent']` is `ComponentType<SelectProps>`).

A minimal type-safe override:

```tsx
import { MyDesignSystemSelect } from '@/components/forms/MyDesignSystemSelect'

if (question.type === 'select') {
  return <question.Field FieldComponent={MyDesignSystemSelect} />
}
```

For a more comprehensive example that combines `type`, `state`, and `questionId` overrides, see [Per-question overrides](#per-question-overrides).

### Error codes

Every variant surfaces a single error code, `REQUIRED`:

```typescript
const EmployeeStateTaxesErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const
```

Each Field renders a **localized default validation message** out of the box (`Employee.StateTaxes.validations.required`). Pass `validationMessages={{ REQUIRED: '...' }}` to override per field.

The hook intentionally surfaces only this one code: `number` and `date` inputs come from type-safe UI primitives (react-aria `NumberField` and `DatePicker`), so any "invalid" entry is normalized to empty in the schema preprocessor and lands on `REQUIRED` rather than producing a separate "invalid number"/"invalid date" path.

---

## Usage Examples

### With `SDKFormProvider` (context)

```tsx
import {
  useEmployeeStateTaxesForm,
  SDKFormProvider,
  type UseEmployeeStateTaxesFormReady,
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
              <question.Field key={question.questionId} />
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
```

Default validation messages come from the SDK's translation files. To override per question, pass `validationMessages` directly:

```tsx
<question.Field validationMessages={{ REQUIRED: 'Please pick an option' }} />
```

### Per-question overrides

Each Field accepts:

- `label` and `description` for overriding the API-supplied defaults (the API description is otherwise rendered verbatim, sanitized via DOMPurify).
- `FieldComponent` for swapping the underlying control with one of your own (e.g. your design-system Select). The prop type is **variant-specific** — `SelectStateTaxFieldProps['FieldComponent']` is `ComponentType<SelectProps>`, `DateStateTaxFieldProps['FieldComponent']` is `ComponentType<DatePickerProps>`, etc. — so you must discriminate on `question.type` first. All of those prop types (`SelectProps`, `DatePickerProps`, `NumberInputProps`, `RadioGroupProps`, `TextInputProps`) are exported from `@gusto/embedded-react-sdk`.

The three things you can branch on are `question.type`, `group.state`, and `question.questionId`. They sit on a sliding scale of "safe" (compile-time exhaustive) to "fragile" (string-matching against API output):

| Branch on             | Stability                                                                                                                                      | Use it for                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `question.type`       | Closed union of 6 strings owned by this hook. Adding a new variant is a SDK breaking change.                                                   | Design-system primitive swaps (e.g. "use my Select for every Select"). Safe and exhaustively typed. |
| `group.state`         | API-driven 2-letter state code. Stable for known states, but a state's question set / variants can change as tax law changes.                  | Geographic copy or branding. Re-test when a new state opens up.                                     |
| `question.questionId` | Camel-cased API key. The set of keys for a given state is API-driven and **does evolve** (Gusto adds/renames questions as state forms change). | Truly one-off overrides for a specific question. Treat as a soft coupling; revisit when API moves.  |

> **Caution.** Branching on `questionId` or `state` is a soft coupling to the API contract. When Gusto introduces a new state question, renames an existing one, or splits one question into two, hardcoded `if (question.questionId === '…')` branches silently fall through to the default render. Audit these branches as part of any state-tax-related upgrade, and prefer `type`-level overrides whenever the same change applies to a whole class of fields.

#### Example — combining `type`, `state`, and `questionId`

```tsx
import type { StateTaxFieldsGroup, StateTaxQuestionFieldEntry } from '@gusto/embedded-react-sdk'

import { MyDesignSystemSelect } from '@/components/forms/MyDesignSystemSelect'
import { MyDesignSystemDatePicker } from '@/components/forms/MyDesignSystemDatePicker'
import { CountyAutocomplete } from '@/components/forms/CountyAutocomplete'

// Explicit allow-list of Indiana questionIds we treat as county selects.
// Audit this set whenever the IN state-tax form changes upstream.
const IN_COUNTY_QUESTION_IDS = new Set([
  'currentEmploymentCounty',
  'currentResidenceCounty',
  'previousEmploymentCounty',
  'previousResidenceCounty',
])

function RenderGroupQuestions({ group }: { group: StateTaxFieldsGroup }) {
  return (
    <>
      {group.questions.map(question => (
        <RenderQuestion key={question.questionId} group={group} question={question} />
      ))}
    </>
  )
}

function RenderQuestion({
  group,
  question,
}: {
  group: StateTaxFieldsGroup
  question: StateTaxQuestionFieldEntry
}) {
  // 1. questionId-level one-off — relabel a single question
  if (question.questionId === 'fileNewHireReport') {
    return (
      <question.Field
        label="Will we file the state new-hire report on your behalf?"
        validationMessages={{ REQUIRED: 'Please choose an option' }}
      />
    )
  }

  // 2. State + questionId one-off — Indiana ships four county Selects that
  //    we want to render with a tailored autocomplete. We match against an
  //    explicit allow-list of known questionIds rather than substring matching
  //    so that newly-added IN questions don't silently get the autocomplete.
  if (
    group.state === 'IN' &&
    question.type === 'select' &&
    IN_COUNTY_QUESTION_IDS.has(question.questionId)
  ) {
    return (
      <question.Field
        description="Type to filter Indiana counties."
        FieldComponent={CountyAutocomplete}
      />
    )
  }

  // 3. State-level description override — soften NJ's verbose API copy.
  if (group.state === 'NJ' && question.questionId === 'filingStatus') {
    return (
      <question.Field description="Pick the filing status that matches your most recent NJ-W4." />
    )
  }

  // 4. Type-level swap — replace every Select / Date with a design-system
  //    primitive. This branch is safe to add and forget; new questions of
  //    these variants automatically pick it up.
  switch (question.type) {
    case 'select':
      return <question.Field FieldComponent={MyDesignSystemSelect} />
    case 'date':
      return <question.Field FieldComponent={MyDesignSystemDatePicker} />
    case 'radio':
    case 'text':
    case 'number':
    case 'currency':
      return <question.Field />
  }
}
```

A few things worth noting in the example:

- The `questionId`/`state` branches sit **above** the `type` switch so a one-off override wins over the broad design-system swap.
- We never strip the `key={question.questionId}` from the JSX; React still relies on it to maintain field identity across re-renders.
- The `'currency'` and `'number'` branches share the same `NumberInputProps` shape, so if you wanted a single design-system Number override you can collapse them: `case 'number': case 'currency': return <question.Field FieldComponent={MyNumberInput} />`.
- Since `question.questionId` is the **camelCase** form of the API key (e.g. `filingStatus`, not `filing_status`), keep your string comparisons in camelCase to stay aligned with the hook's contract.

### `formHookResult` prop (no provider)

```tsx
{
  groups.map(group =>
    group.questions.map(question => (
      <question.Field key={`${group.state}-${question.questionId}`} formHookResult={stateTaxes} />
    )),
  )
}
```
