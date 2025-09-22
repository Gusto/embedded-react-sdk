import type { ReactNode } from 'react'

export interface DialogProps {
  /**
   * Controls whether the dialog is open or closed
   */
  isOpen?: boolean
  /**
   * Callback function called when the dialog should be closed
   */
  onClose?: () => void
  /**
   * Callback function called when the primary action button is clicked
   */
  onPrimaryActionClick?: () => void
  /**
   * Whether the primary action is destructive (changes button style to error variant)
   */
  isDestructive?: boolean
  /**
   * Text label for the primary action button
   */
  primaryActionLabel: string
  /**
   * Text label for the close/cancel action button
   */
  closeActionLabel: string
  /**
   * Optional title content to be displayed at the top of the dialog
   */
  title?: ReactNode
  /**
   * Optional children content to be rendered in the dialog body
   */
  children?: ReactNode
  /**
   * Whether clicking the backdrop should close the dialog
   */
  shouldCloseOnBackdropClick?: boolean
}

/**
 * Default prop values for Dialog component.
 */
export const DialogDefaults = {
  isOpen: false,
  isDestructive: false,
  shouldCloseOnBackdropClick: false,
} as const satisfies Partial<DialogProps>
