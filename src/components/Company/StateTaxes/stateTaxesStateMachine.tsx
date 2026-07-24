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

/** @internal */
export const stateTaxesStateMachine = {
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
          component: StateTaxesFormContextual as ComponentType,
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
          component: TaxRateManagementContextual as ComponentType,
          state: ev.payload.state,
        }),
      ),
    ),
  ),
  editStateTaxes: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_STATE_TAX_UPDATED,
      'viewStateTaxes',
      reduce(
        (
          ctx: StateTaxesContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.COMPANY_STATE_TAX_UPDATED>,
        ): StateTaxesContextInterface => ({
          ...ctx,
          component: StateTaxesListContextual as ComponentType,
          state: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.CANCEL,
      'viewStateTaxes',
      reduce((ctx: StateTaxesContextInterface): StateTaxesContextInterface => ({
        ...ctx,
        component: StateTaxesListContextual as ComponentType,
        state: undefined,
      })),
    ),
  ),
  manageTaxRates: state<MachineTransition>(
    transition(
      componentEvents.CANCEL,
      'viewStateTaxes',
      reduce((ctx: StateTaxesContextInterface): StateTaxesContextInterface => ({
        ...ctx,
        component: StateTaxesListContextual as ComponentType,
        state: undefined,
      })),
    ),
  ),
}
