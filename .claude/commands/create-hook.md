# Create a New Form Hook

Scaffold a new form hook in the correct feature module location.

## Input

The user provides:

- **Domain**: Employee, Company, Contractor, or Payroll
- **Feature**: The feature name (e.g. Compensation, PaySchedule, DocumentSigner, Profile)
- **Hook name**: The hook name without the `use` prefix (e.g. `EmployeeDetailsForm`, `HomeAddressForm`, `JobForm`)

For the rest of this doc, `{Domain}` is the entity name (e.g. `EmployeeDetails`, `HomeAddress`, `Job`) and `{name}Form` is the directory/file basename (e.g. `useEmployeeDetailsForm`).

## Steps

### Step 1: Determine the target location

Hooks live in their feature module's `shared/` directory, one directory per hook:

```text
src/components/{Domain}/{Feature}/shared/use{Name}Form/
├── use{Name}Form.tsx        # Main hook
├── {camelDomain}Schema.ts   # Zod schema, error codes, form data/output types
├── fields.tsx               # Domain field components + exported field prop types
├── index.ts                 # Barrel re-exports
└── use{Name}Form.test.tsx   # Hook unit tests
```

Examples:

- `src/components/Employee/Profile/shared/useEmployeeDetailsForm/`
- `src/components/Employee/Profile/shared/useHomeAddressForm/`
- `src/components/Employee/Profile/shared/useWorkAddressForm/`
- `src/components/Employee/Compensation/shared/useCompensationForm/`
- `src/components/Employee/Compensation/shared/useJobForm/`
- `src/components/Company/PaySchedule/shared/usePayScheduleForm/`

### Step 2: Read reference implementations

Pick the closest existing hook to the one you're building and read it end-to-end before scaffolding. The four files in any reference directory plus `.claude/hooks-implementation.md` are the canonical patterns:

| Closest reference                                                  | Use when…                                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `src/components/Employee/Profile/shared/useEmployeeDetailsForm/`   | Hook does multiple sequential mutations per submit (chained API calls) — needs `*SubmitCallbacks`      |
| `src/components/Employee/Profile/shared/useHomeAddressForm/`       | Single-mutation create-or-update hook with optional entity id resolved at submit time                  |
| `src/components/Employee/Profile/shared/useWorkAddressForm/`       | Single-mutation hook that also exposes a list query (e.g. company locations) feeding a select field    |
| `src/components/Employee/Compensation/shared/useJobForm/`          | Hook with predicate-based requiredness (`stateWcCovered → stateWcClassCode required`) + radio coercion |
| `src/components/Employee/Compensation/shared/useCompensationForm/` | Cross-field `superRefine` validation, conditional fields, status flags surfaced to partners            |
| `src/components/Company/PaySchedule/shared/usePayScheduleForm/`    | Company-domain hook with admin-only fields                                                             |

Always read:

- The schema file — error codes, field validators, required-fields config, schema factory
- The fields file — domain field components and the validation-type aliases each one declares
- The hook file — data fetching, form setup, return shape, submit handler
- The barrel `index.ts` — what is re-exported and under which names
- `.claude/hooks-implementation.md` — schema, fields, hook internals, error handling, exports in detail
- `src/partner-hook-utils/form/buildFormSchema.ts` — the schema builder's full surface (`requiredFieldsConfig`, `excludeFields`, `fieldsWithRedactedValues`, `superRefine`, `OptionalFieldsToRequire`)
- `src/partner-hook-utils/types.ts` — `BaseFormHookReady`, `HookLoadingResult`, `HookSubmitResult`, `HookErrorHandling`, `FieldsMetadata`, `HookFieldProps`

### Step 3: Create the directory and files

#### `{camelDomain}Schema.ts`

Follow the 4-part structure: **error codes → field validators → required fields config → schema factory**. Use the section comment style from the reference hooks.

