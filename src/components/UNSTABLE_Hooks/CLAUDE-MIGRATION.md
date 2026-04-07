# Migrating Hook Schemas to `buildFormSchema`

This guide covers migrating existing UNSTABLE_Hooks form schemas from the legacy `composeFormSchema` + `deriveFieldsMetadata` pattern to the unified `buildFormSchema` + `useDeriveFieldsMetadata` pattern established in `useCompensationForm`.

## Reference Implementation

The completed migration: `src/components/UNSTABLE_Hooks/hooks/useCompensationForm/compensationSchema.ts`

## Hooks to Migrate

| Hook                     | Schema file                | Complexity | Notes                                                                        |
| ------------------------ | -------------------------- | ---------- | ---------------------------------------------------------------------------- |
| `useEmployeeDetailsForm` | `employeeDetailsSchema.ts` | Medium     | Has `fixedFields`, `superRefine`, `hasSsn` filtering, `deriveFieldsMetadata` |
| `useWorkAddressForm`     | `workAddressSchema.ts`     | Low        | Simple schema, `deriveFieldsMetadata`, field filtering                       |

## Migration Steps

### Step 1: Convert `requiredOnCreate` / `requiredOnUpdate` / `fixedFields` → `requiredFieldsConfig`

The legacy pattern uses `Set` objects for `requiredOnCreate`, `requiredOnUpdate`, and `fixedFields`. The new pattern uses a single `requiredFieldsConfig` object with per-field rules.

**Mapping rules:**

| Legacy pattern                               | `requiredFieldsConfig` rule                         |
| -------------------------------------------- | --------------------------------------------------- |
| In `requiredOnCreate` AND `requiredOnUpdate` | `'always'` (or omit — fields default to `'always'`) |
| In `requiredOnCreate` only                   | `'create'`                                          |
| In `requiredOnUpdate` only                   | `'update'`                                          |
| In neither set (partner-configurable only)   | `'never'`                                           |
| In `fixedFields` (e.g. boolean toggles)      | Omit from config — defaults to `'always'`           |
| Conditionally required based on form data    | `(data, mode) => boolean` predicate                 |

**Before (employeeDetailsSchema.ts):**

```typescript
const FIXED_FIELDS = new Set(['selfOnboarding'])
const REQUIRED_ON_CREATE = new Set<EmployeeDetailsField>(['firstName', 'lastName'])
// No REQUIRED_ON_UPDATE — implicitly empty
```

**After:**

```typescript
const requiredFieldsConfig = {
  firstName: 'create',
  lastName: 'create',
  // selfOnboarding: omitted → defaults to 'always'
  // middleInitial, email, dateOfBirth, ssn: omitted → defaults to 'always'
} satisfies RequiredFieldConfig<typeof fieldValidators>
```

Wait — `middleInitial`, `email`, `dateOfBirth`, and `ssn` are NOT in either required set in the legacy code. That means they're optional unless the partner adds them via `requiredFields`. This maps to `'never'`:

```typescript
const requiredFieldsConfig = {
  firstName: 'create',
  lastName: 'create',
  middleInitial: 'never',
  email: 'never',
  dateOfBirth: 'never',
  ssn: 'never',
  // selfOnboarding: omitted → defaults to 'always'
} satisfies RequiredFieldConfig<typeof fieldValidators>
```

**Before (workAddressSchema.ts):**

```typescript
const REQUIRED_ON_CREATE = new Set<WorkAddressField>(['locationUuid'])
const REQUIRED_ON_UPDATE = new Set<WorkAddressField>(['locationUuid'])
```

**After:**

```typescript
const requiredFieldsConfig = {
  // locationUuid: omitted → defaults to 'always' (required in both modes)
  effectiveDate: 'never', // optional unless partner requires it
} satisfies RequiredFieldConfig<typeof fieldValidators>
```

### Step 2: Replace `composeFormSchema` call → `buildFormSchema`

**Before:**

```typescript
import { composeFormSchema } from '../../form/composeFormSchema'
import { filterRequiredFields, type RequiredFields } from '../../form/resolveRequiredFields'

export function createEmployeeDetailsSchema(options = {}) {
  const { mode = 'create', requiredFields, hasSsn = false } = options

  const effectiveRequiredFields = hasSsn
    ? filterRequiredFields(requiredFields, 'ssn')
    : requiredFields

  const baseSchema = composeFormSchema({
    fieldValidators,
    fixedFields: FIXED_FIELDS,
    requiredOnCreate: REQUIRED_ON_CREATE,
    mode,
    requiredFields: effectiveRequiredFields,
  })

  if (mode === 'create') {
    return baseSchema.superRefine((data, ctx) => {
      /* ... */
    })
  }
  return baseSchema
}
```

**After:**

```typescript
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '../../form/buildFormSchema'

export type EmployeeDetailsOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

interface EmployeeDetailsSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: EmployeeDetailsOptionalFieldsToRequire
  hasSsn?: boolean
}

export function createEmployeeDetailsSchema(options: EmployeeDetailsSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, hasSsn = false } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: EmployeeDetailsErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    excludeFields: hasSsn ? ['ssn'] : [],
    superRefine: mode === 'create' ? validateSelfOnboardingEmail : undefined,
  })
}

function validateSelfOnboardingEmail(data: EmployeeDetailsFormData, ctx: z.RefinementCtx) {
  if (data.selfOnboarding && (!data.email || data.email.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['email'],
      message: EmployeeDetailsErrorCodes.EMAIL_REQUIRED_FOR_SELF_ONBOARDING,
    })
  }
}
```

Key changes:

