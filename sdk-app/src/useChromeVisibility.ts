import { useCallback, useState } from 'react'
import { useGlobalShortcut } from './useGlobalShortcut'

const STORAGE_KEY = 'sdk-app-chrome-hidden'
const TOGGLE_KEY = '\\'

function readInitial(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function persist(hidden: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, hidden ? 'true' : 'false')
  } catch {
    // Storage unavailable; continue without persistence.
  }
}

export interface UseChromeVisibilityResult {
  chromeHidden: boolean
  toggleChrome: () => void
  showChrome: () => void
}

export function useChromeVisibility(): UseChromeVisibilityResult {
  const [chromeHidden, setChromeHidden] = useState<boolean>(readInitial)

  const toggleChrome = useCallback(() => {
    setChromeHidden(prev => {
      const next = !prev
      persist(next)
      return next
    })
  }, [])

  const showChrome = useCallback(() => {
    setChromeHidden(prev => {
      if (!prev) return prev
      persist(false)
      return false
    })
  }, [])

  useGlobalShortcut({
    key: TOGGLE_KEY,
    onTrigger: event => {
      event.preventDefault()
      toggleChrome()
    },
  })

  useGlobalShortcut({
    key: 'Escape',
    enabled: chromeHidden,
    onTrigger: () => {
      showChrome()
    },
  })

  return { chromeHidden, toggleChrome, showChrome }
}
