import { createContext, useContext } from 'react'
import { I18nProvider } from 'react-aria-components'

export interface LocaleProviderProps {
  locale: string
  currency: string
  children?: React.ReactNode
}
export const LocaleContext = createContext<Omit<LocaleProviderProps, 'children'> | null>(null)
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

export const useLocale = () => {
  const values = useContext(LocaleContext)
  if (!values) {
    throw new Error('useLocal used outside provider')
  }
  return values
}
