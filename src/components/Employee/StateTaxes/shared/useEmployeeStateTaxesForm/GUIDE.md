<!-- Partner-facing guide content, published to the SDK docs site. -->

# useEmployeeStateTaxesForm

## Field variants and promotion <!-- slot: overview -->

The hook resolves each question's UI variant from the API's `inputQuestionFormat.type`:

| API type    | Variant    | Notes                                               |
| ----------- | ---------- | --------------------------------------------------- |
| `Select`    | `select`   | Renders as a dropdown with API-supplied options.    |
| `Number`    | `number`   | Decimal number input.                               |
| `Currency`  | `currency` | Currency-formatted number input.                    |
| `Text`      | `text`     | Single-line text input.                             |
| `Date`      | `date`     | Date picker.                                        |
| _(unknown)_ | `text`     | Defensive fall-through for unrecognized wire types. |

Two per-key rules override the variant mapping:

- `file_new_hire_report` arrives over the wire as `Select` but is re-promoted to `radio` so it renders as a radio group.
- Once an answer to `file_new_hire_report` has been recorded server-side it is marked `isDisabled: true` in metadata — after filing, the choice is locked.

## Exported types <!-- slot: appendix -->

The non-primitive types in the ready state are all re-exported from `@gusto/embedded-react-sdk`:

| Type                               | What it is |
| ---------------------------------- | ---------- |
| `UseEmployeeStateTaxesFormReady`   | The full ready-state object (the `isLoading: false` branch). Use it as the prop type for components that receive a ready form, so you don't repeat the `Extract<…>` narrowing. |
| `EmployeeStateTaxesList`           | API record for one state's tax answers. Each entry in `data.employeeStateTaxes` is one of these. |
| `StateTaxFieldsGroup`              | One state's render-ready bundle: `{ state, questions }`. |
| `StateTaxQuestionFieldEntry`       | The discriminated entry for a single question — `type` plus metadata plus a bound `Field` component. |
| `EmployeeStateTaxesFieldsMetadata` | Static field metadata keyed by full form path (`states.<STATE>.<camelKey>`), with `isRequired` / `isDisabled` and option lists. |
| `EmployeeStateTaxesFormOutputs`    | The submit-time form data shape: `{ states: Record<string, Record<string, StateTaxValue>> }`. Returned by `getFormSubmissionValues()`. |
| `HookSubmitResult<T>`              | Standard SDK submit-result envelope: `{ mode: 'update', data: T }`. |
| `HookErrorHandling`                | Standard SDK error-handling object exposed by `composeErrorHandler`.  |

```typescript
import type {
  UseEmployeeStateTaxesFormReady,
  StateTaxFieldsGroup,
  StateTaxQuestionFieldEntry,
  EmployeeStateTaxesFieldsMetadata,
  EmployeeStateTaxesFormOutputs,
} from '@gusto/embedded-react-sdk'
```

## Choosing a field component <!-- slot: appendix -->

Each variant's `FieldComponent` must match the prop contract of the SDK UI primitive that variant renders. Discriminate on `question.type` first, then supply a component whose props satisfy the matching SDK prop type:

| Variant    | Required `FieldComponent` shape   | SDK primitive it replaces |
| ---------- | --------------------------------- | ------------------------- |
| `select`   | `ComponentType<SelectProps>`      | `Components.Select`       |
| `radio`    | `ComponentType<RadioGroupProps>`  | `Components.RadioGroup`   |
| `text`     | `ComponentType<TextInputProps>`   | `Components.TextInput`    |
| `number`   | `ComponentType<NumberInputProps>` | `Components.NumberInput`  |
| `currency` | `ComponentType<NumberInputProps>` | `Components.NumberInput`  |
| `date`     | `ComponentType<DatePickerProps>`  | `Components.DatePicker`   |

`SelectProps`, `RadioGroupProps`, `TextInputProps`, `NumberInputProps`, and `DatePickerProps` are all re-exported from `@gusto/embedded-react-sdk`, alongside the variant-specific `*StateTaxFieldProps` types whose `FieldComponent` field encodes the same constraint (e.g. `SelectStateTaxFieldProps['FieldComponent']` is `ComponentType<SelectProps>`).

A minimal type-safe override:

