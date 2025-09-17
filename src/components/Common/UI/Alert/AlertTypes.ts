import type { ReactNode } from 'react'

export interface AlertProps {
  /**
   * The visual status that the alert should convey
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
   * Optional custom icon component to override the default icon
   */
  icon?: ReactNode
  /**
   * CSS className to be applied
   */
  className?: string
}

/**
 * Default prop values for Alert component.
 */
export const AlertDefaults = {
  status: 'info',
} as const satisfies Partial<AlertProps>
