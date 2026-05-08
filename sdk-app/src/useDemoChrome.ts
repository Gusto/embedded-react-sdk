import { useCallback, useState } from 'react'
import { findDemoChrome, SDK_NATIVE_CHROME_ID } from './demoChromes/registry'

const STORAGE_KEY = 'sdk-app-chrome-id'

function readInitial(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && findDemoChrome(stored)) return stored
  } catch {
    // Storage unavailable
  }
  return SDK_NATIVE_CHROME_ID
}

function persist(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Storage unavailable
  }
}

export interface UseDemoChromeResult {
  chromeId: string
  setChromeId: (next: string) => void
}

export function useDemoChrome(): UseDemoChromeResult {
  const [chromeId, setChromeIdState] = useState<string>(readInitial)

  const setChromeId = useCallback((next: string) => {
    setChromeIdState(next)
    persist(next)
  }, [])

  return { chromeId, setChromeId }
}
