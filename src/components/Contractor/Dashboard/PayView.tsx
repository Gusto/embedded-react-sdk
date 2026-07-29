import { PaymentMethodCard } from '@/components/Contractor/PaymentMethod/management/PaymentMethodCard'
import { CompensationCard } from '@/components/Contractor/Compensation/management/CompensationCard'
import { Flex } from '@/components/Common/Flex/Flex'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

/**
 * Props for {@link PayView}.
 *
 * @internal
 */
export interface PayViewProps {
  /** The associated contractor identifier. */
  contractorId: string
  /** Event handler invoked when the inner Payment method and Compensation cards emit events. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Layout container for the Pay tab of the contractor dashboard.
 *
 * @remarks
 * Renders the Payment method and Compensation cards stacked vertically. Each
 * card is a self-fetching surface that owns its own data fetch and event
 * emission; this container only forwards `contractorId` and `onEvent`.
 *
 * @param props - See {@link PayViewProps}.
 * @returns The stacked card layout for the Pay tab.
 * @internal
 */
export function PayView({ contractorId, onEvent }: PayViewProps) {
  return (
    <Flex flexDirection="column" gap={24}>
      <PaymentMethodCard contractorId={contractorId} onEvent={onEvent} />
      <CompensationCard contractorId={contractorId} onEvent={onEvent} />
    </Flex>
  )
}
