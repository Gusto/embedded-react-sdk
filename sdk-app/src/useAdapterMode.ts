import { useState, useCallback } from 'react'
import type { AdapterOption } from './design/component-adapters/types'

const STORAGE_KEY = 'sdk-app-adapter-mode'

function loadAdapter(): AdapterOption {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'default' || stored === 'gws') return stored
  } catch {
    // Storage unavailable
  }
  return 'default'
}

function saveAdapter(adapter: AdapterOption) {
  try {
    localStorage.setItem(STORAGE_KEY, adapter)
  } catch {
    // Storage full or unavailable
  }
}

export function useAdapterMode() {
  const [adapter, setAdapterState] = useState<AdapterOption>(loadAdapter)

  const setAdapter = useCallback((newAdapter: AdapterOption) => {
    setAdapterState(newAdapter)
    saveAdapter(newAdapter)
  }, [])

  return { adapter, setAdapter }
}
