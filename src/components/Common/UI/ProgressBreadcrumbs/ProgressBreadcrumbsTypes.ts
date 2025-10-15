import type { OnEventType } from '@/components/Base/useBase'
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
}

export interface ProgressBreadcrumbsProps {
  /**
   * Steps for the breadcrumbs
   */
  steps: BreadcrumbStep[]
  /**
   * Current step in the breadcrumbs sequence
   */
  currentStep: number
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
}
