/**
 * Parses a wire-format pay rate into a number for display.
 *
 * @remarks
 * `Job.rate` and `Compensation.rate` are both optional decimal strings. Anything
 * that is not a finite number — absent, empty, or unparseable — resolves to
 * `null` so callers can render their own placeholder rather than a misleading
 * `0`. Use this instead of `Number(rate)`, which turns `''` into `0` and would
 * display an empty rate as a real one.
 *
 * @param rate - The rate string as returned by the API.
 * @returns The rate as a number, or `null` when there is no usable value.
 * @internal
 */
export function parseRate(rate: string | undefined): number | null {
  if (rate === undefined) return null
  const numericRate = parseFloat(rate)
  return Number.isFinite(numericRate) ? numericRate : null
}
