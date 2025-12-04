import type { HTMLAttributes } from 'react'

export interface LoadingSpinnerProps extends Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'id' | 'aria-label'
> {
  /**
   * Size of the spinner
   */
  size?: 'lg' | 'sm'
  /**
   * Display style of the spinner
   */
  style?: 'inline' | 'block'
}

/**
 * Default prop values for LoadingSpinner component.
 */
export const LoadingSpinnerDefaults = {
  size: 'lg',
  style: 'block',
} as const satisfies Partial<LoadingSpinnerProps>
