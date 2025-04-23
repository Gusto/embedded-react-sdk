import { I18nProvider } from 'react-aria-components'
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
      {/* react-aria locale provider that exposes correct locale to number formatters */}
      <I18nProvider locale={locale}>
        <div lang={locale}>{children}</div>
      </I18nProvider>
    </LocaleContext.Provider>
  )
}
