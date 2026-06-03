import { useState, useRef } from 'react'

/**
 * Manages open/close state for a popover menu and the ARIA wiring on its trigger.
 *
 * @remarks
 * Spread `triggerProps` onto the trigger element (button by default) and pass `menuProps` to the
 * popover component. `triggerProps` sets `aria-haspopup`, `aria-expanded`, and an `onClick` that
 * opens the menu. `menuProps` exposes `isOpen`, `onClose`, and the shared `triggerRef` so the
 * popover can position against the trigger and close itself.
 *
 * @typeParam T - The element type the trigger ref points to.
 * @returns An object with `triggerProps` for the trigger element and `menuProps` for the popover.
 * @internal
 */
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
