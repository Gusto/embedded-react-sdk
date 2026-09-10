import { useState, useCallback } from 'react'

export type LanguageMode = 'en' | 'es_US'

const STORAGE_KEY = 'sdk-app-language-mode'

const LOCALES: Record<LanguageMode, string> = {
  en: 'en-US',
  es_US: 'es-US',
}

function loadMode(): LanguageMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'es_US') return stored
  } catch {
    // Storage unavailable
  }
  return 'en'
}

function saveMode(mode: LanguageMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Storage full or unavailable
  }
}

export function useLanguageMode() {
  const [lng, setLngState] = useState<LanguageMode>(loadMode)

  const setLng = useCallback((newLng: LanguageMode) => {
    setLngState(newLng)
    saveMode(newLng)
  }, [])

  return { lng, locale: LOCALES[lng], setLng }
}
