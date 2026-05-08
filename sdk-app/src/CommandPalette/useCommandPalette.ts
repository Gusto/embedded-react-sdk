import { useCallback, useState } from 'react'
import { useGlobalShortcut } from '../useGlobalShortcut'

const TOGGLE_KEY = 'k'

export interface UseCommandPaletteResult {
  isOpen: boolean
  open: () => void
  close: () => void
}

export function useCommandPalette(): UseCommandPaletteResult {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  useGlobalShortcut({
    key: TOGGLE_KEY,
    modifier: 'mod',
    onTrigger: event => {
      event.preventDefault()
      setIsOpen(prev => !prev)
    },
  })

  return { isOpen, open, close }
}
