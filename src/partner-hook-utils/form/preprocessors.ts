import { formatDateToStringDate } from '@/helpers/dateFormatting'

/**
 * Builds a `z.preprocess` transform that replaces `null`, `undefined`, and `NaN`
 * numeric input with the provided fallback before validation.
 *
 * @param fallback - Number substituted when the input is missing or `NaN`.
 * @returns A preprocessor that returns `fallback` for empty/`NaN` input and
 *   passes other values through as `number`.
 * @internal
 */
export function coerceNaN(fallback: number) {
  return (val: unknown): number => {
    if (val === undefined || val === null) return fallback
    if (typeof val === 'number' && Number.isNaN(val)) return fallback
    return val as number
  }
}

/**
 * `z.preprocess` transform that normalizes date inputs to an ISO date string
 * (`YYYY-MM-DD`) or `null`.
 *
 * @param val - Raw value from a date picker — a `Date`, ISO string, or empty.
 * @returns The `YYYY-MM-DD` string for a `Date`'s local calendar day, `null`
 *   for empty or unparseable input, or the value cast to `string` otherwise.
 * @internal
 */
export function coerceToISODate(val: unknown): string | null {
  if (val instanceof Date) return formatDateToStringDate(val)
  if (val === null || val === '' || val === undefined) return null
  return val as string
}

/**
 * `z.preprocess` transform that converts the string values produced by radio
 * groups (`'true'` / `'false'`) into booleans.
 *
 * @param val - Raw value from a form control — typically `'true'`, `'false'`,
 *   `boolean`, or `undefined`.
 * @returns `true` for the string `'true'`, `false` for any other string,
 *   or the value passed through unchanged when not a string.
 * @internal
 */
export function coerceStringBoolean(val: unknown): boolean | undefined {
  if (typeof val === 'string') return val === 'true'
  return val as boolean | undefined
}
