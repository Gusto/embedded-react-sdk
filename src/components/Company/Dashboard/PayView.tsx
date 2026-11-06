import { Flex } from '@/components/Common/Flex/Flex'
import { BankAccountCard } from '@/components/Company/BankAccount/management/BankAccountCard'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link PayView}.
 *
 * @internal
 */
export interface PayViewProps {
  /** The associated company identifier. */
  companyId: string
  /** Event handler invoked when the inner cards emit events. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator forwarded to each card. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Layout container for the Pay tab of the company settings dashboard.
 *
 * @remarks
 * Renders the company's pay-related cards stacked vertically. Each card is a
 * self-fetching surface that owns its own data fetch and event emission; this
 * container only forwards `companyId` and `onEvent`. The Pay schedules card
 * will join this tab gated on the `managePaySchedules` flag.
 *
 * @param props - See {@link PayViewProps}.
 * @returns The stacked card layout for the Pay tab.
 * @internal
 */
export function PayView({ companyId, onEvent, LoaderComponent }: PayViewProps) {
  return (
    <Flex flexDirection="column" gap={24}>
      <BankAccountCard companyId={companyId} onEvent={onEvent} LoaderComponent={LoaderComponent} />
    </Flex>
  )
}
