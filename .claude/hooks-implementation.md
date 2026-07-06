# Implementing Form Hooks

Reference implementations:

- **Schema pattern + configurable required fields**: `useCompensationForm` at `src/components/Employee/Compensation/shared/useCompensationForm/`
- **Standalone form with optional entity ID**: `useWorkAddressForm` at `src/components/Employee/Profile/shared/useWorkAddressForm/`

## File Structure

Each hook lives in its own folder following the feature module pattern: `src/components/{Domain}/{Feature}/shared/use{Name}Form/`

```text
src/components/{Domain}/{Feature}/shared/use{Name}Form/
├── use{Name}Form.tsx        # Main hook: data fetching, form setup, return shape
├── {domain}Schema.ts        # Zod schema, error codes, form data/output types
├── fields.tsx               # Domain field components + exported field prop types
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
import { coerceNaN, coerceStringBoolean, coerceToISODate } from '@/partner-hook-utils/form/preprocessors'

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
/** @internal — useForm's third generic; not part of the public surface (see Exports Checklist). */
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
import { type RequiredFieldConfig } from '@/partner-hook-utils/form/buildFormSchema'

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

**Boolean fields and requiredness**: Boolean fields (`z.boolean()`) are inherently always present — they are either `true` or `false`, so the concept of "required vs optional" does not apply. Do **not** add boolean fields to `requiredFieldsConfig`, `excludeFields`, or gate them with a `with*Field` prop. Omit them from `requiredFieldsConfig` (they default to `'always'`, which is correct for booleans since they always have a value). Always include them in the schema, always render their field component, and always submit their value.

### Part 4: Schema Factory

The factory calls `buildFormSchema` and returns a `[schema, metadataConfig]` tuple. The schema goes to `zodResolver`; `metadataConfig` goes to `useDeriveFieldsMetadata`.

```typescript
import { buildFormSchema, type OptionalFieldsToRequire } from '@/partner-hook-utils/form/buildFormSchema'

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

| Technique                           | When to use                                                           | Example                                                                         | Metadata-aware?                                    |
| ----------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------- |
| `requiredFieldsConfig` rule         | Declarative field-level requiredness                                  | `jobTitle: 'create'`                                                            | Yes                                                |
| `optionalFieldsToRequire` (partner) | Partner promotes optional field to required                           | `{ create: ['jobTitle'] }`                                                      | Yes                                                |
| `excludeFields` (array)             | Field statically absent from schema for a hook configuration          | `excludeFields: ['startDate']`                                                  | Yes (field absent)                                 |
| `excludeFields` (function)          | Field applicability depends on runtime form values (conditional UI)   | `excludeFields: (data, mode) => (data.type === 'Business' ? ['ssn'] : ['ein'])` | Yes (skipped while excluded)                       |
| `fieldsWithRedactedValues`          | Field has a stored server-side value redacted in the API response     | `fieldsWithRedactedValues: ['ssn']`                                             | Yes (`hasRedactedValue: true`, keeps `isRequired`) |
| Predicate rule                      | Requiredness depends on runtime form values                           | `data => data.adjustForMinimumWage`                                             | Yes (via Proxy auto-detection)                     |
| `superRefine`                       | Cross-field validation logic (rate thresholds, cascading constraints) | FLSA + rate + paymentUnit rules                                                 | No — validation only                               |

### Value-aware `excludeFields`

`excludeFields` accepts either form:

- **Array** — `excludeFields: ['startDate']` removes the field from the schema shape at build time. Use it when a field is statically absent for a given hook configuration (e.g. a `withStartDateField` flag).
- **Function** — `excludeFields: (data, mode) => string[]` is evaluated during the required-check pass with the current form values. The named fields stay in the schema shape, but their requiredness checks are skipped whenever the function excludes them. Use it for fields rendered conditionally on a discriminator (individual vs. business contractor, hourly vs. fixed wage, a self-onboarding toggle) so a hidden field never raises a phantom "required" error.

