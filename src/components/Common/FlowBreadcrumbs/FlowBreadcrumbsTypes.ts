import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/types/Helpers'

/**
 * A single step in a flow's breadcrumb trail.
 *
 * @remarks
 * Labels are resolved through i18next. When `namespace` is set, the label is
 * looked up in that namespace; otherwise the global namespace is used. The
 * label string itself is also used as the i18n key, with the raw value as a
 * fallback when no translation is registered. Date-typed `variables` (the
 * `startDate` and `endDate` keys) are auto-formatted with the active locale's
 * short-with-year date format before interpolation.
 *
 * @public
 */
export interface FlowBreadcrumb {
  /**
   * Unique identifier for the breadcrumb step. Matched against the current
   * breadcrumb to mark the active entry and passed to `onNavigate` when the
   * breadcrumb is selected.
   */
  id: string
  /**
   * i18next translation key for the breadcrumb label. Falls back to the raw
   * string when no translation is registered.
   */
  label: string
  /**
   * Optional i18next namespace to resolve `label` against. Defaults to the
   * global namespace when omitted.
   */
  namespace?: string
  /**
   * Optional interpolation variables for the translated label. `startDate` and
   * `endDate` values typed as strings are auto-formatted with the active
   * locale's short-with-year date format before interpolation.
   */
  variables?: Record<string, unknown>
  /**
   * Callback invoked when the breadcrumb is selected. Receives the current
   * flow context and returns the next context.
   */
  onNavigate?: (context: unknown) => unknown
  /**
   * Overrides the default clickability of the breadcrumb. When omitted, the
   * breadcrumb is clickable iff `onNavigate` is defined.
   */
  isNavigable?: boolean
}

/** @internal */
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

/** @internal */
export type BreadcrumbNodes = Record<string, BreadcrumbNode>
/** @internal */
export type BreadcrumbTrail = Record<string, FlowBreadcrumb[]>

/** @internal */
export interface FlowBreadcrumbsProps {
  /** Breadcrumb steps to render, in order. */
  breadcrumbs: FlowBreadcrumb[]
  /** Identifier of the active breadcrumb step. */
  currentBreadcrumbId?: string

  /**
   * Event handler for breadcrumb navigation
   */
  onEvent?: OnEventType<EventType, unknown>
}
