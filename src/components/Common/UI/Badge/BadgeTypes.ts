import type { HTMLAttributes, ReactNode } from 'react'

/**
 * Props your `Badge` implementation must accept from the component adapter.
 * Renders a small inline label for status, counts, or tags; optionally dismissible.
 *
 * @public
 * @group Component Props
 */
export interface BadgeProps extends Pick<
  HTMLAttributes<HTMLSpanElement>,
  'className' | 'id' | 'aria-label'
> {
  /**
   * Content to be displayed inside the badge
   */
  children: ReactNode
  /**
   * Visual style variant of the badge
   *
   * @defaultValue `'info'`
   */
  status?: 'success' | 'warning' | 'error' | 'info'
  /**
   * Optional callback when the dismiss button is clicked. When provided, a dismiss button is rendered inside the badge.
   */
  onDismiss?: () => void
  /**
   * Accessible label for the dismiss button
   */
  dismissAriaLabel?: string
  /**
   * Whether the badge interaction is disabled
   */
  isDisabled?: boolean
}

/**
 * Default prop values for Badge component.
 *
 * @internal
 */
export const BadgeDefaults = {
  status: 'info',
} as const satisfies Partial<BadgeProps>