```typescript
import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

export const {Domain}ErrorCodes = {
  REQUIRED: 'REQUIRED',
  // Add format/cross-field codes here as needed
} as const

export type {Domain}ErrorCode = (typeof {Domain}ErrorCodes)[keyof typeof {Domain}ErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  // Plain shape constraints; do NOT add `.optional()` — buildFormSchema does
  // that based on `requiredFieldsConfig`. Escape hatch: an enum field that
  // needs to render an empty placeholder before the user picks must be
  // `.optional()` so the resolver tolerates `undefined` while editing.
  // Requiredness is still enforced on submit via `requiredFieldsConfig`.
  // See `flsaStatus` in `compensationSchema.ts` for the canonical example.
  //
  // Use z.preprocess for fields that need runtime coercion (NaN → 0, 'true'/'false' → boolean,
  // various date inputs → ISO date). Import preprocessors from
  // '@/partner-hook-utils/form/preprocessors'.
}

export type {Domain}Field = keyof typeof fieldValidators

export type {Domain}FormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
// @internal seam — the hook uses this as useForm's third generic, but it is NOT
// part of the public surface (don't re-export from src/index.ts). Today it's a
// plain alias of {Domain}FormData; the name documents the input/output split for
// the day a schema transform makes them diverge. See .claude/tsdoc-guides/hooks.md.
/** @internal */
export type {Domain}FormOutputs = {Domain}FormData

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {
  // 'always' (default when omitted) | 'create' | 'update' | 'never'
  // | (data, mode) => boolean — predicate. Auto-detected as a metadata
  // dependency via a recording Proxy in buildFormSchema.
  //
  // Boolean fields (z.boolean()) are inherently always present — do NOT
  // list them here, do NOT add them to optionalFieldsToRequire.
} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

export type {Domain}OptionalFieldsToRequire = OptionalFieldsToRequire<typeof requiredFieldsConfig>

interface {Domain}SchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: {Domain}OptionalFieldsToRequire
  // Add hook-specific flags as needed:
  // withFooField?: boolean       // → excludeFields when false
  // hasRedactedFoo?: boolean     // → fieldsWithRedactedValues when true
  // hireDate?: string | null     // → cross-field bound used inside superRefine
}

export function create{Domain}Schema(options: {Domain}SchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: {Domain}ErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    // excludeFields: withFooField ? [] : ['foo'],   // static, build-time field removal
    // excludeFields: (data, mode) => (data.type === 'Business' ? ['ssn'] : ['ein']),
    //   ^ value-aware form: applicability is decided per validation pass from the
    //     current form values — use it for fields rendered conditionally on a
    //     discriminator (see .claude/hooks-implementation.md → excludeFields)
    // fieldsWithRedactedValues: hasRedactedFoo ? ['foo'] : [],
    // superRefine: (data, ctx) => { /* cross-field rules */ },
  })
}
```

#### `fields.tsx`

Each field is a thin wrapper around a generic `*HookField` component that binds `name`. Validation-type aliases are derived from the schema's error-codes constant — never hardcode string unions.

Pick the `*HookField` that matches the Zod validator. All seven are exported from `@/partner-hook-utils/form/fields`:

| `*HookField`           | Use for                                                | Typical Zod validator                         |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------- |
| `TextInputHookField`   | Plain string input (name, address line, SSN, email)    | `z.string()`                                  |
| `NumberInputHookField` | Numeric input (rate, amount, hours)                    | `z.preprocess(coerceNaN(0), z.number())`      |
| `SelectHookField`      | Typeahead/dropdown over a list (state, location, enum) | `z.enum([...])` or `z.string()` for ids       |
| `RadioGroupHookField`  | Small enum picked from visible radios                  | `z.enum([...])`, often with radio coercion    |
| `CheckboxHookField`    | Single boolean (acknowledgements, opt-ins)             | `z.boolean()`                                 |
| `SwitchHookField`      | Single boolean rendered as a toggle                    | `z.boolean()`                                 |
| `DatePickerHookField`  | Date input                                             | `z.preprocess(coerceToISODate, z.iso.date())` |

For canonical examples of each: `TextInput`, `DatePicker`, and `Switch` (`selfOnboarding`) in `useEmployeeDetailsForm/fields.tsx`; `Select` with a typed entity `TEntry` (`Location`) in `useWorkAddressForm/fields.tsx`; `Select`, `NumberInput` (currency `rate`), and `Checkbox` (`adjustForMinimumWage`) in `useCompensationForm/fields.tsx`; `RadioGroup` (`stateWcCovered`) in `useJobForm/fields.tsx`.

