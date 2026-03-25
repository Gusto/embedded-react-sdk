import { z } from 'zod'

/**
 * Makes a Zod validator conditionally required based on a boolean.
 *
 * When `isRequired` is true, returns the validator as-is (required by Zod's default).
 * When false, wraps it with a preprocessor that converts empty strings to `undefined`
 * and marks the field as optional.
 *
 * Uses `z.preprocess` (not `.transform().pipe()`) so the resulting schema
 * remains compatible with `z.toJSONSchema()` for metadata derivation.
 */
export function requiredIf<T extends z.ZodType>(validator: T, isRequired: boolean): T | z.ZodType {
  if (isRequired) return validator
  return z.preprocess(v => (v === '' ? undefined : v), validator.optional())
}
