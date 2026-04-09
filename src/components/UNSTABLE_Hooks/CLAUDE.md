# Implementing UNSTABLE_Hooks Form Hooks

Reference implementations:

- **Schema pattern + configurable required fields**: `useCompensationForm` at `src/components/UNSTABLE_Hooks/hooks/useCompensationForm/`
- **Standalone form with optional entity ID**: `useWorkAddressForm` at `src/components/UNSTABLE_Hooks/hooks/useWorkAddressForm/`

## File Structure

Each hook lives in its own folder under `src/components/UNSTABLE_Hooks/hooks/`:

```
hooks/use{Domain}Form/
├── use{Domain}Form.tsx      # Main hook: data fetching, form setup, return shape
├── {domain}Schema.ts        # Zod schema, error codes, form data/output types
├── fields.tsx               # Domain field components + exported field prop types
├── {Domain}Form.tsx         # Optional prebuilt component wrapping the hook
└── index.ts                 # Barrel file re-exporting everything
```

## 1. Schema (`{domain}Schema.ts`)

Every hook schema follows a 4-part structure: **error codes → field validators → required fields config → schema factory**. This is the canonical pattern — all hooks must follow it.

### Part 1: Error Codes

```typescript
export const ErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_EMAIL: 'INVALID_EMAIL',
} as const
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]
```

### Part 2: Field Validators

Define all field validators once in a `fieldValidators` object. Derive types from it — never redeclare field names or types separately. Validators define the shape and basic type constraints but do NOT include `.optional()` — `buildFormSchema` handles that.

Fields that need runtime coercion (e.g. number inputs that produce NaN, radio groups that deliver `'true'`/`'false'` strings) use `z.preprocess` directly in the validator:

```typescript
import { coerceNaN, coerceStringBoolean, coerceToISODate } from '../../form/preprocessors'

const fieldValidators = {
  jobTitle: z.string(),
  rate: z.preprocess(coerceNaN(0), z.number()),
  startDate: z.preprocess(coerceToISODate, z.iso.date().nullable()),
  stateWcCovered: z.preprocess(coerceStringBoolean, z.boolean()),
  adjustForMinimumWage: z.boolean(),
}

export type {Domain}FormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
export type {Domain}FormOutputs = {Domain}FormData
```

### Part 3: Required Fields Config

`requiredFieldsConfig` declares the requiredness rule for each field. Fields **not listed** default to `'always'` required. Available rules:

| Rule                      | Meaning                                             | Partner-configurable?                                                     |
| ------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| `'always'`                | Required in both modes (default when omitted)       | No                                                                        |
| `'create'`                | Required on create, optional on update              | Yes — partner can require it on update via `optionalFieldsToRequire`      |
| `'update'`                | Required on update, optional on create              | Yes — partner can require it on create via `optionalFieldsToRequire`      |
| `'never'`                 | Optional in both modes                              | Yes — partner can require it in either mode via `optionalFieldsToRequire` |
| `(data, mode) => boolean` | Conditionally required based on runtime form values | No — not configurable by partner                                          |

```typescript
import { type RequiredFieldConfig } from '../../form/buildFormSchema'

const requiredFieldsConfig = {
  jobTitle: 'create',
  rate: 'create',
  startDate: 'create',
  // Predicate: required when another field's value is truthy
  minimumWageId: data => data.adjustForMinimumWage,
  stateWcClassCode: data => String(data.stateWcCovered) === 'true',
  // adjustForMinimumWage, stateWcCovered, twoPercentShareholder — omitted → 'always'
} satisfies RequiredFieldConfig<typeof fieldValidators>
```

### Part 4: Schema Factory

The factory calls `buildFormSchema` and returns a `[schema, metadataConfig]` tuple. The schema goes to `zodResolver`; `metadataConfig` goes to `useDeriveFieldsMetadata`.

```typescript
import { buildFormSchema, type OptionalFieldsToRequire } from '../../form/buildFormSchema'

export type {Domain}OptionalFieldsToRequire = OptionalFieldsToRequire<typeof requiredFieldsConfig>

interface {Domain}SchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: {Domain}OptionalFieldsToRequire
  withStartDateField?: boolean  // example: conditional field exclusion
  hasSsn?: boolean              // example: redacted field detection
}

export function create{Domain}Schema(options: {Domain}SchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, withStartDateField = true, hasSsn = false } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: ErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    excludeFields: withStartDateField ? [] : ['startDate'],
    fieldsWithRedactedValues: hasSsn ? ['ssn'] : [],
    superRefine: validateCrossFieldRules,  // optional
  })
}
```

