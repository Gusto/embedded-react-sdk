import type { HTMLAttributes } from 'react'

export interface BadgeBaseProps
  extends Pick<HTMLAttributes<HTMLSpanElement>, 'className' | 'id' | 'aria-label'> {
  text: string
  variant?: 'success' | 'warning' | 'error' | 'info'
}

export type BadgeProps = BadgeBaseProps
