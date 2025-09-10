import type { HTMLAttributes, ReactNode } from 'react'

export interface BadgeProps
  extends Pick<HTMLAttributes<HTMLSpanElement>, 'className' | 'id' | 'aria-label'> {
  /**
   * Content to be displayed inside the badge
   */
  children: ReactNode
  /**
   * Visual style variant of the badge
   */
  status?: 'success' | 'warning' | 'error' | 'info'
}

/**
 * Default prop values for Badge component.
 */
export const BadgeDefaults = {
  status: 'info',
} as const satisfies Partial<BadgeProps>
