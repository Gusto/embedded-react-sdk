import { createContext, useContext } from 'react'

/**
 * Locale and currency settings supplied to {@link LocaleProvider}.
 *
 * @remarks
 * `locale` is a BCP 47 language tag (defaults to `en-US`) used for `Intl` formatting and the
 * rendered wrapper's `lang` attribute. `currency` is an ISO 4217 currency code (defaults to
 * `USD`) consumed by currency-aware inputs.
 *
 * @internal
 */
export interface LocaleProps {
  locale?: string
  currency?: string
}

/**
 * React context backing {@link useLocale}.
 *
 * @internal
 */
export const LocaleContext = createContext<LocaleProps | null>(null)

/**
 * Returns the active locale and currency from the surrounding {@link LocaleProvider}.
 *
 * @returns An object with `locale` (defaulting to `en-US`) and `currency` (defaulting to `USD`).
 * @throws An `Error` when called outside a {@link LocaleProvider}.
 * @internal
 *
 * @example
 * ```tsx
 * import { useLocale } from '@gusto/embedded-react-sdk'
 *
 * function Amount({ value }: { value: number }) {
 *   const { locale, currency } = useLocale()
 *   return <span>{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)}</span>
 * }
 * ```
 */
export const useLocale = () => {
  const values = useContext(LocaleContext)
  if (!values) {
    throw new Error('useLocal used outside provider')
  }
  return {
    locale: values.locale ?? 'en-US',
    currency: values.currency ?? 'USD',
  }
}
