import type { OnEventType } from '@/components/Base/useBase'
import type { BreadcrumbTrail } from '@/components/Flow/useFlow'
import type { EventType } from '@/types/Helpers'

export interface BreadcrumbStep {
  /**
   * Unique key for the breadcrumb step
   */
  key: string
  /**
   * Translation key for the breadcrumb label
   */
  label: string
  /**
   * Optional translation namespace
   */
  namespace?: string
  /**
   * Optional variables for the breadcrumb label
   */
  variables?: Record<string, unknown>
}

export interface ProgressBreadcrumbsProps {
  /**
   * Steps for the breadcrumbs
   */
  breadcrumbs: BreadcrumbStep[]

  /**
   * Additional CSS class name for the breadcrumbs container
   */
  className?: string
  /**
   * Component to render as the breadcrumbs' CTA
   */
  cta?: React.ComponentType | null
  /**
   * Event handler for breadcrumb navigation
   */
  onEvent?: OnEventType<EventType, unknown>
  /**
   * Current step in the breadcrumbs sequence
   */
  currentBreadcrumb?: keyof BreadcrumbTrail
}
