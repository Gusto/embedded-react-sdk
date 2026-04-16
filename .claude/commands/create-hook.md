# Create a New Form Hook

Scaffold a new form hook in the correct feature module location.

## Input

The user provides:

- **Domain**: Employee, Company, Contractor, or Payroll
- **Feature**: The feature name (e.g. Compensation, PaySchedule, DocumentSigner)
- **Hook name**: The hook name without the `use` prefix (e.g. CompensationForm, PayScheduleForm)

## Steps

### Step 1: Determine the target location

Hooks live in their domain's feature module under `shared/`:

```
src/components/{Domain}/{Feature}/shared/use{Name}/
```

Examples:

- `src/components/Employee/Compensation/shared/useCompensationForm/`
- `src/components/Company/PaySchedule/shared/usePayScheduleForm/`

### Step 2: Read reference implementations

Read these files for the canonical patterns:

- `src/components/Employee/Compensation/shared/useCompensationForm/compensationSchema.ts`
- `src/components/Employee/Compensation/shared/useCompensationForm/useCompensationForm.tsx`
- `src/components/Employee/Compensation/shared/useCompensationForm/fields.tsx`
- `src/components/Employee/Compensation/shared/useCompensationForm/index.ts`
- `src/partner-hook-utils/form/buildFormSchema.ts`
- `.claude/hooks-implementation.md`

### Step 3: Create the directory and files

Create the hook directory and generate these files:

#### `{domain}Schema.ts`

Follow the 4-part structure: error codes → field validators → required fields config → schema factory.

```typescript
import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'

export const {Name}ErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const
export type {Name}ErrorCode = (typeof {Name}ErrorCodes)[keyof typeof {Name}ErrorCodes]

const fieldValidators = {
  // Define field validators here
}

export type {Name}FormFields = keyof typeof fieldValidators
export type {Name}FormData = { [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]> }
export type {Name}FormOutputs = {Name}FormData

const requiredFieldsConfig = {
  // Define requiredness rules here
} satisfies RequiredFieldConfig<typeof fieldValidators>

export type {Name}OptionalFieldsToRequire = OptionalFieldsToRequire<typeof requiredFieldsConfig>
export type {Name}FieldsMetadata = // derive from fieldValidators

interface {Name}SchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: {Name}OptionalFieldsToRequire
}

export function create{Name}Schema(options: {Name}SchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: {Name}ErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
  })
}
```

#### `fields.tsx`

Define domain field components wrapping generic HookField components:

```typescript
import { TextInputHookField, type TextInputHookFieldProps } from '@/partner-hook-utils/form/fields/TextInputHookField'
import type { HookFieldProps } from '@/partner-hook-utils/types'

export type {Field}FieldProps = HookFieldProps<TextInputHookFieldProps<{Validation}>>

export function {Field}Field(props: {Field}FieldProps) {
  return <TextInputHookField {...props} name="{fieldName}" />
}
```

#### `use{Name}.tsx`

Follow the main hook pattern: data fetching → form setup → return discriminated union.

Key imports:

- `import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'`
- `import { useErrorHandling } from '@/partner-hook-utils/useErrorHandling'`
- `import type { BaseFormHookReady, FieldsMetadata, HookLoadingResult, HookSubmitResult } from '@/partner-hook-utils/types'`
- `import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'`
- `import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'`

**Typing:** Declare a ready-state interface that extends `BaseFormHookReady<FieldsMetadata, {Name}FormData>`, narrow `data`, `status`, and `actions` as needed, and annotate the hook with `HookLoadingResult | Use{Name}Ready`. Export `Use{Name}Result` as `HookLoadingResult | Use{Name}Ready`. Document-sign hooks always set `status.mode` to `'create'` on the ready branch (see JSDoc on `BaseFormHookReady` in `src/partner-hook-utils/types.ts`). Non-form hooks use `BaseHookReady<TData, TStatus>` instead of `Omit<BaseHookReady, …>`.

#### `index.ts`

Barrel file re-exporting everything from the hook, schema, and fields.

### Step 4: Wire up exports

Add the new hook's exports to `src/index.ts`:

```typescript
export {
  use{Name},
  {Name}ErrorCodes,
  create{Name}Schema,
} from '@/components/{Domain}/{Feature}/shared/use{Name}'
export type {
  // All exported types
} from '@/components/{Domain}/{Feature}/shared/use{Name}'
```

### Step 5: Verify

```bash
npx tsc --noEmit
npm run test -- --run
npm run build
```
