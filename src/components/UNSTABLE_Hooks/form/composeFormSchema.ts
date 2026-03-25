import { z } from 'zod'
import { requiredIf } from '@/helpers/requiredIf'

interface ComposeFormSchemaOptions {
  fieldValidators: Record<string, z.ZodType>
  fixedFields?: Set<string>
  requiredOnCreate?: Set<string>
  requiredOnUpdate?: Set<string>
  mode: 'create' | 'update'
  requiredFields?: string[]
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
 */
export function composeFormSchema({
  fieldValidators,
  fixedFields = new Set(),
  requiredOnCreate = new Set(),
  requiredOnUpdate = new Set(),
  mode,
  requiredFields = [],
}: ComposeFormSchemaOptions) {
  const required = new Set(requiredFields)
  const modeDefaults = mode === 'create' ? requiredOnCreate : requiredOnUpdate

  const shape = Object.fromEntries(
    Object.entries(fieldValidators).map(([key, validator]) => {
      if (fixedFields.has(key)) return [key, validator]

      const isRequired = modeDefaults.has(key) || required.has(key)
      return [key, requiredIf(validator, isRequired)]
    }),
  )

  return z.object(shape)
}
