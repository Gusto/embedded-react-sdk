import type { ReactNode } from 'react'

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