### Partner API: `optionalFieldsToRequire`

Partners promote optional fields to required on a per-mode basis. The type is derived from `requiredFieldsConfig` — only fields with `'create'`, `'update'`, or `'never'` rules are configurable. Fields with `'always'` or function predicates are not offered.

```typescript
// Type derived automatically — partners get autocomplete for valid field names
type CompensationOptionalFieldsToRequire = {
  create?: Array<'jobTitle' | 'rate' | 'startDate' | ...>  // fields with 'update' or 'never' rules
  update?: Array<'jobTitle' | 'rate' | 'startDate' | ...>  // fields with 'create' or 'never' rules
}

// Partner usage
useCompensationForm({
  employeeId,
  optionalFieldsToRequire: {
    create: ['jobTitle', 'rate'],
    update: ['jobTitle'],
  },
})
```

### How `buildFormSchema` Works Internally

1. Wraps every included field with `makeOptional` (preprocess `''`/`null` → `undefined`, then `.optional()`)
2. For each field, skips adding a required-validation entry if it's in `fieldsWithRedactedValues` (the field stays in the schema for format validation but empty values pass)
3. Builds a `superRefine` that checks each field against its resolved requiredness rule and emits `requiredErrorCode` for empty required fields
4. Appends the caller's `superRefine` for cross-field rules
5. Auto-detects predicate dependencies via a recording Proxy (`detectPredicateDeps`) — this tells `useDeriveFieldsMetadata` which fields to watch
6. In `getFieldsMetadata`, sets `hasRedactedValue: true` for any field in `fieldsWithRedactedValues` (the `isRequired` flag still respects `optionalFieldsToRequire` so the UI shows the required indicator)
7. Returns `[schema, { getFieldsMetadata, predicateDeps }]`

### When to Use `superRefine` vs. `requiredFieldsConfig` vs. `optionalFieldsToRequire`

| Technique                           | When to use                                                           | Example                             | Metadata-aware?                                    |
| ----------------------------------- | --------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------- |
| `requiredFieldsConfig` rule         | Declarative field-level requiredness                                  | `jobTitle: 'create'`                | Yes                                                |
| `optionalFieldsToRequire` (partner) | Partner promotes optional field to required                           | `{ create: ['jobTitle'] }`          | Yes                                                |
| `excludeFields`                     | Field conditionally absent from schema                                | `excludeFields: ['startDate']`      | Yes (field absent)                                 |
| `fieldsWithRedactedValues`          | Field has a stored server-side value redacted in the API response     | `fieldsWithRedactedValues: ['ssn']` | Yes (`hasRedactedValue: true`, keeps `isRequired`) |
| Predicate rule                      | Requiredness depends on runtime form values                           | `data => data.adjustForMinimumWage` | Yes (via Proxy auto-detection)                     |
| `superRefine`                       | Cross-field validation logic (rate thresholds, cascading constraints) | FLSA + rate + paymentUnit rules     | No — validation only                               |

### `z.preprocess` and Type Inference

`z.preprocess` causes `z.input` to infer `unknown`, which would break `useForm`/`zodResolver` generics. `buildFormSchema` handles this internally by typing its return tuple's schema with the correct `FormData` type derived from the original `fieldValidators`. Hook authors don't need any casts — just use `zodResolver(schema)` directly:

```typescript
const [schema, metadataConfig] = createDomainSchema({ mode })

const formMethods = useForm<FormData, unknown, FormOutputs>({
  resolver: zodResolver(schema),
  // ...
})
```

The `superRefine` callback in `buildFormSchema` options is already typed with the form data type from `fieldValidators`, so no cast is needed there either.

## 2. Fields (`fields.tsx`)

- Each field is a thin wrapper around a generic `*HookField` component that binds `name`
- Export a `*FieldProps` type using `HookFieldProps<*HookFieldProps<TErrorCode, TEntry>>` which strips `name`
- Derive validation type aliases from the schema's error codes constant so they stay in sync — never hardcode string unions

