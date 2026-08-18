import { ProfileCard } from '@/components/Contractor/Profile/management/ProfileCard'
import { AddressCard } from '@/components/Contractor/Address/management/AddressCard'
import { Flex } from '@/components/Common/Flex/Flex'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

/**
 * Props for {@link DetailsView}.
 *
 * @internal
 */
export interface DetailsViewProps {
  /** The associated contractor identifier. */
  contractorId: string
  /** Event handler invoked when the inner Profile and Address cards emit events. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Layout container for the Details tab of the contractor dashboard.
 *
 * @remarks
 * Renders the Profile and Address cards stacked vertically. Each card is a
 * self-fetching surface that owns its own data fetch and event emission;
 * this container only forwards `contractorId` and `onEvent`.
 *
 * @param props - See {@link DetailsViewProps}.
 * @returns The stacked card layout for the Details tab.
 * @internal
 */
export function DetailsView({ contractorId, onEvent }: DetailsViewProps) {
  return (
    <Flex flexDirection="column" gap={24}>
      <ProfileCard contractorId={contractorId} onEvent={onEvent} />
      <AddressCard contractorId={contractorId} onEvent={onEvent} />
    </Flex>
  )
}
