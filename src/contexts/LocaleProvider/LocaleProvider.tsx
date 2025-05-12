import type { LocaleProps } from './useLocale'
import { LocaleContext } from './useLocale'

export interface LocaleProviderProps extends LocaleProps {
  children?: React.ReactNode
}

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
