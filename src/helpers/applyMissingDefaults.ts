/**
 * Returns a copy of `rawProps` with `defaults` filled in only where the source value is `undefined`.
 *
 * @remarks Cheaper than `{ ...defaults, ...rawProps }` because it copies the source once and only
 * writes the keys that are actually missing. Properties explicitly set to `null` or `false` are
 * preserved as-is.
 *
 * @typeParam T - Shape of the props object.
 * @param rawProps - Caller-supplied props; values set here always win.
 * @param defaults - Fallback values applied only when the corresponding `rawProps` value is `undefined`.
 * @returns A new object combining `rawProps` with defaults filled in for missing keys.
 * @internal
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
