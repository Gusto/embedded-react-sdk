import { createContext, useContext } from 'react'
import type { CustomTypeOptions } from 'i18next'
import type { OnEventType } from '../Base/useBase'
import type { CommonComponentInterface } from '../Base'
import type { BreadcrumbTrail } from '../Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import type { EventType } from '@/shared/constants'

/**
 * Configuration for a call-to-action label sourced from the i18n catalogue.
 *
 * @internal
 */
interface CtaConfig {
  labelKey: string
  namespace?: keyof CustomTypeOptions['resources']
}

/**
 * Discriminated union describing the chrome rendered above the active flow component.
 *
 * @remarks
 * Each variant declares only the data it needs:
 *
 * - `minimal` — back button. Optional `cta` for an extra control next to it.
 * - `progress` — step indicator. Requires `currentStep` / `totalSteps`, plus optional `cta`.
 * - `breadcrumbs` — breadcrumb trail. Optional `currentBreadcrumbId` / `breadcrumbs` (typically
 *   populated via `buildBreadcrumbs` + `updateBreadcrumbs`), plus optional `cta`.
 *
 * `cta` carries the same meaning across every variant: an optional component rendered as part
 * of the header chrome.
 *
 * @internal
 */
export type FlowHeaderConfig =
  | {
      type: 'minimal'
      /**
       * Optional override for the default back button (defaults to
       * `t('back')` + `componentEvents.CANCEL`). Provide both `label` and
       * `event` to render a flow-specific affordance — e.g. "Back to
       * employees" routed to a dedicated state-machine transition so nested
       * flows don't intercept it as a generic cancel.
       */
      back?: {
        labelKey: string
        namespace: keyof CustomTypeOptions['resources']
        event: EventType
      }
      cta?: React.ComponentType
    }
  | {
      type: 'progress'
      currentStep: number
      totalSteps: number
      cta?: React.ComponentType
    }
  | {
      type: 'breadcrumbs'
      currentBreadcrumbId?: string
      breadcrumbs?: BreadcrumbTrail
      cta?: React.ComponentType
    }

/**
 * Shape of the value carried by {@link FlowContext}: the active step component, the upstream
 * event dispatcher, and optional defaults / chrome configuration.
 *
 * @internal
 */
export interface FlowContextInterface {
  component: React.ComponentType<CommonComponentInterface> | null
  onEvent: OnEventType<EventType, unknown>
  defaultValues?: Record<string, unknown>
  ctaConfig?: CtaConfig | null
  /**
   * Optional chrome rendered above the active flow component. When omitted
   * (or set to `null`), no header is shown.
   */
  header?: FlowHeaderConfig | null
}

/**
 * React context that exposes the current {@link FlowContextInterface} to step components
 * rendered inside a {@link Flow}.
 *
 * @internal
 */
export const FlowContext = createContext<FlowContextInterface | null>(null)

//TODO: This is hiding the fact that the callsite for useFlow
//  destructures a `companyId` that doesn't seem to exist
/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
/**
 * Reads the active {@link FlowContext} value from a step component rendered inside a {@link Flow}.
 *
 * @remarks
 * Throws if called outside a {@link Flow} provider. The generic `C` parameter lets callers narrow
 * the context to a flow-specific extension of {@link FlowContextInterface} that carries extra
 * fields (e.g. `companyId`, `employeeId`).
 *
 * @typeParam C - The concrete context shape the calling flow expects, extending {@link FlowContextInterface}.
 * @returns The current flow context value, narrowed to `C`.
 * @throws When called outside a {@link Flow} provider, an `Error` is thrown.
 * @internal
 */
export function useFlow<C extends FlowContextInterface>() {
  /* eslint-enable @typescript-eslint/no-unnecessary-type-parameters */
  // When used outside provider, this is expected to return undefined - consumers must fallback to params
  const values = useContext<C>(FlowContext as unknown as React.Context<C>)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!values) {
    throw new Error('useFlow used outside provider')
  }
  return values
}