```tsx
import type { {Domain}ErrorCodes } from './{camelDomain}Schema'
import type { TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
// import the other *HookFieldProps you need (Select, NumberInput, Checkbox, Switch, RadioGroup, DatePicker)
import { TextInputHookField } from '@/partner-hook-utils/form/fields'
import type { HookFieldProps } from '@/partner-hook-utils/types'

// Default required-only validation type. When a field has additional codes,
// derive a tuple type — e.g.:
//   export type NameValidation = (typeof {Domain}ErrorCodes)['REQUIRED' | 'INVALID_NAME']
// Re-export this from index.ts under `{Domain}RequiredValidation` so partners
// can type their own validationMessages.
export type RequiredValidation = typeof {Domain}ErrorCodes.REQUIRED

export type {Field}FieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>

// The {Field}Field component is @internal — partners reach it via form.Fields,
// it is NOT exported from src/index.ts (only {Field}FieldProps is). It gets
// just `/** @internal */` — no summary, no @remarks. The partner-facing
// behavior (validation pattern, options/defaults, masking, getOptionLabel)
// lives on the {Domain}FormFields member instead. See .claude/tsdoc-guides/hooks.md.
/** @internal */
export function {Field}Field(props: {Field}FieldProps) {
  return <TextInputHookField {...props} name="{fieldName}" />
}

// Boolean (Checkbox/Switch) fields don't need a validation generic — REQUIRED
// can never fire. Just `HookFieldProps<CheckboxHookFieldProps>`.

// Select fields that produce a typed entity (Location, MinimumWage, etc.) carry
// the entity through a TEntry generic so partners can type `getOptionLabel`:
//   export type LocationFieldProps = HookFieldProps<SelectHookFieldProps<RequiredValidation, Location>>

// Fields with a TEntry of a primitive (e.g. state abbreviation strings) still
// pass it through so getOptionLabel is typed at the call site:
//   export type StateFieldProps = HookFieldProps<SelectHookFieldProps<RequiredValidation, string>>
```

#### `use{Name}Form.tsx`

The hook orchestrates data fetching → form setup → submit handler → discriminated-union return. Key pieces:

```tsx
import type { ComponentType } from 'react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { {Entity} } from '@gusto/embedded-api/models/components/{entity}'
// React-query hooks for the GET / mutations this hook drives
import {
  create{Domain}Schema,
  type {Domain}OptionalFieldsToRequire,
  type {Domain}FormData,
  type {Domain}FormOutputs,
} from './{camelDomain}Schema'
import { /* per-field components */ } from './fields'
import type { /* per-field {Field}FieldProps types for {Domain}FormFields */ } from './fields'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { withOptions } from '@/partner-hook-utils/form/withOptions'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'

export type { {Domain}OptionalFieldsToRequire } from './{camelDomain}Schema'

// Only define this when the hook chains multiple sequential API calls per
// submit (e.g. useEmployeeDetailsForm runs updateEmployee + updateOnboardingStatus).
// Single-mutation hooks (useHomeAddressForm, useJobForm, useCompensationForm,
// etc.) drop callbacks entirely — partners read result.data and branch on
// result.mode from the awaited return value.
// export interface {Domain}SubmitCallbacks { ... }

export interface {Domain}SubmitOptions {
  // Submit-time overrides. Most hooks accept an optional entity id here so a
  // downstream hook can target a just-created parent without re-fetching.
  // employeeId?: string
}

export interface Use{Domain}FormProps {
  // Make ids optional when they double as fetch keys AND create-mutation
  // arguments (see "Optional Entity IDs and Submit-Time Resolution" in
  // hooks-implementation.md). Pass through:
  // - optionalFieldsToRequire (partner promotion of optional fields)
  // - defaultValues (partner pre-fill, server data wins on update). Type this
  //   as Partial<{Domain}FormData> — the form-data shape, NOT a Pick of the API
  //   entity. Entity types carry `string | null`; reusing them leaks `null`
  //   into the partner type and forces `?? undefined` at every call site. The
  //   only place null gets normalized is resolvedDefaults inside the hook.
  // - validationMode (react-hook-form's `mode`)
  // - shouldFocusError (composeSubmitHandler sets this to false externally)
  // - any with*Field flags that gate fields out of the schema
}

// This interface is @public and is the documentation home for each field's
// behavior — the {Field}Field components are @internal, so prose on them is
// invisible to partners. Type members as ComponentType<{Field}FieldProps>
// (needs `import type { ComponentType } from 'react'`) so the public interface
// doesn't reference the internal function. Use
// `ComponentType<{Field}FieldProps> | undefined` for conditionally rendered
// fields. See .claude/tsdoc-guides/hooks.md.
export interface {Domain}FormFields {
  /** Bound to `{fieldName}`. <one line of observable behavior: validation pattern, options/defaults, masking, getOptionLabel>. */
  {Field}: ComponentType<{Field}FieldProps>
}

export interface Use{Domain}FormReady extends BaseFormHookReady<
  FieldsMetadata,
  {Domain}FormData,
  {Domain}FormFields
> {
  data: {
    // Domain entities the partner needs in the ready state. Use `null` (not
    // `undefined`) for entities that may legitimately be absent — keeps the
    // discriminated union narrow.
  }
  status: { isPending: boolean; mode: 'create' | 'update' }
  actions: {
    onSubmit: (
      // callbacks?: {Domain}SubmitCallbacks,  // only for chained-submit hooks
      options?: {Domain}SubmitOptions,
    ) => Promise<HookSubmitResult<{Entity}> | undefined>
  }
}

export function use{Domain}Form(props: Use{Domain}FormProps): HookLoadingResult | Use{Domain}FormReady {
  // 1. Data fetching — `enabled: !!dependency` for queries that depend on
  //    optional ids; conditionally include them in the queries-for-errors
  //    array so loading/error states behave correctly when the id is absent.

  // 2. Schema — useMemo so the tuple is stable across renders that don't
  //    change `mode`, `optionalFieldsToRequire`, or hook-specific flags.
  const [schema, metadataConfig] = useMemo(
    () => create{Domain}Schema({ mode, optionalFieldsToRequire /* ... */ }),
    [mode, optionalFieldsToRequire /* ... */],
  )

  // 3. Defaults — server data > partner defaults > hardcoded.

  // 4. useForm — `values` + `resetOptions: { keepDirtyValues: true }` lets
  //    react-hook-form deep-compare and sync when server data resolves while
  //    preserving user edits.
  const formMethods = useForm<{Domain}FormData, unknown, {Domain}FormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  // 5. Mutations + isPending across all of them.

  // 6. Submit state + composed error handling. Pass nested SDK hook results in
  //    the array as `{ errorHandling }` objects when wrapping another hook.
  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('{Domain}Form')
  const errorHandling = composeErrorHandler(queriesForErrors, { submitError, setSubmitError })

  // 7. Fields metadata — derive then enrich. `withOptions` adds `options` and
  //    `entries` to select/radio metadata; `entries` lets the UI translate
  //    labels via `getOptionLabel` without hooks owning translations.
  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = {
    // ...baseMetadata fields, with isDisabled / withOptions wrappers as needed.
  }

  // 8. onSubmit — handleSubmit wrapped in a Promise so partners can await it.
  //    Delegate to baseSubmitHandler so APIError/SDKValidationError/etc. flow
  //    into errorHandling. Return HookSubmitResult<TEntity>.

  // 9. hookFormInternals — Rules of Hooks: useHookFormInternals must be called
  //    unconditionally BEFORE the loading-gate return, never inside the
  //    ready-return object. createGetFormSubmissionValues is a plain factory
  //    (not a hook) and can be called either way.
  const hookFormInternals = useHookFormInternals(formMethods)

  // 10. Loading gate — return errorHandling even on the loading branch so
  //     partners can show error UI + retry instead of an infinite spinner.
  if (isDataLoading || /* required entity not yet available */) {
    return { isLoading: true as const, errorHandling }
  }

  // 11. Ready return.
  return {
    isLoading: false as const,
    data: { /* entities */ },
    status: { isPending, mode },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: { /* per-field components, some possibly undefined */ },
      fieldsMetadata,
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

export type Use{Domain}FormResult = HookLoadingResult | Use{Domain}FormReady
export type {Domain}FieldsMetadata = Use{Domain}FormReady['form']['fieldsMetadata']
// {Domain}FormFields is the same as the interface declared above; no alias
// needed unless you named the interface differently (e.g. EmployeeDetailsFields
// + an EmployeeDetailsFormFields alias — see useEmployeeDetailsForm.tsx).
```