The function form keeps requiredness **static and promotable**: `requiredFieldsConfig` and the partner's `optionalFieldsToRequire` still decide whether an _applicable_ field is required, while `excludeFields` only gates _applicability_. Build the schema once (no need to rebuild it per keystroke), and drive the component's render-gating from the same discriminators the function reads — the hook watches them with `useWatch` — so the UI and validation always agree on which fields are live. See `createContractorDetailsSchema` / `useContractorDetailsForm` for the canonical example.

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
- The `*Field` components are `@internal` — partners reach them only via `form.Fields`, and they are **not** exported from `src/index.ts` (only their `*FieldProps` types are public). Tag each with a bare `/** @internal */` — no summary, no `@remarks`. Each field's partner-facing behavior is documented on the public `{Domain}FormFields` member instead (see "Return Shape" below and `.claude/tsdoc-guides/hooks.md`).

```typescript
// Derive validation types from the error codes constant — not hardcoded strings
export type RequiredValidation = typeof ErrorCodes.REQUIRED
export type RateValidation = (typeof ErrorCodes)['REQUIRED' | 'RATE_MINIMUM' | 'RATE_EXEMPT_THRESHOLD']

// Field prop types strip `name` via HookFieldProps, parameterized by the relevant validation type
export type JobTitleFieldProps = HookFieldProps<TextInputHookFieldProps<RequiredValidation>>
export type RateFieldProps = HookFieldProps<NumberInputHookFieldProps<RateValidation>>

/** @internal */
export function JobTitleField(props: JobTitleFieldProps) {
  return <TextInputHookField {...props} name="jobTitle" />
}
```

## 3. Main Hook (`use{Domain}Form.tsx`)

### Data Fetching

- Use `@gusto/embedded-api/react-query/*` hooks for all API calls
- Gate dependent queries with `enabled: !!dependency`
- Use `composeErrorHandler` to build the `errorHandling` bag (see Error Handling section below)

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

**Type the `defaultValues` prop as the form-data shape, never as a `Pick` of the API entity.** Partner pre-fill is form input, so it should be `Partial<{Domain}FormData>` (every field a plain `string`/`number`/etc.), the same type the schema produces. API entity types (`@gusto/embedded-api-v-2025-11-15/models/components/*`) declare nullable fields as `string | null | undefined`; if the prop is a `Pick` of one of those, `null` leaks into the partner-facing type and forces a `?? undefined` mapping at every call site. The form-data type carries no `null`, so the component passes `defaultValues` straight through.

`null`-normalization belongs in **one place only — `resolvedDefaults` inside the hook** — where you read the server entity. `?? partnerDefaults?.field ?? ''` already coalesces `null` from both sources, so no caller ever needs to normalize. `useContractorProfile` (`defaultValues?: Partial<ContractorProfileFormData>`, with `existingContractor.firstName || undefined` internally) is the reference.

```typescript
// Good — form-shaped, no null
defaultValues?: Partial<{Domain}FormData>

// Bad — drags `string | null` into the partner type and forces call-site mapping
defaultValues?: Pick<{Entity}, 'street1' | 'city' | 'state' | 'zip'>
```

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
- Override `isRequired`/`isDisabled` with `withFlags(baseMetadata.field, { isDisabled })` — see the typing pattern below

`form.fieldsMetadata` carries one entry per form field: a `FieldMetadata`, or a
`FieldMetadataWithOptions<TEntry>` for select/radio fields. Type it **precisely,
per field**, by inferring the type from the object the hook builds — not as the
generic `FieldsMetadata` index signature.

**Pattern — use for every hook whose field-key set is static (known at build time):**

1. Extract the metadata construction into a module-level **pure** builder
   `build{Domain}FieldsMetadata`. It takes `baseMetadata`
   (`Record<keyof {Domain}FormData, FieldMetadata>`) plus any presentation flags
   it closes over, and returns the assembled object closed with
   `} satisfies FieldsMetadata`:

   ```ts
   function build{Domain}FieldsMetadata(
     base: Record<keyof {Domain}FormData, FieldMetadata>,
     { showFoo }: { showFoo: boolean },
   ) {
     return {
       name: base.name,
       // withFlags preserves the FieldMetadata type through a flag override. A
       // bare `{ ...base.foo, isDisabled }` spread widens to an anonymous object
       // and loses the FieldMetadata name — which sprawls into an 8-row inline
       // object in the generated reference instead of a single `FieldMetadata`.
       foo: withFlags(base.foo, { isDisabled: !showFoo }),
       // withOptions marks a select/radio field → FieldMetadataWithOptions<TEntry>.
       kind: withOptions<Kind>(base.kind, kindOptions, KINDS),
     } satisfies FieldsMetadata
   }
   ```

