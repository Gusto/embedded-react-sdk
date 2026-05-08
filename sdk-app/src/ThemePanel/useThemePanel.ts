import { useCallback, useState } from 'react'
import { useGlobalShortcut } from '../useGlobalShortcut'

export interface UseThemePanelResult {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export function useThemePanel(): UseThemePanelResult {
  const [isOpen, setIsOpen] = useState(false)

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
    key: 'j',
    modifier: 'mod',
    onTrigger: event => {
      event.preventDefault()
      toggle()
    },
  })

  return { isOpen, open, close, toggle }
}
