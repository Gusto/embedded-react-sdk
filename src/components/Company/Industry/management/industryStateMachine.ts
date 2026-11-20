import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { IndustryContextInterface } from './IndustryComponents'
import { IndustryCardContextual, IndustryEditScreenContextual } from './IndustryComponents'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

/**
 * Back affordance rendered above the edit screen.
 *
 * @remarks
 * Uses this block's own `company/management/industry/editCancelled` rather than the generic
 * `componentEvents.CANCEL`. The edit screen is itself `Flow`-driven and `Flow` re-emits every
 * inner event to its parent, so a `CANCEL` transition here would fire for any cancel raised
 * on a screen *inside* the edit surface.
 *
 * The industry form is also submit-only — it has no Cancel of its own — so this header is the
 * only way back to the card.
 *
 * @internal
 */
const editHeader: FlowHeaderConfig = {
  type: 'minimal',
  back: {
    labelKey: 'header.backCta',
    namespace: 'Company.Management.Industry',
    event: componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_CANCELLED,
  },
}

const returnToCard = reduce((ctx: IndustryContextInterface): IndustryContextInterface => ({
  ...ctx,
  component: IndustryCardContextual as ComponentType,
  header: null,
  successAlert: null,
}))

const returnToCardWithAlert = (alert: IndustryContextInterface['successAlert']) =>
  reduce((ctx: IndustryContextInterface): IndustryContextInterface => ({
    ...ctx,
    component: IndustryCardContextual as ComponentType,
    header: null,
    successAlert: alert,
  }))

/**
 * Card to edit screen and back.
 *
 * @remarks
 * Deliberately declares no transition on `componentEvents.CANCEL`; see {@link editHeader}.
 *
 * @internal
 */
export const industryStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_REQUESTED,
      'editIndustry',
      reduce((ctx: IndustryContextInterface): IndustryContextInterface => ({
        ...ctx,
        component: IndustryEditScreenContextual as ComponentType,
        header: editHeader,
        successAlert: null,
      })),
    ),
    transition(componentEvents.COMPANY_MANAGEMENT_INDUSTRY_ALERT_DISMISSED, 'card', returnToCard),
  ),
  editIndustry: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_INDUSTRY_UPDATED,
      'card',
      returnToCardWithAlert('industryUpdated'),
    ),
    transition(componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_CANCELLED, 'card', returnToCard),
  ),
}
