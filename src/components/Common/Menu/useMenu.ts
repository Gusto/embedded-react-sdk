import { useState, useRef } from 'react'

export function useMenu<T extends Element = HTMLButtonElement>() {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<T>(null)

  return {
    triggerProps: {
      ref: triggerRef,
      onClick: () => {
        setIsOpen(true)
      },
      'aria-haspopup': true,
      'aria-expanded': isOpen,
    },
    menuProps: {
      isOpen,
      onClose: () => {
        setIsOpen(false)
      },
      triggerRef,
    },
  }
}
