import { z, type ZodPipe, type ZodOptional, type ZodObject } from 'zod'

/**
 * Makes a Zod validator conditionally required based on a boolean.
 *
 * When `isRequired` is true, returns the validator as-is (required by Zod's default).
 * When false, wraps it to accept empty strings (converting them to `undefined`)
 * and marks the field as optional.
 *
 * This enables schema composition where consumers can configure which
 * API-optional fields their form requires.
 */
export function requiredIf<T extends z.ZodType<unknown, string>>(
  validator: T,
  isRequired: boolean,
): T | ZodPipe<z.ZodType, ZodOptional<T>> {
  if (isRequired) return validator
  return z
    .string()
    .transform((v: string) => (v ? v : undefined))
    .pipe(validator.optional()) as ZodPipe<z.ZodType, ZodOptional<T>>
}

/**
 * Extracts the keys of configurable (optionally-required) fields from a schema.
 *
 * Fields that go through `requiredIf` produce a union type containing `ZodPipe`
 * in the schema shape, while always-required fields produce plain Zod types.
 * This utility type detects the `ZodPipe` member to identify configurable fields.
 */
export type ExtractConfigurableKeys<T extends ZodObject<z.ZodRawShape>> = {
  [K in keyof T['shape']]: Extract<T['shape'][K], ZodPipe<z.ZodType, ZodOptional>> extends never
    ? never
    : K
}[keyof T['shape']]
