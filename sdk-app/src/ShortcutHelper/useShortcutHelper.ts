import { useCallback, useState } from 'react'
import { useGlobalShortcut } from '../useGlobalShortcut'

const TOGGLE_KEY = '?'

export interface UseShortcutHelperResult {
  isOpen: boolean
  open: () => void
  close: () => void
}

export function useShortcutHelper(): UseShortcutHelperResult {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  useGlobalShortcut({
    key: TOGGLE_KEY,
    onTrigger: event => {
      event.preventDefault()
      setIsOpen(prev => !prev)
    },
  })

  useGlobalShortcut({
    key: 'Escape',
    enabled: isOpen,
    onTrigger: () => {
      setIsOpen(false)
    },
  })

  return { isOpen, open, close }
}
