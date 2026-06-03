import type { LocaleProps } from './useLocale'
import { LocaleContext } from './useLocale'

/**
 * Props for {@link LocaleProvider}: the {@link LocaleProps} settings plus any children to render within the locale scope.
 *
 * @public
 */
export interface LocaleProviderProps extends LocaleProps {
  children?: React.ReactNode
}

/**
 * Supplies locale and currency to descendant SDK components and sets the `lang` attribute on a wrapping `div`.
 *
 * @remarks
 * Normally used internally by `GustoProvider`; render it directly only when composing the SDK
 * outside of `GustoProvider`. Children access the active values through {@link useLocale}.
 *
 * @param props - The {@link LocaleProviderProps} controlling locale, currency, and children.
 * @returns A `div` with `lang` set to the locale, wrapping `children` in the locale context.
 * @public
 */
export function LocaleProvider({
  locale = 'en-US',
  currency = 'USD',
  children,
}: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale: locale, currency: currency }}>
      <div lang={locale}>{children}</div>
    </LocaleContext.Provider>
  )
}
