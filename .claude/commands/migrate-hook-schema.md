# Migrate Hook Schema to buildFormSchema

Migrate a form hook from the legacy `composeFormSchema` pattern to the `buildFormSchema` pattern. This gives the hook declarative requiredness rules, reactive metadata via `useDeriveFieldsMetadata`, typed `zodResolver` without casts, and field exclusion support.

## Input

The user provides the hook name (e.g. `useEmployeeDetailsForm`, `useWorkAddressForm`).

## Reference implementations

- **Target pattern (buildFormSchema):** `useCompensationForm` at `src/components/Employee/Compensation/shared/useCompensationForm/`
- **Legacy pattern (composeFormSchema):** hooks that still use `composeFormSchema` / `resolveRequiredFields`

## Migration Steps

### Step 1: Read the current files

Read all files in the hook's folder and its schema file. Also read the reference implementation for comparison:

- `src/components/{Domain}/{Feature}/shared/use{Name}Form/{domain}Schema.ts`
- `src/components/{Domain}/{Feature}/shared/use{Name}Form/use{Name}Form.tsx`
- `src/components/Employee/Compensation/shared/useCompensationForm/compensationSchema.ts` (reference)
- `src/components/Employee/Compensation/shared/useCompensationForm/useCompensationForm.tsx` (reference)
- `src/partner-hook-utils/form/buildFormSchema.ts` (the target API)

### Step 2: Migrate the schema file (`{domain}Schema.ts`)

#### 2a: Update imports

Replace:

```typescript
import { composeFormSchema } from '../../form/composeFormSchema'
import { filterRequiredFields, type RequiredFields } from '../../form/resolveRequiredFields'
```

With:

```typescript
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
```

Also import any preprocessors needed from `@/partner-hook-utils/form/preprocessors` if any fields use `z.preprocess`.

#### 2b: Convert requiredness declarations

Replace `Set`-based declarations with a `requiredFieldsConfig` object using declarative rules.

**Rule mapping:**

| Old pattern                              | New rule                                     | When to use                                                                                                  |
| ---------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Field in `REQUIRED_ON_CREATE` only       | `'create'`                                   | Required on create, optional on update                                                                       |
| Field in `REQUIRED_ON_UPDATE` only       | `'update'`                                   | Required on update, optional on create                                                                       |
| Field in both Sets                       | `'always'`                                   | Always required                                                                                              |
| Field in neither Set                     | `'never'`                                    | Always optional unless partner overrides                                                                     |
| Field in `FIXED_FIELDS`                  | Omit from config                             | Fields without a config entry default to `'always'` — boolean toggles and always-present controls stay as-is |
| Runtime condition (e.g. `hasSsn` filter) | Predicate function `(data, mode) => boolean` | When requiredness depends on form values at runtime                                                          |

**Before:**

```typescript
const FIXED_FIELDS = new Set(['selfOnboarding'])
const REQUIRED_ON_CREATE = new Set<Field>(['firstName', 'lastName'])
const REQUIRED_ON_UPDATE = new Set<Field>([])
```

**After:**

```typescript
const requiredFieldsConfig = {
  firstName: 'create',
  lastName: 'create',
  middleInitial: 'never',
  email: 'never',
  dateOfBirth: 'never',
  ssn: 'never',
} satisfies RequiredFieldConfig<typeof fieldValidators>
```

Fields NOT in `requiredFieldsConfig` (e.g. `selfOnboarding`) default to `'always'` required and pass through unchanged (equivalent to `fixedFields`).

#### 2c: Export the OptionalFieldsToRequire type

This replaces the old `RequiredFields<Field>` partner-facing type:

```typescript
export type {Domain}OptionalFieldsToRequire = OptionalFieldsToRequire<typeof requiredFieldsConfig>
```

#### 2d: Update the schema factory function

**Before:**

```typescript
interface SchemaOptions {
  mode?: 'create' | 'update'
  requiredFields?: RequiredFields<Field>
  hasSsn?: boolean
}

export function createSchema(options: SchemaOptions = {}) {
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
interface SchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: {Domain}OptionalFieldsToRequire
  hasSsn?: boolean  // keep domain-specific options
}

export function createSchema(options: SchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, hasSsn = false } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: ErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    fieldsWithRedactedValues: hasSsn ? ['ssn'] : [],
    superRefine: mode === 'create'
      ? (data, ctx) => { /* cross-field validation... */ }
      : undefined,
  })
}
```

