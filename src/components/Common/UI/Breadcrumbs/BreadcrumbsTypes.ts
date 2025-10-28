import type { ReactNode } from 'react'

export interface Breadcrumb {
  id: string
  label: ReactNode
}
export interface BreadcrumbsProps {
  /**
   * Array of breadcrumbs
   */
  breadcrumbs: Breadcrumb[]
  /**
   * Current breadcrumb id
   */
  currentBreadcrumbId?: string
  /**
   * Accessibility label for the breadcrumbs
   */
  'aria-label'?: string
  /**
   * Additional CSS class name for the breadcrumbs container
   */
  className?: string
  /**
   * Event handler for breadcrumb navigation
   */
  onClick?: (id: string) => void
  /**
   * Passed to the breadcrumbs when the container size is small (640px and below)
   * At this size, the breadcrumb typically does not have sufficient size to render
   * completely. In our implementation, we switch to a condensed mobile version of
   * the breadcrumbs
   */
  isSmallContainer?: boolean
}

/**
 * Default prop values for Breadcrumbs component.
 */
export const BreadcrumbsDefaults = {
  isSmallContainer: false,
  'aria-label': 'Breadcrumbs',
} as const satisfies Partial<BreadcrumbsProps>
