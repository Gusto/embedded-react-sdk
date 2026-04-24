import { useContext } from 'react'
import { ThemeModeContext } from './ThemeModeContext'
import type { ThemeModeContextValue } from './ThemeModeContext'
import type { ResolvedTheme } from './useThemeMode'

export function useThemeModeContext(): ThemeModeContextValue {
  return useContext(ThemeModeContext)
}

export function useResolvedTheme(): ResolvedTheme {
  return useContext(ThemeModeContext).resolvedTheme
}
