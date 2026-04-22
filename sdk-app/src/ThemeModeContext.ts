import { createContext } from 'react'
import type { ThemeMode, ResolvedTheme } from './useThemeMode'

export interface ThemeModeContextValue {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  setMode: (mode: ThemeMode) => void
}

export const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: 'system',
  resolvedTheme: 'light',
  setMode: () => {},
})

export const ThemeModeProvider = ThemeModeContext.Provider