- `composeFormSchema` → `buildFormSchema`
- `requiredOnCreate` / `requiredOnUpdate` / `fixedFields` → `requiredFieldsConfig`
- `requiredFields` (partner `string[]`) → `optionalFieldsToRequire` (typed `{ create?: [...], update?: [...] }`)
- `filterRequiredFields(requiredFields, 'ssn')` → `excludeFields: hasSsn ? ['ssn'] : []`
- Inline `superRefine` → extracted named function passed via options
- Return type is now `[schema, metadataConfig]` tuple

### Step 3: Replace `requiredFields` prop → `optionalFieldsToRequire` in hook

**Before (in use{Domain}Form.tsx):**

```typescript
interface UseEmployeeDetailsFormProps {
  requiredFields?: RequiredFields<EmployeeDetailsField>
}

// Inside hook:
const modeRequiredFields = resolveRequiredFields(requiredFields, mode)
const schema = createEmployeeDetailsSchema({ mode, requiredFields: modeRequiredFields, hasSsn })
```

**After:**

```typescript
interface UseEmployeeDetailsFormProps {
  optionalFieldsToRequire?: EmployeeDetailsOptionalFieldsToRequire
}

// Inside hook:
const [schema, metadataConfig] = useMemo(
  () => createEmployeeDetailsSchema({ mode, optionalFieldsToRequire, hasSsn }),
  [mode, optionalFieldsToRequire, hasSsn],
)
```

### Step 4: Replace `deriveFieldsMetadata` → `useDeriveFieldsMetadata`

**Before:**

```typescript
import { deriveFieldsMetadata } from '../../form/deriveFieldsMetadata'

const baseMetadata = deriveFieldsMetadata(schema) as Record<keyof FormData, FieldMetadata>
```

**After:**

```typescript
import { useDeriveFieldsMetadata } from '../../form/useDeriveFieldsMetadata'

const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
```

Key differences:

- `deriveFieldsMetadata` is a pure function that uses `z.toJSONSchema()` — static, doesn't react to form values
- `useDeriveFieldsMetadata` is a React hook that uses `useWatch` on predicate dependencies — reactive, updates `isRequired` when watched values change
- No JSON Schema compatibility constraints — `buildFormSchema` tracks requiredness directly
- No type casting needed — generics flow through

### Step 5: Update partner-facing prop types

**Before:**

```typescript
// Partner sees:
requiredFields?: EmployeeDetailsField[] | { create?: EmployeeDetailsField[]; update?: EmployeeDetailsField[] }
```

**After:**

```typescript
// Partner sees:
optionalFieldsToRequire?: {
  create?: Array<'middleInitial' | 'email' | 'dateOfBirth' | 'ssn' | ...>
  update?: Array<'firstName' | 'lastName' | 'middleInitial' | 'email' | ...>
}
```

The new type is more precise — it only offers fields that are actually optional in the given mode, derived from `requiredFieldsConfig`. Partners can't accidentally "require" a field that's already always required.

### Step 6: Update tests

- Destructure tuple: `const { schema }` → `const [schema]` or `const [schema, { getFieldsMetadata }]`
- Update metadata assertions if they relied on `deriveFieldsMetadata` output
- Add `optionalFieldsToRequire` test cases to verify partner override typing

### Step 7: Update prebuilt component

If the prebuilt component previously set internal `requiredFields` (e.g. `EmployeeDetailsForm` passing `requiredFields: { update: ['ssn'] }` when `!hasSsn`), convert to `optionalFieldsToRequire`:

**Before:**

```typescript
const compensation = useCompensationForm({
  ...hookProps,
  requiredFields: { update: ['ssn'] },
})
```

**After:**

```typescript
const compensation = useCompensationForm({
  ...hookProps,
  optionalFieldsToRequire: { update: ['ssn'] },
})
```

### Step 8: Clean up unused imports

After migration, these imports/utilities may no longer be needed in the schema file:

- `composeFormSchema` from `../../form/composeFormSchema`
- `filterRequiredFields`, `resolveRequiredFields`, `type RequiredFields` from `../../form/resolveRequiredFields`
- `requiredIf` from `@/helpers/requiredIf`

Do NOT delete `composeFormSchema.ts`, `resolveRequiredFields.ts`, or `deriveFieldsMetadata.ts` until **all** hooks have been migrated. They remain in the barrel export for any hooks still using the legacy pattern.

## `hasSsn` Filtering → `excludeFields`

The legacy `filterRequiredFields(requiredFields, 'ssn')` removes `ssn` from the partner's required field list when the employee already has an SSN on file. With `buildFormSchema`, use `excludeFields` instead — this removes the field from the schema entirely, which is a stronger guarantee (no validation, no metadata).

If the field should still exist in the schema but just not be required, keep it in the schema and don't list it in `optionalFieldsToRequire`. The `hasSsn` case is a true exclusion (the field shouldn't render at all), so `excludeFields` is appropriate.

## Predicate Rules: Runtime Coercion Awareness

When a predicate reads a form value that comes from a radio group or other string-delivering input, the runtime value may be a string even though the Zod validator coerces it to boolean. Predicates run inside `superRefine` which executes **after** `z.preprocess` on individual fields, so the value should be coerced. However, `getFieldsMetadata` receives raw `useWatch` values which are pre-coercion. Defend against this:

```typescript
// Defensive: handles both boolean true and string 'true'
stateWcClassCode: data => String(data.stateWcCovered) === 'true',
```

## Validation: Keeping Parity with Stable Components

Each migrated hook should maintain a parity test file (`{domain}SchemaParity.test.ts`) that validates the hook schema against the corresponding stable component schema. See `compensationSchemaParity.test.ts` for the pattern.
