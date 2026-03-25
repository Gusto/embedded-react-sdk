import { z } from 'zod'
import { resolveRequiredFields, type RequiredFields } from './resolveRequiredFields'
import { requiredIf } from '@/helpers/requiredIf'

interface ComposeFormSchemaOptions<T extends Record<string, z.ZodType>> {
  fieldValidators: T
  fixedFields?: Set<string>
  requiredOnCreate?: Set<string>
  requiredOnUpdate?: Set<string>
  mode: 'create' | 'update'
  requiredFields?: RequiredFields<string>
}

/**
 * Composes a Zod form schema by applying `requiredIf` to configurable fields
 * based on mode and partner-specified required fields.
 *
 * Pattern: define all field validators as if required, then pass them here.
 * Configurable fields get wrapped with `requiredIf` to conditionally accept
 * empty input. Fixed fields (e.g. booleans, always-present controls) pass through as-is.
 *
 * `requiredOnCreate` / `requiredOnUpdate` define mode-specific defaults.
 * `requiredFields` (partner overrides) are additive on top of those defaults.
 *
 * Generic `T` preserves the fieldValidators type so zodResolver can infer
 * the correct form data type without manual casts at the call site.
 */
export function composeFormSchema<T extends Record<string, z.ZodType>>({
  fieldValidators,
  fixedFields = new Set(),
  requiredOnCreate = new Set(),
  requiredOnUpdate = new Set(),
  mode,
  requiredFields,
}: ComposeFormSchemaOptions<T>) {
  const required = new Set(resolveRequiredFields(requiredFields, mode))
  const modeDefaults = mode === 'create' ? requiredOnCreate : requiredOnUpdate

  const shape = Object.fromEntries(
    Object.entries(fieldValidators).map(([key, validator]) => {
      if (fixedFields.has(key)) return [key, validator]

      const isRequired = modeDefaults.has(key) || required.has(key)
      return [key, requiredIf(validator, isRequired)]
    }),
  )

  // Object.fromEntries erases specific field types to Record<string, ZodType>,
  // and requiredIf wraps fields with z.preprocess which makes z.input infer unknown.
  // Cast back to ZodObject<T> so zodResolver infers the correct form data type
  // from the original fieldValidators — consumers don't need per-hook casts.
  return z.object(shape) as unknown as z.ZodObject<T>
}
