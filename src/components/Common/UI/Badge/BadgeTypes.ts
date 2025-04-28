import type { HTMLAttributes, ReactNode } from 'react'

export interface BadgeProps
  extends Pick<HTMLAttributes<HTMLSpanElement>, 'className' | 'id' | 'aria-label'> {
  children: ReactNode
  status?: 'success' | 'warning' | 'error' | 'info'
}
