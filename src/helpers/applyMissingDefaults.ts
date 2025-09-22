/**
 * Applies default values only to properties that are undefined in the source object.
 * This is more efficient than object spread as it only sets values that are actually missing.
 */
export function applyMissingDefaults<T>(rawProps: T, defaults: Partial<T>): T {
  const result = { ...rawProps }

  for (const key in defaults) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((rawProps as any)[key] === undefined && defaults[key] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(result as any)[key] = defaults[key]
    }
  }

  return result
}
