import type { ReactNode } from 'react'

/**
 * Props your `Alert` implementation must accept from the component adapter.
 * Renders a status message with an optional dismiss action; used for errors, warnings, success confirmations, and informational messages.
 *
 * @public
 * @group Component Props
 */
export interface AlertProps {
  /**
   * The visual status that the alert should convey
   *
   * @defaultValue `'info'`
   */
  status?: 'info' | 'success' | 'warning' | 'error'
  /**
   * The label text for the alert
   */
  label: string
  /**
   * Optional children to be rendered inside the alert
   */
  children?: ReactNode
  /**
   * Optional action node (e.g. a Button) rendered inline beside the label,
   * before the dismiss button. Use this for compact alerts that need a single
   * call-to-action next to the heading (e.g. a "Review" button summarising
   * details available in a modal). Multi-line supporting copy should still
   * pass through `children`.
   */
  action?: ReactNode
  /**
   * Optional custom icon component to override the default icon
   */
  icon?: ReactNode
  /**
   * CSS className to be applied
   */
  className?: string
  /**
   * Optional callback function called when the dismiss button is clicked
   */
  onDismiss?: () => void
  /**
   * Whether to disable scrolling the alert into view and focusing it on mount. Set to true when using inside modals.
   */
  disableScrollIntoView?: boolean
}

/**
 * Default prop values for Alert component.
 *
 * @internal
 */
export const AlertDefaults = {
  status: 'info',
} as const satisfies Partial<AlertProps>
