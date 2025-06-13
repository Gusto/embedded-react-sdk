import { reduce, state, state as final, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { StateTaxesContextInterface } from './StateTaxesComponents'
import { StateTaxesFormContextual, StateTaxesListContextual } from './StateTaxesComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.COMPANY_STATE_TAX_UPDATED]: undefined
  [componentEvents.COMPANY_STATE_TAX_EDIT]: { state: string }
}

export const stateTaxesStateMachine = {
  viewStateTaxes: state(
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
    transition(componentEvents.COMPANY_STATE_TAX_DONE, 'done'),
  ),
  editStateTaxes: state(
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
      reduce(
        (ctx: StateTaxesContextInterface): StateTaxesContextInterface => ({
          ...ctx,
          component: StateTaxesListContextual as ComponentType,
          state: undefined,
        }),
      ),
    ),
  ),
  done: final(),
}