```typescript
// Derive validation types from the error codes constant — not hardcoded strings
export type RequiredValidation = typeof ErrorCodes.REQUIRED
export type RateValidation = (typeof ErrorCodes)['REQUIRED' | 'RATE_MINIMUM' | 'RATE_EXEMPT_THRESHOLD']

// Field prop types strip `name` via HookFieldProps, parameterized by the relevant validation type
export type JobTitleFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>
export type RateFieldProps = HookFieldProps<NumberInputHookFieldProps<RateValidation>>

export function JobTitleField(props: JobTitleFieldProps) {
  return <TextInputHookField {...props} name="jobTitle" />
}
```

## 3. Main Hook (`use{Domain}Form.tsx`)

### Data Fetching

- Use `@gusto/embedded-api/react-query/*` hooks for all API calls
- Gate dependent queries with `enabled: !!dependency`
- Use `useErrorHandling` to build the `errorHandling` bag (see Error Handling section below)

### Optional Entity IDs and Submit-Time Resolution

When a hook depends on an entity ID (e.g. `employeeId`) for both **fetching** and **creating**, make it optional in props and accept it via submit options. This lets partners compose hooks without managing re-render cycles from prop changes.

**Why**: In a composed form, creating an employee returns an ID that compensation and work address need. If that ID is passed as a prop, updating it triggers query refetching, which puts the hook back into its loading state and tears down the form UI. Passing the ID at submit time instead avoids this entirely — the form stays rendered and the ID is resolved when the mutation fires.

**Pattern**:

1. Make the ID optional in props: `employeeId?: string`
2. Gate queries with `enabled`: `useGetJobs({ employeeId: employeeId ?? '' }, { enabled: !!employeeId })`
3. Conditionally include queries in the error handling array: `const queries = employeeId ? [jobsQuery, ...] : []`
4. Skip the loading guard when the ID is absent: `const isDataLoading = employeeId ? jobsQuery.isLoading : false`
5. Add the ID to the submit options interface: `{ employeeId?: string; ... }`
6. Resolve in the submit handler: `const resolvedId = options?.employeeId ?? employeeId`
7. Guard before mutation: `if (!resolvedId) throw new SDKInternalError('employeeId is required to submit')`

```typescript
// Props — ID is optional
interface UseCompensationFormProps {
  employeeId?: string
  // ...
}

// Submit options — ID can be provided at submit time
interface CompensationSubmitOptions {
  employeeId?: string
  startDate?: string
}

// Inside the hook
const jobsQuery = useGetJobs({ employeeId: employeeId ?? '' }, { enabled: !!employeeId })
const queries = employeeId ? [jobsQuery, addressesQuery, employeeQuery] : []
const isDataLoading = employeeId ? jobsQuery.isLoading || ... : false

// Inside onSubmit
const resolvedEmployeeId = options?.employeeId ?? employeeId
if (!resolvedEmployeeId) throw new SDKInternalError('employeeId is required')
await createJobMutation.mutateAsync({ request: { employeeId: resolvedEmployeeId, ... } })
```

**When to use this pattern**: When the entity ID is needed for a create mutation but the hook also uses it to fetch existing data. This is the common case for hooks that support both create and update modes. If the ID is only ever used for fetching (pure update-mode hooks), just keep it required.

### Form Defaults and Data Sync

- Build `resolvedDefaults` from server data, falling back to `partnerDefaults`, then hardcoded defaults
- Use `values` + `resetOptions: { keepDirtyValues: true }` on `useForm` — NOT manual `useEffect` + `reset()`
- This lets react-hook-form deep-compare and sync when server data changes while preserving user edits

```typescript
const [schema, metadataConfig] = useMemo(
  () => create{Domain}Schema({ mode, optionalFieldsToRequire }),
  [mode, optionalFieldsToRequire],
)

const formMethods = useForm<FormData, unknown, FormOutputs>({
  resolver: zodResolver(schema),
  defaultValues: resolvedDefaults,
  values: resolvedDefaults,
  resetOptions: { keepDirtyValues: true },
})

const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
```

### Fields Metadata

