import { t } from 'i18next'

/**
 * Asserts that a value is defined, throwing a translated error otherwise.
 *
 * @remarks Used to narrow `T | undefined` to `T` at call sites where the value
 * is required by contract but the type system allows `undefined`.
 *
 * @typeParam T - The non-undefined value type.
 * @param prop - The value to assert.
 * @returns The same value with the `undefined` branch removed from its type.
 * @throws Error when `prop` is `undefined`.
 * @internal
 */
export function ensureRequired<T>(prop: T | undefined): T {
  if (prop === undefined) {
    throw new Error(t('errors.ensureRequired'))
  }
  return prop
}
