import { createContext, useContext } from 'react'

export interface LocaleProviderProps {
  locale: string
  currency: string
  children?: React.ReactNode
}

export const LocaleContext = createContext<Omit<LocaleProviderProps, 'children'> | null>(null)

export const useLocale = () => {
  const values = useContext(LocaleContext)
  if (!values) {
    throw new Error('useLocal used outside provider')
  }
  return values
}