- Destructure the tuple from the schema factory: `const [schema, metadataConfig] = create{Domain}Schema({ mode, optionalFieldsToRequire })`
- Pass `metadataConfig` and the form's `control` to `useDeriveFieldsMetadata` — this reactively resolves `isRequired` for predicate-based rules by watching only the specific form fields that predicates read
- Enhance select/radio fields with `withOptions<TEntry>(baseMetadata.field, options, entries)`
- Override `isRequired`/`isDisabled` based on business logic

#### Redacted Fields (`fieldsWithRedactedValues`)

Some API fields (e.g. SSN, EIN) return a flag like `hasSsn` indicating a value exists server-side, but the actual value is redacted. Use `fieldsWithRedactedValues` in the schema factory to handle this automatically:

```typescript
// In the schema factory:
fieldsWithRedactedValues: hasSsn ? ['ssn'] : [],
```

This produces three effects:

1. **Schema**: the field stays in the schema for format validation, but empty values pass required validation (the server already has the value)
2. **Metadata `isRequired`**: still respects `optionalFieldsToRequire` — the UI shows the required indicator as the partner configured
3. **Metadata `hasRedactedValue`**: auto-set to `true` — field components use this to show a masked placeholder (e.g. `***-**-****`)

No manual metadata patching is needed in the hook — `buildFormSchema` handles it all. Previously this required manually spreading `hasRedactedValue` onto the metadata in the hook; that is no longer necessary.

### Conditional Fields

- Return `undefined` for fields that shouldn't render: `FlsaStatus: isEnabled ? FlsaStatusField : undefined`
- Partners check truthiness: `{Fields.FlsaStatus && <Fields.FlsaStatus ... />}`

### Error Handling

Use `useErrorHandling` to build the `errorHandling` bag from queries and submit state. This provides partners with a unified interface for errors, query retries, and submit error clearing:

```typescript
const { baseSubmitHandler, error: submitError, setError } = useBaseSubmit('{Domain}Form')

const queries = [queryA, queryB, queryC]
const errorHandling = useErrorHandling(queries, { error: submitError, setError })
```

`useErrorHandling` returns `HookErrorHandling`:

- `errors: SDKError[]` — combined query + submit errors
- `retryQueries: () => void` — retries all failed data-fetching queries (dependent queries auto-trigger via `enabled`)
- `clearSubmitError: () => void` — clears the stateful mutation error

### Return Shape (discriminated union)

The `errorHandling` bag is available in both loading and ready states so partners can always display errors and retry. This is critical because failed queries produce no data, so the hook stays in the loading branch — but `errorHandling.errors` will be populated, letting partners show error UI with a retry button instead of an infinite spinner:

```typescript
// Loading state — errorHandling still available for error display + retry
if (isDataLoading || !requiredData) {
  return { isLoading: true as const, errorHandling }
}

// Ready state
return {
  isLoading: false as const,
  data: {
    /* domain entities */
  },
  status: { isPending, mode: isCreateMode ? 'create' : 'update' },
  actions: { onSubmit },
  errorHandling,
  form: {
    Fields: {
      /* field components, some possibly undefined */
    },
    fieldsMetadata,
    hookFormInternals: { formMethods },
  },
}
```

### Submit Handler

- Use `formMethods.handleSubmit` inside a `Promise` wrapper so `onSubmit` is async/awaitable
- Delegate to `baseSubmitHandler` for error boundary integration
- Return `HookSubmitResult<TEntity>` where `TEntity` is the primary domain entity the form manages (e.g. `Compensation`). The prebuilt component uses the return value to fire `onEvent`

#### Callbacks vs Return Value

Use **return value only** (no callbacks) when `onSubmit` makes a single create-or-update API call. The caller inspects the returned `HookSubmitResult` to determine what happened:

```typescript
// Simple create/update — return result, no callbacks
const onSubmit = async (): Promise<HookSubmitResult<PaySchedule> | undefined> => { ... }

// Prebuilt component usage
const result = await hook.actions.onSubmit()
if (result) {
  onEvent(result.mode === 'create' ? CREATED_EVENT : UPDATED_EVENT, result.data)
}
```

Use **callbacks** only when `onSubmit` orchestrates **multiple sequential API calls** where the caller needs to react after each step (e.g. `useCompensationForm` creates/updates a Job then updates a Compensation — the caller may want `onJobCreated` and `onCompensationUpdated` as separate events). Even with callbacks, still return the final `HookSubmitResult` so the caller has a unified await point.

