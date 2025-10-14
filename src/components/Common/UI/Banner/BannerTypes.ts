import type { ReactNode } from 'react'

export interface BannerAction {
  label: string
  onClick: () => void
}

export interface BannerProps {
  /**
   * The visual status that the alert should convey
   */
  status?: 'info' | 'success' | 'warning' | 'error'

  /**
   * The label text for the banner
   */
  label: string

  /**
   * The description text for the banner
   */
  description: string

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

  /**
   * Optional component slot to be rendered inside the banner
   */
  componentSlot?: ReactNode

  /**
   * Optional callback function called when the dismiss button is clicked
   */
  onDismiss?: () => void

  /**
   * Optional primary action button
   */
  primaryAction?: BannerAction

  /**
   * Optional secondary action button
   */
  secondaryAction?: BannerAction
}

/**
 * Default prop values for Alert component.
 */
export const BannerDefaults = {
  status: 'info',
} as const satisfies Partial<BannerProps>
