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
}
