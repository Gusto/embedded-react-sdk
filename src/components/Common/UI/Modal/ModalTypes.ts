import type { ReactNode } from 'react'

export interface ModalProps {
  /**
   * Controls whether the modal is open or closed
   */
  isOpen?: boolean
  /**
   * Callback function called when the modal should be closed
   */
  onClose?: () => void
  /**
   * Whether clicking the backdrop should close the modal
   */
  shouldCloseOnBackdropClick?: boolean
  /**
   * Main content to be rendered in the modal body
   */
  children?: ReactNode
  /**
   * Footer content to be rendered at the bottom of the modal
   */
  footer?: ReactNode
  /**
   * Optional ref to the backdrop container
   */
  containerRef?: React.RefObject<HTMLDivElement | null>
}

/**
 * Default prop values for Modal component.
 */
export const ModalDefaults = {
  isOpen: false,
  shouldCloseOnBackdropClick: false,
} as const satisfies Partial<ModalProps>
