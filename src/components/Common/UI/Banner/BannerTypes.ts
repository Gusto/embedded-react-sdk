import type { HTMLAttributes, ReactNode } from 'react'

export interface BannerProps
  extends Pick<HTMLAttributes<HTMLDivElement>, 'className' | 'id' | 'aria-label'> {
  /**
   * Title content displayed in the colored header section
   */
  title: ReactNode
  /**
   * Content to be displayed in the main content area
   */
  children: ReactNode
  /**
   * Visual status variant of the banner
   */
  status?: 'info' | 'success' | 'warning' | 'error'
}

/**
 * Default prop values for Banner component.
 */
export const BannerDefaults = {
  status: 'info',
} as const satisfies Partial<BannerProps>