#### `index.ts`

Re-export the hook, error codes, and every field-prop type. The schema factory (`create{Domain}Schema`) is `@internal`; the inner barrel may carry it for SDK use, but it must **not** be promoted to `src/index.ts` (see Step 4). Rename `RequiredValidation` to `{Domain}RequiredValidation` so it doesn't collide when partners import multiple hooks.

```typescript
export { use{Domain}Form } from './use{Domain}Form'
export type {
  // {Domain}SubmitCallbacks,  // only for chained-submit hooks
  {Domain}SubmitOptions,
  {Domain}OptionalFieldsToRequire,
  Use{Domain}FormProps,
  Use{Domain}FormResult,
  Use{Domain}FormReady,
  {Domain}FieldsMetadata,
  {Domain}FormFields,
} from './use{Domain}Form'
export {
  create{Domain}Schema, // @internal — for SDK use only; do NOT re-export from src/index.ts
  {Domain}ErrorCodes,
  type {Domain}ErrorCode,
  type {Domain}FormData,
  type {Domain}Field,
} from './{camelDomain}Schema'
export type {
  RequiredValidation as {Domain}RequiredValidation,
  // Other validation-type aliases unique to this hook
  // Per-field prop types ({Field}FieldProps)
} from './fields'
```

#### `use{Name}Form.test.tsx`

