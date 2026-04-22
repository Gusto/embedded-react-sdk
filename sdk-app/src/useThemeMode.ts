import { useState, useEffect, useCallback } from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'sdk-app-theme-mode'

function loadMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // Storage unavailable
  }
  return 'system'
}

function saveMode(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Storage full or unavailable
  }
}

function getSystemPreference(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>(loadMode)
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPreference)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches)
    }
    mediaQuery.addEventListener('change', handler)
    return () => { mediaQuery.removeEventListener('change', handler); }
  }, [])

  const resolvedTheme: ResolvedTheme =
    mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    saveMode(newMode)
  }, [])

  return { mode, resolvedTheme, setMode }
}
