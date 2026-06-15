import type { HTMLAttributes } from 'react'

/**
 * Props your `LoadingSpinner` implementation must accept from the component adapter.
 * Renders a spinner indicating that content is loading.
 *
 * @public
 * @group Component Props
 */
export interface LoadingSpinnerProps extends Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'id' | 'aria-label'
> {
  /**
   * Size of the spinner
   *
   * @defaultValue `'lg'`
   */
  size?: 'lg' | 'sm'
  /**
   * Display style of the spinner
   *
   * @defaultValue `'block'`
   */
  style?: 'inline' | 'block'
}

/**
 * Default prop values for the {@link LoadingSpinner} component.
 *
 * @internal
 */
export const LoadingSpinnerDefaults = {
  size: 'lg',
  style: 'block',
} as const satisfies Partial<LoadingSpinnerProps>
