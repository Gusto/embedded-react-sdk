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
 * Configuration for the optional back affordance rendered above the active flow component.
 *
 * @remarks
 * Routes the back click to a flow-specific event (use a dedicated `*_BACK` event constant
 * per flow rather than `CANCEL`, which bubbles to parent flows).
 *
 * @internal
 */
export interface BackConfig {
  labelKey: string
  namespace: keyof CustomTypeOptions['resources']
  event: EventType
}

/**
 * Configuration for the chrome rendered above the active flow component.
 *
 * @remarks
 * Three independent axes — none are mutually exclusive:
 *
 * - `back` — optional back affordance. Renders a destination-labeled back button above the
 *   indicator row. Omit to hide.
 * - `cta` — optional component (e.g. "Save and exit") composed alongside the indicator.
 * - `indicator` — progress indicator variant:
 *   - `none` — no indicator (use when `back` and/or `cta` are the only chrome).
 *   - `progress` — step indicator. Requires `currentStep` / `totalSteps`.
 *   - `breadcrumbs` — breadcrumb trail. Optional `currentBreadcrumbId` / `breadcrumbs`
 *     (typically populated via `buildBreadcrumbs` + `updateBreadcrumbs`).
 *
 * @internal
 */
export type FlowHeaderConfig = {
  back?: BackConfig
  cta?: React.ComponentType
} & (
  | { indicator: 'none' }
  | { indicator: 'progress'; currentStep: number; totalSteps: number }
  | {
      indicator: 'breadcrumbs'
      currentBreadcrumbId?: string
      breadcrumbs?: BreadcrumbTrail
    }
)

/**
 * Builds a `(labelKey) => FlowHeaderConfig` factory bound to a flow-specific
 * translation namespace and back event.
 *
 * @remarks
 * Each step's `header` should name the step the user will return to (i.e. its
 * predecessor in the forward graph). Declaring one factory at the top of a
 * flow's state machine keeps the per-state header configs terse:
 *
 * ```ts
 * const backHeaderTo = createBackHeaderFactory({
 *   namespace: 'Employee.OnboardingExecutionFlow',
 *   event: componentEvents.EMPLOYEE_ONBOARDING_BACK,
 * })
 * const backToProfileHeader = backHeaderTo('employeeProfile')
 * const backToCompensationHeader = backHeaderTo('compensation')
 * ```
 *
 * Use a dedicated `*_BACK` event constant per flow rather than a generic
 * `BACK` — generic events collide with nested-flow event bubbling.
 *
 * @internal
 */
export function createBackHeaderFactory({
  namespace,
  event,
}: {
  namespace: keyof CustomTypeOptions['resources']
  event: EventType
}): (labelKey: string) => FlowHeaderConfig {
  return (labelKey: string) => ({
    indicator: 'none',
    back: { labelKey, namespace, event },
  })
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
