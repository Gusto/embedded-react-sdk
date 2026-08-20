import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { agentPaymentsMachine } from './agentPaymentsStateMachine'
import type {
  AgentPaymentsFlowProps,
  AgentPaymentsFlowContextInterface,
} from './AgentPaymentsFlowComponents'
import { AgentPaymentsListContextual } from './AgentPaymentsFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const AgentPaymentsFlow = ({ companyId, onEvent }: AgentPaymentsFlowProps) => {
  const machine = useMemo(
    () =>
      createMachine(
        'list',
        agentPaymentsMachine,
        (initialContext: AgentPaymentsFlowContextInterface) => ({
          ...initialContext,
          component: AgentPaymentsListContextual,
          companyId,
          selectedPaymentUuid: null,
          header: null,
        }),
      ),
    [companyId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
