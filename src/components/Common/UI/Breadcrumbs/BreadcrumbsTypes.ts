export interface Breadcrumb {
  id: string
  label: string
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
   * Additional CSS class name for the breadcrumbs container
   */
  className?: string
  /**
   * Event handler for breadcrumb navigation
   */
  onClick: (id: string) => void
}