```typescript
// Multi-step — callbacks for intermediate steps, result for final outcome
const onSubmit = async (
  callbacks?: CompensationSubmitCallbacks,
): Promise<HookSubmitResult<Compensation> | undefined> => { ... }
```

## 4. Prebuilt Component (`{Domain}Form.tsx`)

- Props extend `Use{Domain}FormProps` and `Omit<BaseComponentInterface, 'defaultValues'>`
- Split into `{Domain}FormRoot` (renders form) and `{Domain}Form` (wraps in `BaseBoundaries`)
- Use `SDKFormProvider` to connect react-hook-form + field metadata + server error syncing
- Use i18n: `useI18n(namespace)`, `useComponentDictionary(namespace, dictionary)`, `useTranslation(namespace)`
- Add translation file at `src/i18n/en/UNSTABLE.{Domain}Form.json`

## 5. FieldComponent Pattern

Partners can inject custom UI via `FieldComponent` prop on any field:

- `FieldComponent` is typed with UI-level props (`TextInputProps`, `SelectProps`, etc.) — NOT internal field props
- The `*HookField` resolves metadata/errors and renders the SDK's `*Field` component
- The `*Field` component handles react-hook-form via `useField` and renders `FieldComponent ?? Components.Default`
- Partners never need react-hook-form knowledge; they receive `value`, `onChange`, `onBlur`, etc.

## 6. Exports Checklist

Wire through three barrel files in order:

1. `hooks/use{Domain}Form/index.ts` — re-export everything from the hook folder
2. `src/components/UNSTABLE_Hooks/index.ts` — re-export from the hook barrel
3. `src/UNSTABLE_Hooks.ts` — public-facing barrel, re-export from UNSTABLE_Hooks index

### What partners actually need (keep the public surface minimal)

Reference `gws-flows/app/frontend/react_sdk/CustomCompensationForm.tsx` as the real-world partner usage. A partner building a custom form imports only:

| Category           | Examples                                                     | Why                                                                                                                |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Hook               | `useCompensationForm`                                        | Core entry point for partners                                                                                      |
| Prebuilt component | `CompensationForm`                                           | Exported but primarily for internal use — regression testing that the hook matches the existing prebuilt component |
| Form provider      | `SDKFormProvider`                                            | Wraps custom form for metadata + error syncing                                                                     |
| Domain types       | `UseCompensationFormReady`, `CompensationSubmitCallbacks`    | Type-narrowing ready state, typed submit callbacks                                                                 |
| Field prop types   | `FlsaStatusFieldProps`, `PaymentUnitFieldProps`, etc.        | Typing `getOptionLabel` callbacks — lets partners derive API entity types without us exporting them                |
| Validation types   | `ValidationMessages`, `RateValidation`, `RequiredValidation` | Typing `validationMessages` props                                                                                  |
| UI prop types      | `TextInputProps`, `SelectProps`, etc.                        | Typing custom `FieldComponent` implementations                                                                     |

### What stays internal (export from inner barrels but NOT from `UNSTABLE_Hooks.ts` unless needed)

Infrastructure utilities like `buildFormSchema`, `useDeriveFieldsMetadata`, `deriveFieldsMetadata`, `withOptions`, `FormFieldsMetadataProvider`, `useErrorHandling`, `collectErrors`, generic `*HookField` components, and base types like `HookFormInternals`, `BaseFormHookReady` are used by the SDK to build hooks — not by partners. Only promote to the public barrel if a partner use case demands it.

Do NOT re-export `@gusto/embedded-api` entity types directly — partners derive them from field prop generics (e.g. `NonNullable<FlsaStatusFieldProps['getOptionLabel']>` infers the entity type).

## 7. Validation Parity with Stable Components

Hook schemas must match the validation rules of the existing stable components in `src/components/Employee/`, `src/components/Contractor/`, etc. Gaps found during QA:

### Known Validation Patterns to Carry Forward

| Pattern                         | Where it lives                             | Hook must include                                          |
| ------------------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| `NAME_REGEX` on first/last name | `src/helpers/validations.ts`               | `.regex(NAME_REGEX, { message: ErrorCodes.INVALID_NAME })` |
| `SSN_REGEX` on SSN field        | `src/helpers/validations.ts`               | `.refine(v => SSN_REGEX.test(v.replace(/\D/g, '')), ...)`  |
| Exempt salary threshold         | `Employee/Compensation/useCompensation.ts` | `superRefine` with `FLSA_OVERTIME_SALARY_LIMIT` check      |
| Commission-only rate = 0        | Same                                       | `superRefine` enforcing `rate === 0`                       |
| Owner payment unit = Paycheck   | Same                                       | `superRefine` enforcing `paymentUnit === 'Paycheck'`       |

