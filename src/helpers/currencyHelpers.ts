/**
 * Converts a dollar amount to whole cents, rounding to the nearest cent.
 *
 * @param dollars - Amount in dollars, or `null` to pass through.
 * @returns The amount in cents, or `null` if the input was `null`.
 * @internal
 */
export const dollarsToCents = (dollars: number | null): number | null => {
  if (dollars === null) return null
  return Math.round(dollars * 100)
}

/**
 * Converts a cents amount to dollars without rounding.
 *
 * @param cents - Amount in cents, or `null` to pass through.
 * @returns The amount in dollars as a floating-point number, or `null` if the input was `null`.
 * @internal
 */
export const centsToDollars = (cents: number | null): number | null => {
  if (cents === null) return null
  return cents / 100
}
