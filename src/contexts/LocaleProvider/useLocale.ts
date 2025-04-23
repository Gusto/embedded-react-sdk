import { createContext, useContext } from 'react'

export interface LocaleProps {
  locale: string
  currency: string
}

export const LocaleContext = createContext<LocaleProps | null>(null)

export const useLocale = () => {
  const values = useContext(LocaleContext)
  if (!values) {
    throw new Error('useLocal used outside provider')
  }
  return values
}
