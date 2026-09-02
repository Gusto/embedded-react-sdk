import { AgentPaymentsList } from './AgentPaymentsList'
import { AgentPaymentDetail } from './AgentPaymentDetail'
import { agentPaymentsEvents } from './events'
import { useTaxPaymentsList, useTaxPayment } from './useTaxPayments'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
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

function LoadingState() {
  const { LoadingSpinner } = useComponentContext()
  return (
    <Flex justifyContent="center">
      <LoadingSpinner />
    </Flex>
  )
}

function ErrorState({ message }: { message: string }) {
  const { Alert, Text } = useComponentContext()
  return (
    <Alert status="error" label="Couldn’t load tax payments">
      <Text size="sm">{message}</Text>
    </Alert>
  )
}

export function AgentPaymentsListContextual() {
  const { onEvent, companyId } = useFlow<AgentPaymentsFlowContextInterface>()
  const { data, isPending, error } = useTaxPaymentsList(ensureRequired(companyId))

  if (isPending) return <LoadingState />
  if (error) return <ErrorState message={error.message} />

  return (
    <AgentPaymentsList
      payments={data}
      onSelectPayment={uuid => {
        onEvent(agentPaymentsEvents.AGENT_PAYMENT_SELECTED as EventType, uuid)
      }}
    />
  )
}

export function AgentPaymentDetailContextual() {
  const { onEvent, companyId, selectedPaymentUuid } = useFlow<AgentPaymentsFlowContextInterface>()
  const { data, isPending, error } = useTaxPayment(
    ensureRequired(companyId),
    selectedPaymentUuid ?? '',
  )

  const onBack = () => {
    onEvent(agentPaymentsEvents.AGENT_PAYMENT_BACK as EventType)
  }

  if (!selectedPaymentUuid) return null
  if (isPending) return <LoadingState />
  if (error) return <ErrorState message={error.message} />

  return <AgentPaymentDetail payment={data} onBack={onBack} />
}
