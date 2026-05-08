import { createContext, useContext, useMemo, useState } from 'react'
import { useResolvedTheme } from '../useThemeModeContext'
import { darkTheme } from '../darkTheme'
import type { GustoSDKTheme } from '@/contexts/ThemeProvider/theme'
import { mergePartnerTheme } from '@/contexts/ThemeProvider/theme'

export interface ThemeEditorContextValue {
  themeOverrides: Partial<GustoSDKTheme>
  resolvedTheme: GustoSDKTheme
  setThemeOverride: (key: keyof GustoSDKTheme, value: string) => void
  clearThemeOverrides: () => void
}

export const ThemeEditorContext = createContext<ThemeEditorContextValue>({
  themeOverrides: {},
  resolvedTheme: {},
  setThemeOverride: () => {},
  clearThemeOverrides: () => {},
})

export const useThemeEditor = () => useContext(ThemeEditorContext)

export function useThemeEditorState(): ThemeEditorContextValue {
  const [themeOverrides, setThemeOverrides] = useState<Partial<GustoSDKTheme>>({})
  const colorMode = useResolvedTheme()

  const resolvedTheme = useMemo(() => {
    const base = colorMode === 'dark' ? darkTheme : undefined
    return mergePartnerTheme({ ...base, ...themeOverrides })
  }, [colorMode, themeOverrides])

  const setThemeOverride = (key: keyof GustoSDKTheme, value: string) => {
    setThemeOverrides(prev => ({
      ...prev,
      [key]: value || undefined,
    }))
  }

  const clearThemeOverrides = () => {
    setThemeOverrides({})
  }

  return { themeOverrides, resolvedTheme, setThemeOverride, clearThemeOverrides }
}