2. Infer the public alias from the builder — never hand-write the shape, never
   index back through the ready interface:

   ```ts
   export type {Domain}FieldsMetadata = ReturnType<typeof build{Domain}FieldsMetadata>
   ```

3. Pass that alias as the **first** `BaseFormHookReady` type argument:

   ```ts
   export interface Use{Domain}FormReady extends BaseFormHookReady<
     {Domain}FieldsMetadata,
     {Domain}FormData,
     {Domain}FormFields
   > { ... }
   ```

4. In the hook body, call the builder (import `FieldMetadata` for the param type
   and `withFlags` from `@/partner-hook-utils/form/withFlags`):

   ```ts
   const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
   const fieldsMetadata = build{Domain}FieldsMetadata(baseMetadata, { showFoo })
   ```

   If the hook already wraps metadata in `useMemo` (e.g. redaction-dependent),
   keep the `useMemo` and call the builder inside its callback. React hooks stay
   in the hook body; only the pure object construction moves out — nothing breaks
   because the builder closes over already-computed values passed as arguments.

   Keep every key **unconditionally present** — push any condition onto the
   field's _value_, not its presence. A conditional-spread key
   (`...(cond ? { ssn: X } : {})`) makes the inferred type lopsided; instead write
   `ssn: withFlags(base.ssn, cond ? { placeholder } : {})` so `ssn` is always a
   `FieldMetadata`. (`useContractorSignatureForm` needs this normalization.) A hook
   whose _key set_ genuinely varies by branch or is minted at runtime uses a
   different shape — see "Choosing the metadata type by key structure" below.

**Why this shape.** Inferring the type from a constant is the same move as
`type {Domain}FormData = z.infer<typeof fieldValidators>`: the type tracks the
value with zero drift, and the compiler rejects a builder that adds/removes a
field or flips a field's options-ness. It is the **only** way to get per-field
precision — whether a field carries `options` is a rendering decision the hook
makes (two `boolean` fields can differ: a radio has options, a checkbox does
not), so it can't be derived from `{Domain}FormData`. The precise type drives the
generated reference: `form.fieldsMetadata` renders as a single link to a
per-field `{Domain}FieldsMetadata` table showing each field's variant, instead of
an opaque index signature. (SDK-1073.)

**Choosing the metadata type by key structure.** The builder-inferred object
above is the default, but the right shape depends on whether the key universe is
finite and known at build time. The deciding question is **"is the universe of
keys finite and known at build time?"** — _not_ "do the keys vary." All four
tiers are now in use; **no hook remains on the bare generic `FieldsMetadata`** —
every hook names its metadata type.

| Key structure                                                                                                       | Type shape                                                                                                                                                                  | Example                             |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Static, finite** — every key known at build time                                                                  | Builder-inferred object: `ReturnType<typeof build{Domain}FieldsMetadata>` (the pattern above)                                                                               | most hooks (`useJobForm`, …)        |
| **Branch-varying, finite** — fixed universe of keys, but which subset is present depends on a runtime discriminator | **Discriminated union** of fixed object variants; partners narrow with an `in` check                                                                                        | `useSignEmployeeForm` (I-9 vs. not) |
| **Static core + runtime-minted tail** — some named keys always present, plus dynamic dotted paths                   | Named core object **intersected** with a template-literal `Record`: ``{ splitBy: … } & Record<`splitAmount.${string}`, FieldMetadata>``                                     | `useSplitPaymentsForm`              |
| **Fully runtime-minted keys** — no key knowable at build time (UUIDs, API-driven names)                             | Template-literal index signature: ``Record<`states.${string}.${string}`, FieldMetadata \| FieldMetadataWithOptions>``; cast the derived metadata to it at the hook boundary | `useEmployeeStateTaxesForm`         |

