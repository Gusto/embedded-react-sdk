import type { ReactNode } from 'react'

export interface BoxProps {
  /**
   * Content to be displayed inside the box
   */
  children: ReactNode
  /**
   * Content rendered at the bottom of the box with an edge-to-edge top border
   */
  footer?: ReactNode
  /**
   * CSS className to be applied
   */
  className?: string
}
