import { useCallback, useEffect, useState } from 'react'
import { useGlobalShortcut } from './useGlobalShortcut'

const STORAGE_KEY = 'sdk-app-code-panel-open'
const TOGGLE_KEY = 'e'

function readInitial(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function persist(open: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, open ? 'true' : 'false')
  } catch {
    // Storage unavailable; continue without persistence.
  }
}

export interface UseCodePanelResult {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export function useCodePanel(): UseCodePanelResult {
  const [isOpen, setIsOpen] = useState<boolean>(readInitial)

  useEffect(() => {
    persist(isOpen)
  }, [isOpen])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  useGlobalShortcut({
    key: TOGGLE_KEY,
    modifier: 'mod',
    onTrigger: event => {
      event.preventDefault()
      toggle()
    },
  })

  return { isOpen, open, close, toggle }
}
