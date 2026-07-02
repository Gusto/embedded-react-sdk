import type { ReactNode } from 'react'

/**
 * Props your `Card` implementation must accept from the component adapter.
 * Renders a content container with an optional overflow menu and a leading action slot.
 *
 * @public
 * @group Component props
 */
export interface CardProps {
  /**
   * Content to be displayed inside the card
   */
  children: ReactNode
  /**
   * Optional menu component to be displayed on the right side of the card
   */
  menu?: ReactNode
  /**
   * CSS className to be applied
   */
  className?: string
  /**
   * Optional action element (e.g., checkbox, radio) to be displayed on the left side
   */
  action?: ReactNode
}
