import type { ReactNode } from 'react'

export interface ContainerProps {
  /**
   * Content to be displayed inside the container
   */
  children: ReactNode
  /**
   * CSS className to be applied
   */
  className?: string
}
