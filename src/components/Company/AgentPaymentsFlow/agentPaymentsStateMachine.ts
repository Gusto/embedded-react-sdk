import { transition, reduce, state } from 'robot3'
import {
  AgentPaymentsListContextual,
  AgentPaymentDetailContextual,
  type AgentPaymentsFlowContextInterface,
} from './AgentPaymentsFlowComponents'
import { agentPaymentsEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const createReducer = (props: Partial<AgentPaymentsFlowContextInterface>) => {
  return (ctx: AgentPaymentsFlowContextInterface): AgentPaymentsFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

export const agentPaymentsMachine = {
  list: state<MachineTransition>(
    transition(
      agentPaymentsEvents.AGENT_PAYMENT_SELECTED,
      'detail',
      reduce((ctx: AgentPaymentsFlowContextInterface, event: { payload: string }) =>
        createReducer({
          component: AgentPaymentDetailContextual,
          selectedPaymentUuid: event.payload,
          header: { type: 'minimal' },
        })(ctx),
      ),
    ),
  ),
  detail: state<MachineTransition>(
    transition(
      agentPaymentsEvents.AGENT_PAYMENT_BACK,
      'list',
      reduce(
        createReducer({
          component: AgentPaymentsListContextual,
          selectedPaymentUuid: null,
          header: null,
        }),
      ),
    ),
  ),
}
