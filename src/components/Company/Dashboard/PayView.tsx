import { Flex } from '@/components/Common/Flex/Flex'
import { BankAccountCard } from '@/components/Company/BankAccount/management/BankAccountCard'
import { PaySchedulesCard } from '@/components/Company/PaySchedule/management/PaySchedulesCard'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
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
 * container only forwards `companyId` and `onEvent`.
 *
 * The Pay schedules card is omitted unless the `managePaySchedules` unstable
 * feature flag is on, because the screen its Manage button routes to —
 * `CompanyManagement.PaySchedule` — throws without that flag. Omitting the card
 * keeps the route unreachable rather than letting it lead somewhere that
 * throws, and leaves the tab rendering the Bank account card alone.
 *
 * @param props - See {@link PayViewProps}.
 * @returns The stacked card layout for the Pay tab.
 * @internal
 */
export function PayView({ companyId, onEvent, LoaderComponent }: PayViewProps) {
  const canManagePaySchedules = useUnstableFeature('managePaySchedules')

  return (
    <Flex flexDirection="column" gap={24}>
      {canManagePaySchedules && (
        <PaySchedulesCard
          companyId={companyId}
          onEvent={onEvent}
          LoaderComponent={LoaderComponent}
        />
      )}
      <BankAccountCard companyId={companyId} onEvent={onEvent} LoaderComponent={LoaderComponent} />
    </Flex>
  )
}