When adding new hooks, check `src/helpers/validations.ts` for shared regex/validators and the stable component's schema for cross-field `superRefine` rules.

### Payload Parity Checklist

Before shipping a hook, verify the actual HTTP request bodies match the stable component for the same operation. Differences in field inclusion, key naming, or value formatting are regressions.

Verified parity status:

| Hook                     | PUT payload match | Validation match                | Notes                                                                                               |
| ------------------------ | ----------------- | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `useCompensationForm`    | Identical         | All cross-field rules present   | Hook uses typed error codes vs string literals (improvement)                                        |
| `useEmployeeDetailsForm` | Identical         | `NAME_REGEX` added to close gap | Stable form sends compound (employee + home addr + work addr); hook sends employee only (by design) |
| `useWorkAddressForm`     | Identical         | No gaps                         | Stable form embeds work address in Profile; hook is standalone                                      |

## 8. Regression Testing with gws-flows Comparison Pages

The `gws-flows` repo has side-by-side comparison pages that render the stable component, the prebuilt hook component, and a custom partner-built form using the same hook — all against the same employee data. These are the primary tool for verifying parity.

### Comparison Pages

| Page             | URL pattern                                                       | Columns                                               |
| ---------------- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| Compensation     | `/react_sdk/compensation-comparison/:employeeId`                  | `Employee.Compensation` / `CompensationForm` / Custom |
| Employee Details | `/react_sdk/employee-details-comparison` (with Employee ID input) | `Employee.Profile` / `EmployeeDetailsForm` / Custom   |
| Work Address     | `/react_sdk/work-address-comparison` (with Employee ID input)     | `WorkAddressForm` / Custom                            |

### Payload Comparison Technique

Use Playwright's `page.route()` to intercept and capture PUT/POST request bodies from each form column, then diff them:

1. Install route interception via `browser_run_code`:
   ```javascript
   page.__capturedBodies = []
   await page.route('**/fe_sdk/**', async route => {
     const request = route.request()
     if (['PUT', 'POST', 'PATCH'].includes(request.method())) {
       page.__capturedBodies.push({
         url: request.url(),
         method: request.method(),
         body: request.postDataJSON(),
       })
     }
     await route.continue()
   })
   ```
2. Submit each form column, reading captured bodies between submissions
3. Compare request URLs, methods, and JSON bodies across columns

### Bypassing React Aria Components

React Aria's Select, DatePicker, and Switch components intercept pointer events and are difficult for Playwright to interact with directly. Two workarounds:

1. **`FieldComponent` overrides in gws-flows**: The custom form column uses native HTML inputs (`<input>`, `<select>`, `<input type="date">`, `<input type="checkbox">`) via the `FieldComponent` prop, making Playwright interaction reliable.

2. **API-first data setup**: Instead of fighting React Aria in the browser, use the Gusto Payroll MCP or direct `curl` calls to the local `fe_sdk` proxy to set up employee data (SSN, home address, start date, etc.), then reload the page. Both stable and hook forms pick up the data automatically — no need to interact with complex form controls.

### What to Verify

- **Field visibility**: Do the same fields appear in each column? Are optional/required markers consistent?
- **Field values**: Are pre-populated values identical (formatting, defaults)?
- **Validation behavior**: Do the same inputs trigger the same errors?
- **Submit payloads**: Are the HTTP request bodies byte-identical for the same operation?
- **Multi-request submissions**: Does the stable form send additional requests (e.g. home address, work address, onboarding status) that the hook intentionally omits? Document these as by-design differences.

## 9. Unit Testing

- Run `npm run test -- --run` (never `npm run test` — it hangs in watch mode)
- Run `npm run build` after changes to regenerate `.d.ts` files for gws-flows consumption
- Always run `npm run build` before considering a PR ready — TypeScript errors in prebuilt components (e.g. missing `validationMessages` keys) only surface during build, not in unit tests
