import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { FederalTaxesContextInterface } from './FederalTaxesComponents'
import {
  FederalTaxesCardContextual,
  FederalTaxesEditScreenContextual,
} from './FederalTaxesComponents'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

/**
 * Back affordance rendered above the edit screen.
 *
 * @remarks
 * Uses this block's own `company/management/federalTaxes/editCancelled` rather than the generic
 * `componentEvents.CANCEL`. The edit screen is itself `Flow`-driven and `Flow` re-emits every
 * inner event to its parent, so a `CANCEL` transition here would fire for any cancel raised on
 * a screen *inside* the edit surface.
 *
 * The federal tax details form is also submit-only — it has no Cancel of its own — so this
 * header is the only way back to the card.
 *
 * @internal
 */
const editHeader: FlowHeaderConfig = {
  type: 'minimal',
  back: {
    labelKey: 'header.backCta',
    namespace: 'Company.Management.FederalTaxes',
    event: componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_EDIT_CANCELLED,
  },
}

const returnToCard = reduce((ctx: FederalTaxesContextInterface): FederalTaxesContextInterface => ({
  ...ctx,
  component: FederalTaxesCardContextual as ComponentType,
  header: null,
  successAlert: null,
}))

const returnToCardWithAlert = (alert: FederalTaxesContextInterface['successAlert']) =>
  reduce((ctx: FederalTaxesContextInterface): FederalTaxesContextInterface => ({
    ...ctx,
    component: FederalTaxesCardContextual as ComponentType,
    header: null,
    successAlert: alert,
  }))

/**
 * Card to edit screen and back.
 *
 * @remarks
 * Deliberately declares no transition on `componentEvents.CANCEL`; see {@link editHeader}.
 * `company/federalTaxes/done` is likewise absent: the edit screen translates
 * `company/federalTaxes/updated` into the management event this machine returns on, so
 * declaring the completion event here too would transition twice for one save.
 *
 * @internal
 */
export const federalTaxesStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_EDIT_REQUESTED,
      'editFederalTaxes',
      reduce((ctx: FederalTaxesContextInterface): FederalTaxesContextInterface => ({
        ...ctx,
        component: FederalTaxesEditScreenContextual as ComponentType,
        header: editHeader,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_ALERT_DISMISSED,
      'card',
      returnToCard,
    ),
  ),
  editFederalTaxes: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_UPDATED,
      'card',
      returnToCardWithAlert('federalTaxesUpdated'),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_EDIT_CANCELLED,
      'card',
      returnToCard,
    ),
  ),
}
