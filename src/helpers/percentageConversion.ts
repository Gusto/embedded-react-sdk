const PRECISION_DIGITS = 12

function toCleanNumber(value: number): number {
  return parseFloat(value.toPrecision(PRECISION_DIGITS))
}

/**
 * Converts a decimal value into its percentage equivalent.
 *
 * @remarks
 * Multiplies by 100 and rounds to 12 significant digits to avoid floating-point artifacts.
 * Returns `undefined` for `null`, `undefined`, empty strings, booleans, or values that cannot
 * be parsed as numbers, making it safe to call on raw form input.
 *
 * @param value - The decimal value to convert; strings are parsed as floats
 * @returns The percentage (e.g. `0.0625` becomes `6.25`), or `undefined` when the input is not a usable number
 * @internal
 */
export function decimalToPercent(
  value: string | number | boolean | null | undefined,
): number | undefined {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') {
    return undefined
  }

  const numValue = typeof value === 'number' ? value : parseFloat(value)

  if (isNaN(numValue)) {
    return undefined
  }

  return toCleanNumber(numValue * 100)
}

/**
 * Converts a percentage value into its decimal equivalent serialized as a string.
 *
 * @remarks
 * Divides by 100 and rounds to 12 significant digits to avoid floating-point artifacts.
 * If `value` cannot be parsed as a number, it is returned as-is via `String(value)` so that
 * partially-typed form input is preserved.
 *
 * @param value - The percentage value to convert; strings are parsed as floats
 * @returns The decimal value as a string (e.g. `6.25` becomes `"0.0625"`)
 * @internal
 */
export function percentToDecimal(value: number | string): string {
  const numValue = typeof value === 'number' ? value : parseFloat(value)

  if (isNaN(numValue)) {
    return String(value)
  }

  return String(toCleanNumber(numValue / 100))
}

/**
 * Formats a decimal value as a localized percentage string with a trailing `%`.
 *
 * @remarks
 * Uses `Intl.NumberFormat` with 1 to 4 fractional digits. If `decimalValue` cannot be converted
 * to a percentage via {@link decimalToPercent}, the original string is returned unchanged.
 *
 * @param decimalValue - The decimal value to format, as a string
 * @param locale - BCP 47 locale tag passed to `Intl.NumberFormat`. Defaults to `'en-US'`.
 * @returns The localized percentage string, or `decimalValue` when it cannot be parsed
 * @internal
 */
export function formatPercentLabel(decimalValue: string, locale = 'en-US'): string {
  const percent = decimalToPercent(decimalValue)
  if (percent === undefined) return decimalValue

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 4,
  }).format(percent)

  return `${formatted}%`
}