Cover at minimum: default render, successful create, successful update, validation errors (including 422 fieldErrors mapped to inline errors), conditional field visibility, loading state, query-error state with retry. Use `vi.fn<HttpResponseResolver>()` resolvers, pull MSW handler factories from `src/test/mocks/apis/<resource>.ts` (e.g. `handleGetCompanyFederalTaxes`), entity builders from `src/test/factories/` (e.g. `buildEmployeeWithJobs`), and shared helpers from `src/test/` (`server`, `setupApiTestMocks`, `GustoTestProvider`, `fieldsMetadataEntry`, `getFixture`). See `useEmployeeDetailsForm.test.tsx` and `useJobForm.test.tsx` for the canonical shape, and `CLAUDE.md → Asserting on HTTP requests` for the verb/path/body assertion pattern.

### Step 4: Wire up exports

Add the new hook to barrels in this order:

1. **Hook directory** — `src/components/{Domain}/{Feature}/shared/use{Name}Form/index.ts` re-exports everything from the three implementation files (see template above).
2. **Feature-level barrel** (when a feature has one) — `src/components/{Domain}/{Feature}/index.ts` re-exports from the hook directory if the feature already barrels its hooks.
3. **SDK root barrel** — `src/index.ts` re-exports the public surface partners need:

   ```typescript
   export {
     use{Domain}Form,
     {Domain}ErrorCodes,
   } from '@/components/{Domain}/{Feature}/shared/use{Name}Form'
   export type {
     {Domain}SubmitOptions,
     {Domain}OptionalFieldsToRequire,
     Use{Domain}FormReady,
     {Domain}FieldsMetadata,
     {Domain}FormFields,
     {Domain}ErrorCode,
     {Domain}FormData,
     {Domain}RequiredValidation,
     // ...field-prop types and any extra validation-type aliases
   } from '@/components/{Domain}/{Feature}/shared/use{Name}Form'
   ```

   Public surface checklist: hook function, error-codes constant, ready/result/fields-metadata types, optional-fields-to-require type, every per-field props type, validation-type aliases, and submit-options/callbacks types if defined. Do **not** export the schema factory: `create{Domain}Schema` and `{Domain}SchemaOptions` are `@internal` — exporting them from `src/index.ts` makes api-extractor emit an `ae-internal-missing-underscore` warning, and partners build forms through the hook, not the raw factory. Keep them, along with `buildFormSchema`, `useDeriveFieldsMetadata`, `withOptions`, `composeErrorHandler`, and other SDK-internal utilities, **off** the public barrel — see `.claude/hooks-implementation.md → Exports Checklist`.

### Step 5: Verify

```bash
npx tsc --noEmit                                           # type-check
npm run test -- --run src/components/.../use{Name}Form.test.tsx  # focused tests
npm run test -- --run                                      # full suite
npm run build                                              # regenerates .d.ts — surfaces errors tsc misses
```

The `npm run build` step is critical: TypeScript errors in hook implementations (e.g. missing `validationMessages` keys, mis-typed field generics) often only surface during build, not during unit tests or `tsc --noEmit`.

Hooks must not own translations: do **not** call `useTranslation` or `t()` inside the hook, do not add i18n keys for hook-rendered labels, and do not run `npm run i18n:generate` as part of hook scaffolding. Display labels and option labels are the consuming view's responsibility — partners pass them via `validationMessages` on each field and via `getOptionLabel` on select/radio fields (paired with `withOptions(baseMetadata.field, options, entries)` in the hook so the typed `entries` flow through). Run `npm run i18n:generate` only if you also touched translation keys in a component or an existing `*.json` translation file as part of the same change.

### Step 6: Document the hook

Document the public surface with **inline TSDoc** and let the reference docs autogenerate. Do **not** hand-write a per-hook Markdown page or hand-maintain a hooks index — the partner-facing reference under `docs/reference/**` is generated from the TSDoc, so the inline comments are the single source of truth.

Run `/tsdoc` once the hook compiles and tests pass. It loads `.claude/tsdoc-guides/hooks.md` and writes TSDoc directly onto the exported symbols: `use{Name}Form`, `Use{Domain}FormProps`, the ready/result/outputs types, the `{Domain}ErrorCodes` constant, the `{Domain}FormFields` interface members (the documentation home for each field's behavior), and every field-prop type. Keep the `{Field}Field` components `@internal` with a one-line summary only, and keep `create{Domain}Schema`, `{Domain}SchemaOptions`, and other factory/internal symbols `@internal` (see Step 4) so the generator leaves them out of the reference.

See `.claude/skills/migrate-sdk-component-to-hooks/SKILL.md → 11. Documentation`.
