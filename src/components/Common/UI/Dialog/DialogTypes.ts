import type { ReactNode } from 'react'

/**
 * Props your `Dialog` implementation must accept from the component adapter.
 * Renders a modal confirmation dialog with a primary action and a cancel action.
 *
 * @public
 * @group Component Props
 */
export interface DialogProps {
  /**
   * Controls whether the dialog is open or closed
   * @defaultValue `false`
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
   * @defaultValue `false`
   */
  isDestructive?: boolean
  /**
   * Whether the primary action button is in loading state
   * @defaultValue `false`
   */
  isPrimaryActionLoading?: boolean
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
   * @defaultValue `false`
   */
  shouldCloseOnBackdropClick?: boolean
}

/**
 * Default prop values for the Dialog component.
 *
 * @internal
 */
export const DialogDefaults = {
  isOpen: false,
  isDestructive: false,
  isPrimaryActionLoading: false,
  shouldCloseOnBackdropClick: false,
} as const satisfies Partial<DialogProps>
