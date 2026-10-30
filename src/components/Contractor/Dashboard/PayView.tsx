import { PaymentMethodCard } from '@/components/Contractor/PaymentMethod/management/PaymentMethodCard'
import { CompensationCard } from '@/components/Contractor/Compensation/management/CompensationCard'
import { PaymentsCard } from '@/components/Contractor/Payments/management/PaymentsCard'
import { Flex } from '@/components/Common/Flex/Flex'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link PayView}.
 *
 * @internal
 */
export interface PayViewProps {
  /** The associated contractor identifier. */
  contractorId: string
  /** Event handler invoked when the inner Payment method, Compensation, and Recent payments cards emit events. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator forwarded to each card. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Layout container for the Pay tab of the contractor dashboard.
 *
 * @remarks
 * Renders the Payment method, Compensation, and Recent payments cards stacked
 * vertically. Each card is a self-fetching surface that owns its own data fetch
 * and event emission; this container only forwards `contractorId`, `onEvent`,
 * and `LoaderComponent`.
 *
 * @param props - See {@link PayViewProps}.
 * @returns The stacked card layout for the Pay tab.
 * @internal
 */
export function PayView({ contractorId, onEvent, LoaderComponent }: PayViewProps) {
  return (
    <Flex flexDirection="column" gap={24}>
      <PaymentMethodCard
        contractorId={contractorId}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
      <CompensationCard
        contractorId={contractorId}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
      <PaymentsCard
        contractorId={contractorId}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
    </Flex>
  )
}
