import { createContext, useContext, useState } from 'react'
import type { GustoSDKTheme } from '@/contexts/ThemeProvider/theme'

export interface ThemeEditorContextValue {
  themeOverrides: Partial<GustoSDKTheme>
  setThemeOverride: (key: keyof GustoSDKTheme, value: string) => void
  clearThemeOverrides: () => void
}

export const ThemeEditorContext = createContext<ThemeEditorContextValue>({
  themeOverrides: {},
  setThemeOverride: () => {},
  clearThemeOverrides: () => {},
})

export const useThemeEditor = () => useContext(ThemeEditorContext)

export function useThemeEditorState(): ThemeEditorContextValue {
  const [themeOverrides, setThemeOverrides] = useState<Partial<GustoSDKTheme>>({})

  const setThemeOverride = (key: keyof GustoSDKTheme, value: string) => {
    setThemeOverrides(prev => ({
      ...prev,
      [key]: value || undefined,
    }))
  }

  const clearThemeOverrides = () => {
    setThemeOverrides({})
  }

  return { themeOverrides, setThemeOverride, clearThemeOverrides }
}