`useSignEmployeeForm`'s keys _vary_ (I-9 adds preparer fields) but the universe is
fixed and enumerable → union. `useEmployeeStateTaxesForm`'s keys are _minted from
runtime data_ (API question keys) → irreducible index signature. Same "varies at
runtime" symptom, opposite answer — the universe-finiteness is what decides.

**Rules that fell out of the rollout (violate these and it silently breaks):**

- **A base/variant metadata alias must be a `type`, not an `interface`.**
  `FieldsMetadata` is an index-signature type (`{ [k: string]: … }`), and
  TypeScript won't give an `interface` an implicit index signature (interfaces are
  open to merging), so an `interface` fails the `BaseFormHookReady<…>` constraint.
  Type-literal aliases satisfy it.
- **Reference exported named types inside template-literal / union metadata types
  — never inline `(typeof CONST)[number]` for an unexported const.** API Extractor
  flags the const as `ae-forgotten-export`. `useEmployeeStateTaxesForm` uses the
  public `StateAbbreviation` (from `@/shared/constants`), `useSplitPaymentsForm`
  uses `SplitByValue`; export a named type if you need one.
- **Give each key exactly one type.** When overriding select/radio entries on a
  `Record<keyof {Domain}FormData, FieldMetadata>` base, `Omit` the option keys and
  redeclare them explicitly — `Omit<Record<keyof {Domain}FormData, FieldMetadata>, 'kind'> & { kind: FieldMetadataWithOptions<Kind> }` — so a key renders as one
  clean type, not `FieldMetadata & FieldMetadataWithOptions`.
- **`@interface` tag:** put it on object-shaped aliases (union variants,
  static-core intersections) so TypeDoc renders a Properties table. **Omit** it on
  a pure index-signature `Record` alias — that renders cleanly as `= Record<…>`
  with linked value types, whereas `@interface` gives a near-empty "Indexable"
  block.

**Supporting infrastructure — already built, do not rebuild:**

- `withFlags(base, flags)` — `src/partner-hook-utils/form/withFlags.ts`. Merges
  flags while preserving the `FieldMetadata` type. `@internal`, not on the public
  barrel.
- `build/expandDtsTypeof.ts` resolves `ReturnType<typeof build{Domain}FieldsMetadata>`
  in the emitted `.d.ts` to the concrete object type and removes the orphaned
  unexported `declare function`, so API Extractor emits no `ae-forgotten-export`
  for the builder.
- `renderFieldsMetadataAlias` in `docs-site/plugins/typedoc-custom/theme.ts`
  collapses the expanded ready-state rows into a single link and renders the
  `### {Domain}FieldsMetadata` section as the per-field table. For a pure
  index-signature alias (no per-field rows to collapse) it just links the
  `form.fieldsMetadata` row to the alias section — otherwise TypeDoc leaves it as
  the unresolved `TFieldsMetadata` type parameter. `expandDtsTypeof` applies only
  to the `ReturnType<typeof build…>` (static-object) tier.

**Adding a new hook (the rollout is complete).** All 20 form hooks name their
metadata type; none remain on the bare generic `FieldsMetadata`. List them with
`grep -rln "export type [A-Za-z]*FieldsMetadata" src/components`. For a new hook,
pick the tier from the table above by key structure, then verify:

```bash
npx tsc --noEmit
npm run test -- --run <path>/use{Name}Form.test.tsx     # then the full suite
npm run docs:api:generate                                # form.fieldsMetadata is a
                                                         # single link to the named
                                                         # {Domain}FieldsMetadata alias
                                                         # (never the raw
                                                         # `TFieldsMetadata` — if you
                                                         # see that, the theme fix or
                                                         # alias section is missing)
npm run build && npm run api-report:derive               # ae-forgotten-export count
                                                         # unchanged (currently 19);
                                                         # no build{Domain}FieldsMetadata
                                                         # symbol leaks (static tier)
```

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

Use **`composeErrorHandler`** (not a React hook — same `compose` prefix as **`composeSubmitHandler`**) to build the `errorHandling` bag from queries and submit state.

