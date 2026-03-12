/**
 * Runtime assertion that narrows form data fields to non-nullable
 * after Zod validation has confirmed they are present.
 *
 * Use in the create branch of submit handlers where `requiredIf`
 * makes the static type `T | undefined`, but validation guarantees
 * the value exists for create mode.
 */
export function assertRequiredFields<T extends Record<string, unknown>, K extends keyof T>(
  data: T,
  keys: K[],
): asserts data is T & { [P in K]-?: NonNullable<T[P]> } {
  for (const key of keys) {
    if (data[key] === undefined || data[key] === null) {
      throw new Error(`Required field "${String(key)}" is missing`)
    }
  }
}
