import type { ReactNode } from 'react'

/**
 * Props your `Modal` implementation must accept from the component adapter.
 * Renders a modal overlay with body and footer content.
 *
 * @public
 * @group Component props
 */
export interface ModalProps {
  /**
   * Controls whether the modal is open or closed
   *
   * @defaultValue `false`
   */
  isOpen?: boolean
  /**
   * Callback function called when the modal should be closed
   */
  onClose?: () => void
  /**
   * Whether clicking the backdrop should close the modal
   *
   * @defaultValue `false`
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
  /**
   * Maximum size of the modal. `medium` and `large` match the Workbench Dialog sizes and let the
   * modal grow to nearly the full viewport height.
   *
   * @defaultValue `'default'`
   */
  size?: 'default' | 'medium' | 'large'
}

/**
 * Default prop values for the {@link Modal} component.
 *
 * @internal
 */
export const ModalDefaults = {
  isOpen: false,
  shouldCloseOnBackdropClick: false,
  size: 'default',
} as const satisfies Partial<ModalProps>
