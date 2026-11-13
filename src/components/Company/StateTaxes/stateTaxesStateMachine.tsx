import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { StateTaxesContextInterface } from './StateTaxesComponents'
import {
  StateTaxesFormContextual,
  StateTaxesListContextual,
  TaxRateManagementContextual,
} from './StateTaxesComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.COMPANY_STATE_TAX_UPDATED]: undefined
  [componentEvents.COMPANY_STATE_TAX_EDIT]: { state: string }
  [componentEvents.COMPANY_STATE_TAX_MANAGE_RATES]: { state: string }
}

/**
 * Builds the list → requirements form / tax rate history machine around a given list screen.
 *
 * @remarks
 * The onboarding and management journeys share every screen except the state list, so the
 * list is the only thing that varies: each transition back to the list lands on
 * `listComponent`.
 *
 * @internal
 */
export function createStateTaxesStateMachine(listComponent: ComponentType) {
  const returnToList = reduce((ctx: StateTaxesContextInterface): StateTaxesContextInterface => ({
    ...ctx,
    component: listComponent,
    state: undefined,
  }))

  return {
    viewStateTaxes: state<MachineTransition>(
      transition(
        componentEvents.COMPANY_STATE_TAX_EDIT,
        'editStateTaxes',
        reduce(
          (
            ctx: StateTaxesContextInterface,
            ev: MachineEventType<EventPayloads, typeof componentEvents.COMPANY_STATE_TAX_EDIT>,
          ): StateTaxesContextInterface => ({
            ...ctx,
            component: StateTaxesFormContextual,
            state: ev.payload.state,
          }),
        ),
      ),
      transition(
        componentEvents.COMPANY_STATE_TAX_MANAGE_RATES,
        'manageTaxRates',
        reduce(
          (
            ctx: StateTaxesContextInterface,
            ev: MachineEventType<
              EventPayloads,
              typeof componentEvents.COMPANY_STATE_TAX_MANAGE_RATES
            >,
          ): StateTaxesContextInterface => ({
            ...ctx,
            component: TaxRateManagementContextual,
            state: ev.payload.state,
          }),
        ),
      ),
    ),
    editStateTaxes: state<MachineTransition>(
      transition(componentEvents.COMPANY_STATE_TAX_UPDATED, 'viewStateTaxes', returnToList),
      transition(componentEvents.CANCEL, 'viewStateTaxes', returnToList),
    ),
    manageTaxRates: state<MachineTransition>(
      transition(componentEvents.CANCEL, 'viewStateTaxes', returnToList),
    ),
  }
}

/** @internal */
export const stateTaxesStateMachine = createStateTaxesStateMachine(StateTaxesListContextual)