Key changes:

- Factory now returns `[schema, metadataConfig]` tuple (the `BuildFormSchemaResult` type)
- `superRefine` is an option, not chained after
- Fields with redacted server-side values (e.g. SSN when `hasSsn` is true) use `fieldsWithRedactedValues` — this keeps the field in the schema for format validation, skips required validation (value exists server-side), and auto-sets `hasRedactedValue: true` in metadata
- `requiredFields` → `optionalFieldsToRequire` (type-safe: only allows fields that are actually optional in the given mode)
- Use `excludeFields` only when a field should be completely absent from both schema and metadata (e.g. conditionally hidden fields like `startDate`)

### Step 3: Migrate the hook file (`use{Domain}Form.tsx`)

#### 3a: Update imports

Replace:

```typescript
import { deriveFieldsMetadata } from '@/partner-hook-utils/form/deriveFieldsMetadata'
import type { RequiredFields } from '@/partner-hook-utils/form/resolveRequiredFields'
```

With:

```typescript
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
```

Also import `useMemo` from React if not already present.

Update the schema import to include the new `OptionalFieldsToRequire` type.

#### 3b: Update props interface

Replace `requiredFields?: RequiredFields<Field>` with `optionalFieldsToRequire?: {Domain}OptionalFieldsToRequire`.

Update the exported `RequiredFields` type alias to use the new name.

#### 3c: Wrap schema construction in useMemo

**Before:**

```typescript
const schema = createSchema({ mode, requiredFields })
```

**After:**

```typescript
const [schema, metadataConfig] = useMemo(
  () => createSchema({ mode, optionalFieldsToRequire }),
  [mode, optionalFieldsToRequire],
)
```

Include all schema options in the dependency array.

#### 3d: Replace deriveFieldsMetadata with useDeriveFieldsMetadata

**Before:**

```typescript
const baseMetadata = deriveFieldsMetadata(schema)
```

**After:**

```typescript
const fieldsMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
```

This makes metadata reactive — if predicate-based rules exist, metadata updates as the user types (e.g. a field becomes required when a checkbox is toggled).

If the old hook manually patched `hasRedactedValue` onto metadata (e.g. `ssn: { ...baseMetadata.ssn, hasRedactedValue: employee?.hasSsn ?? false }`), remove that patching — `fieldsWithRedactedValues` in the schema factory now auto-populates `hasRedactedValue: true` in metadata.

#### 3e: Remove any zodResolver casts

If the hook has `zodResolver(schema as z.ZodObject) as unknown as Resolver<FormData>`, simplify to `zodResolver(schema)`. The `buildFormSchema` return type carries the correct generics. Remove unused `Resolver` and `z` type imports.

### Step 4: Update exports

Check the barrel files for any exported `RequiredFields` type alias and update to the new `OptionalFieldsToRequire` type:

1. `src/components/{Domain}/{Feature}/shared/use{Name}Form/index.ts`
2. `src/index.ts`

### Step 5: Update tests

- Update test files that construct schemas directly — they now return `[schema, metadataConfig]` tuples
- Update any test that passes `requiredFields` to the hook — rename to `optionalFieldsToRequire`
- Run `npm run test -- --run src/components/{Domain}/{Feature}/shared/use{Name}Form/` to verify

### Step 6: Verify

Run all three checks:

```bash
npx tsc --noEmit                                                           # types
npm run test -- --run                                                      # all tests
npm run build                                                              # full build (catches .d.ts issues)
```

## What NOT to change

- **Field components (`fields.tsx`)** — these are independent of the schema approach
- **Submit handler logic** — unrelated to schema migration
- **Error handling** — `useErrorHandling` pattern stays the same
- **Data fetching** — query setup is unaffected
- **`getFormSubmissionValues`** — still receives `(formMethods, schema)`, works with either approach

## Breaking change notes

The `requiredFields` → `optionalFieldsToRequire` rename is a **partner-facing API change**. If the hook is already published:

1. Check if any partner is using `requiredFields` in `gws-flows`
2. If so, update the gws-flows consumer at the same time
3. Consider a deprecation period: accept both props temporarily with a console warning
