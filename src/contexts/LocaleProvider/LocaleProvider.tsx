import { createContext, useContext } from 'react'
import { I18nProvider } from 'react-aria-components'
import { LocaleContext, LocaleProviderProps } from './useLocale'

export function LocaleProvider({
  locale = 'en-US',
  currency = 'USD',
  children,
}: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale: locale, currency: currency }}>
      {/* react-aria locale provider that exposes correct locale to number formatters */}
      <I18nProvider locale={locale}>
        <section lang={locale}>{children}</section>
      </I18nProvider>
    </LocaleContext.Provider>
  )
}
