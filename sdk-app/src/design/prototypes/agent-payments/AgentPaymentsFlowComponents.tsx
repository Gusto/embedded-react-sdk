import { mockAgentPayments } from './agentPaymentsMockData'
import { AgentPaymentsList } from './AgentPaymentsList'
import { AgentPaymentDetail } from './AgentPaymentDetail'
import { agentPaymentsEvents } from './events'
import type { BaseComponentInterface } from '@/components/Base'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { EventType } from '@/shared/constants'

export interface AgentPaymentsFlowProps extends BaseComponentInterface {
  companyId: string
}

export interface AgentPaymentsFlowContextInterface extends FlowContextInterface {
  companyId?: string
  selectedPaymentUuid: string | null
}

export function AgentPaymentsListContextual() {
  const { onEvent } = useFlow<AgentPaymentsFlowContextInterface>()

  return (
    <AgentPaymentsList
      payments={mockAgentPayments}
      onSelectPayment={uuid => {
        onEvent(agentPaymentsEvents.AGENT_PAYMENT_SELECTED as EventType, uuid)
      }}
    />
  )
}

export function AgentPaymentDetailContextual() {
  const { onEvent, selectedPaymentUuid } = useFlow<AgentPaymentsFlowContextInterface>()
  const uuid = ensureRequired(selectedPaymentUuid)
  const payment = mockAgentPayments.find(p => p.uuid === uuid)

  if (!payment) return null

  return (
    <AgentPaymentDetail
      payment={payment}
      onBack={() => {
        onEvent(agentPaymentsEvents.AGENT_PAYMENT_BACK as EventType)
      }}
    />
  )
}
