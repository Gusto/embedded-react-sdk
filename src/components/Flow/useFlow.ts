import { createContext, useContext } from 'react'
import type { CustomTypeOptions } from 'i18next'
import type { OnEventType } from '../Base/useBase'
import type { CommonComponentInterface } from '../Base'
import type { BreadcrumbTrail } from '../Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import type { EventType } from '@/shared/constants'

export interface CtaConfig {
  labelKey: string
  namespace?: keyof CustomTypeOptions['resources']
}

/**
 * Discriminated union describing the chrome rendered above the active flow
 * component. Each variant declares only the data it needs:
 *   - `minimal`     → Back button. Optional `cta` for an extra control next to it.
 *   - `progress`    → Step indicator. Requires `currentStep` / `totalSteps`,
 *                     plus optional `cta`.
 *   - `breadcrumbs` → Breadcrumb trail. Optional `currentBreadcrumbId` /
 *                     `breadcrumbs` (typically populated via
 *                     `buildBreadcrumbs` + `updateBreadcrumbs`), plus optional
 *                     `cta`.
 *
 * `cta` carries the same meaning across every variant: an optional component
 * rendered as part of the header chrome.
 */
export type FlowHeaderConfig =
  | {
      type: 'minimal'
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

export const FlowContext = createContext<FlowContextInterface | null>(null)

//TODO: This is hiding the fact that the callsite for useFlow
//  destructures a `companyId` that doesn't seem to exist
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function useFlow<C extends FlowContextInterface>() {
  // When used outside provider, this is expected to return undefined - consumers must fallback to params
  const values = useContext<C>(FlowContext as unknown as React.Context<C>)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!values) {
    throw new Error('useFlow used outside provider')
  }
  return values
}