```typescript
const {
  baseSubmitHandler,
  error: submitError,
  setError: setSubmitError,
} = useBaseSubmit('{Domain}Form')

const queries = [queryA, queryB, queryC]
const errorHandling = composeErrorHandler(queries, { submitError, setSubmitError })
```

You can pass **nested SDK hook results** (objects with `errorHandling`) plus extra React Query results in the first array — see `composeErrorHandler` in `src/partner-hook-utils/composeErrorHandler.ts`.

**Multi-form screens:** `composeSubmitHandler` coordinates validation + ordered submits **and** returns `{ handleSubmit, errorHandling }` aggregated across the forms it receives. Partners that want to combine in extra `@gusto/embedded-api` queries or screen-level submit state feed the result into **`composeErrorHandler([submitResult, ...extraQueries], optionalScreenSubmit)`**.

`composeErrorHandler` returns `HookErrorHandling`:

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
  data: {/* domain entities */},
  status: { isPending, mode: isCreateMode ? 'create' : 'update' },
  actions: { onSubmit },
  errorHandling,
  form: {
    Fields: {/* field components, some possibly undefined */},
    fieldsMetadata,
    hookFormInternals: { formMethods },
  },
}
```

Declare `form.Fields` against a dedicated `@public` `{Domain}FormFields` interface and type each member as `ComponentType<{Field}FieldProps>` (use `ComponentType<{Field}FieldProps> | undefined` for conditionally rendered fields). Do **not** type members as `typeof {Field}Field` — that would make the public interface reference the `@internal` field component. This interface is the documentation home for each field's partner-facing behavior (validation pattern, available options/defaults, value masking, whether `getOptionLabel` translates labels), since the `*Field` components themselves carry only `/** @internal */`. `useContractorBankAccountForm` / `useContractorPaymentMethodForm` are the reference examples.

### Submit Handler

- Use `formMethods.handleSubmit` inside a `Promise` wrapper so `onSubmit` is async/awaitable
- Delegate to `baseSubmitHandler` for error boundary integration
- Return `HookSubmitResult<TEntity>` where `TEntity` is the primary domain entity the form manages (e.g. `Compensation`). The result already carries `mode` and `data`, so partners read it directly
- Default to `onSubmit(options?)` — a single options argument. Do **not** add a `*SubmitCallbacks` parameter when the hook performs a single mutation per submit (including create-or-update routing where exactly one of the two fires). Partners read `result.data` and either branch on `result.mode` or emit `onEvent` from the awaited return value
- The narrow exception is hooks that chain **multiple sequential API calls inside a single submit** (e.g. `useEmployeeDetailsForm` runs `updateEmployee` + `updateOnboardingStatus` together). Only those benefit from intermediate-step callbacks, because the final return value can't surface the per-step results. For chained submits across separate hook instances, use `composeSubmitHandler` instead of per-hook callbacks

## 4. Prebuilt Component (Removed)

Prebuilt `{Domain}Form` components were removed. Partners use the hooks directly to build custom form UI (with `SDKFormProvider`, field components, and i18n as needed for their integration).

## 4a. SDKFormProvider and formHookResult Prop

Hook fields need form context. Two ways to provide it:

**`SDKFormProvider`** — wraps a contiguous group of fields from one hook. Provides `FormProvider` + `FormFieldsMetadataProvider` context and syncs API field errors via `useSyncFieldErrors`.

**`formHookResult` prop** — pass the hook result directly to each field. Use when fields are scattered across the layout. `FormHookResult` types `control` as `unknown` so any hook result is assignable without casts or generics; `useHookFieldResolution` handles the single `as Control` cast internally.

**Rules:**

1. Do NOT nest `SDKFormProvider`s — use sibling providers for different hooks
2. Do NOT use `SDKFormProvider` and `formHookResult` prop for the same hook result — pick one approach per hook
3. Do NOT render fields from a different hook inside an `SDKFormProvider`

When a hook's fields are split across the layout, use `formHookResult` prop on all of that hook's fields instead of `SDKFormProvider`.

## 5. FieldComponent Pattern

Partners can inject custom UI via `FieldComponent` prop on any field:

- `FieldComponent` is typed with UI-level props (`TextInputProps`, `SelectProps`, etc.) — NOT internal field props
- The `*HookField` resolves metadata/errors and renders the SDK's `*Field` component
- The `*Field` component handles react-hook-form via `useField` and renders `FieldComponent ?? Components.Default`
- Partners never need react-hook-form knowledge; they receive `value`, `onChange`, `onBlur`, etc.

## 6. Exports Checklist

Wire through two barrel levels in order:

1. `src/components/{Domain}/{Feature}/shared/use{Name}Form/index.ts` — re-export everything from the hook folder
2. `src/index.ts` — main package entry, re-export from the hook barrel as needed

### What partners actually need (keep the public surface minimal)

Reference `gws-flows/app/frontend/react_sdk/CustomCompensationForm.tsx` as the real-world partner usage. A partner building a custom form imports only:

| Category           | Examples                                                     | Why                                                                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hook               | `useCompensationForm`                                        | Core entry point for partners                                                                                                                                                                                        |
| Prebuilt component | _(removed)_                                                  | Partners build UI with the hook; there is no bundled prebuilt form component                                                                                                                                         |
| Form provider      | `SDKFormProvider`                                            | Wraps custom form for metadata + error syncing                                                                                                                                                                       |
| Domain types       | `UseCompensationFormReady`, `CompensationSubmitOptions`      | Type-narrowing ready state and submit options. Only export a `*SubmitCallbacks` type when the hook actually accepts callbacks (multi-API-call hooks like `useEmployeeDetailsForm`); single-mutation hooks should not |
| Field prop types   | `FlsaStatusFieldProps`, `PaymentUnitFieldProps`, etc.        | Typing `getOptionLabel` callbacks — lets partners derive API entity types without us exporting them                                                                                                                  |
| Validation types   | `ValidationMessages`, `RateValidation`, `RequiredValidation` | Typing `validationMessages` props                                                                                                                                                                                    |
| UI prop types      | `TextInputProps`, `SelectProps`, etc.                        | Typing custom `FieldComponent` implementations                                                                                                                                                                       |

### What stays internal (export from inner barrels but NOT from `src/index.ts` unless needed)

Infrastructure utilities like `buildFormSchema`, `useDeriveFieldsMetadata`, `deriveFieldsMetadata`, `withOptions`, `FormFieldsMetadataProvider`, `composeErrorHandler`, `collectErrors`, generic `*HookField` components, and base types like `HookFormInternals`, `BaseFormHookReady` are used by the SDK to build hooks — not by partners. Only promote to the public barrel if a partner use case demands it.

The domain `*Field` components (`JobTitleField`, `NameField`, etc.) are also `@internal` and stay off `src/index.ts` — partners reach them via `form.Fields`, never by importing the function. Export only their `*FieldProps` types (partners need those to type `getOptionLabel` / `validationMessages`). Each `*Field` carries a bare `/** @internal */`; its partner-facing behavior is documented on the public `{Domain}FormFields` member instead.

The schema factory `create{Domain}Schema` and its `{Domain}SchemaOptions` are also `@internal`. The inner hook barrel may re-export them for SDK use, but **do not** add them to `src/index.ts`: they are tagged `@internal`, so api-extractor emits an `ae-internal-missing-underscore` warning when they appear on the public entry point. Partners build forms through the hook, not the raw factory — `{Domain}FormData` covers the type they actually need.

`{Domain}FormOutputs` is `@internal` too. It's the resolver-output type (useForm's third generic), an internal seam between the form's input and parsed-output shapes that coincide today (`{Domain}FormOutputs = {Domain}FormData`). Keep it defined for the hook's `useForm` generic, but don't export it from `src/index.ts`: partners type `defaultValues` against `{Domain}FormData` and read parsed values from `form.getFormSubmissionValues` (typed as the form-data shape), so the seam stays ours.

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

The `gws-flows` repo has side-by-side comparison pages that render the stable component and a custom partner-built form using the same hook — all against the same employee data. These are the primary tool for verifying parity.

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
- Always run `npm run build` before considering a PR ready — TypeScript errors in hook implementations (e.g. missing `validationMessages` keys) only surface during build, not in unit tests
