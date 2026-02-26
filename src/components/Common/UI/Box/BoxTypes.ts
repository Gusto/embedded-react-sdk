import type { ReactNode } from 'react'

export interface BoxProps {
  /**
   * Content to be displayed inside the box
   */
  children: ReactNode
  /**
   * CSS className to be applied
   */
  className?: string
}
