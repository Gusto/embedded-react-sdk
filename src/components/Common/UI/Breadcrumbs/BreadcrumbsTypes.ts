import type { ReactNode } from 'react'

/**
 * Single entry in a {@link BreadcrumbsProps | Breadcrumbs} trail.
 *
 * @public
 */
export interface Breadcrumb {
  /**
   * Unique identifier for the breadcrumb. Matches against `currentBreadcrumbId` and is passed to `onClick`.
   */
  id: string
  /**
   * Display content rendered for the breadcrumb.
   */
  label: ReactNode
  /**
   * When false, the breadcrumb is rendered as plain text even if onClick is provided.
   * Defaults to true.
   */
  isClickable?: boolean
}
/**
 * Props your `Breadcrumbs` implementation must accept from the component adapter.
 * Renders a navigation breadcrumb trail showing the user's position in a multi-step flow.
 *
 * @public
 * @group Component Props
 */
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
   *
   * @defaultValue `'Breadcrumbs'`
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
   *
   * @defaultValue `false`
   */
  isSmallContainer?: boolean
}

/**
 * Default prop values for Breadcrumbs component.
 *
 * @internal
 */
export const BreadcrumbsDefaults = {
  isSmallContainer: false,
  'aria-label': 'Breadcrumbs',
} as const satisfies Partial<BreadcrumbsProps>