```tsx
import { MyDesignSystemSelect } from './forms/MyDesignSystemSelect'

if (question.type === 'select') {
  return <question.Field FieldComponent={MyDesignSystemSelect} />
}
```

## Per-question overrides <!-- slot: appendix -->

Each `Field` accepts:

- `label` and `description` to override the API-supplied defaults (the API description is otherwise rendered verbatim, sanitized via DOMPurify).
- `FieldComponent` to swap the underlying control with one of your own. The prop type is **variant-specific** — `SelectStateTaxFieldProps['FieldComponent']` is `ComponentType<SelectProps>`, `DateStateTaxFieldProps['FieldComponent']` is `ComponentType<DatePickerProps>`, and so on — so discriminate on `question.type` first.

You can branch on `question.type`, `group.state`, and `question.questionId`. They sit on a sliding scale from compile-time-safe to fragile:

| Branch on             | Stability  | Use it for |
| --------------------- | ---------- | ---------- |
| `question.type`       | Closed union of 6 strings owned by this hook. Adding a variant is an SDK breaking change.                         | Design-system primitive swaps. Safe and exhaustively typed. |
| `group.state`         | API-driven 2-letter code. Stable for known states, but a state's question set can change as tax law changes.      | Geographic copy or branding. Re-test when a new state opens up. |
| `question.questionId` | Camel-cased API key. The set of keys for a state is API-driven and **evolves** as questions are added or renamed. | One-off overrides for a specific question. Treat as a soft coupling. |

> **Caution.** Branching on `questionId` or `state` is a soft coupling to the API contract. When a new state question is introduced, renamed, or split in two, hardcoded `if (question.questionId === '…')` branches silently fall through to the default render. Audit these branches as part of any state-tax-related upgrade, and prefer `type`-level overrides whenever the same change applies to a whole class of fields.

### Combining `type`, `state`, and `questionId`

```tsx
import type { StateTaxFieldsGroup, StateTaxQuestionFieldEntry } from '@gusto/embedded-react-sdk'

import { MyDesignSystemSelect } from './forms/MyDesignSystemSelect'
import { MyDesignSystemDatePicker } from './forms/MyDesignSystemDatePicker'
import { CountyAutocomplete } from './forms/CountyAutocomplete'

// Explicit allow-list of Indiana questionIds we treat as county selects.
// Audit this set whenever the IN state-tax form changes upstream.
const IN_COUNTY_QUESTION_IDS = new Set([
  'currentEmploymentCounty',
  'currentResidenceCounty',
  'previousEmploymentCounty',
  'previousResidenceCounty',
])

function RenderQuestion({
  group,
  question,
}: {
  group: StateTaxFieldsGroup
  question: StateTaxQuestionFieldEntry
}) {
  // 1. questionId-level one-off — relabel a single question.
  if (question.questionId === 'fileNewHireReport') {
    return (
      <question.Field
        label="Will we file the state new-hire report on your behalf?"
        validationMessages={{ REQUIRED: 'Please choose an option' }}
      />
    )
  }

  // 2. State + questionId one-off — Indiana ships four county Selects we want
  //    rendered with a tailored autocomplete. Matching an explicit allow-list
  //    (not a substring) means newly-added IN questions don't silently inherit it.
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
  //    primitive. Safe to add and forget; new questions of these variants
  //    pick it up automatically.
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

A few things worth noting:

- The `questionId`/`state` branches sit **above** the `type` switch so a one-off override wins over the broad design-system swap.
- Keep `key={question.questionId}` on the rendered field — React relies on it to maintain field identity across re-renders.
- `currency` and `number` share the same `NumberInputProps` shape, so a single design-system Number override can collapse them: `case 'number': case 'currency': return <question.Field FieldComponent={MyNumberInput} />`.
- `question.questionId` is the **camelCase** form of the API key (`filingStatus`, not `filing_status`); keep string comparisons in camelCase to stay aligned with the hook's contract.

## Rendering without a provider <!-- slot: appendix -->

The example above wires the form through `SDKFormProvider`. To render without it, pass the hook result to each field via `formHookResult`:

```tsx
groups.map(group =>
  group.questions.map(question => (
    <question.Field key={`${group.state}-${question.questionId}`} formHookResult={stateTaxes} />
  )),
)
```
