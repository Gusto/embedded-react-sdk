import { createContext, useContext } from 'react'
import type { LanguageMode } from './useLanguageMode'

export interface LanguageModeContextValue {
  lng: LanguageMode
  locale: string
  setLng: (lng: LanguageMode) => void
}

export const LanguageModeContext = createContext<LanguageModeContextValue>({
  lng: 'en',
  locale: 'en-US',
  setLng: () => {},
})

export const LanguageModeProvider = LanguageModeContext.Provider

export function useLanguageModeContext(): LanguageModeContextValue {
  return useContext(LanguageModeContext)
}
