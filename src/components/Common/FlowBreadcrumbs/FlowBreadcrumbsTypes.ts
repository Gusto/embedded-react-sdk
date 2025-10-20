import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/types/Helpers'

export interface FlowBreadcrumb {
  /**
   * Unique key for the breadcrumb step
   */
  id: string
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
  /**
   * Event handler for breadcrumb navigation
   */
  onNavigate?: (context: unknown) => unknown
}

export interface BreadcrumbNode {
  /**
   * Parent node key (null for root nodes)
   */
  parent: string | null
  /**
   * The breadcrumb item data
   */
  item: FlowBreadcrumb
}

export type BreadcrumbNodes = Record<string, BreadcrumbNode>
export type BreadcrumbTrail = Record<string, FlowBreadcrumb[]>

export interface FlowBreadcrumbsProps {
  breadcrumbs: FlowBreadcrumb[]
  currentBreadcrumbId?: string
  /**
   * Component to render as the breadcrumbs' CTA
   */
  cta?: React.ComponentType | null
  /**
   * Event handler for breadcrumb navigation
   */
  onEvent?: OnEventType<EventType, unknown>
}
