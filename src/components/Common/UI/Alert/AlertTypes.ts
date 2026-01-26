import type { ReactNode } from 'react'

export interface AlertConfig {
  /**
   * The main message text
   */
  content: string
  /**
   * Supporting/explanatory text
   */
  description?: ReactNode
  /**
   * How it should render
   */
  status: 'info' | 'success' | 'warning' | 'error'
  /**
   * Optional custom icon component
   */
  icon?: ReactNode
}

export interface AlertProps {
  /**
   * The visual status that the alert should convey
   */
  status?: 'info' | 'success' | 'warning' | 'error'
  /**
   * The label text for the alert
   */
  label?: string
  /**
   * Optional children to be rendered inside the alert
   */
  children?: ReactNode
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
  /**
   * Optional alert configuration object that takes precedence over individual props
   */
  alertConfig?: AlertConfig
}

/**
 * Default prop values for Alert component.
 */
export const AlertDefaults = {
  status: 'info',
} as const satisfies Partial<AlertProps>
