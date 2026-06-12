import { ProfileCard } from '@/components/Employee/Profile/management/ProfileCard'
import { HomeAddressCard } from '@/components/Employee/HomeAddress/management/HomeAddressCard'
import { WorkAddressCard } from '@/components/Employee/WorkAddress/management/WorkAddressCard'
import { Flex } from '@/components/Common/Flex/Flex'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

/**
 * Props for {@link BasicDetailsView}.
 *
 * @internal
 */
export interface BasicDetailsViewProps {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler invoked when the inner Profile, Home address, and Work address cards emit events. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Layout container for the Basic details tab of the employee dashboard.
 *
 * @remarks
 * Renders the Profile, Home address, and Work address cards stacked
 * vertically. Each card is a self-fetching surface that owns its own data
 * fetch and event emission; this container only forwards `employeeId` and
 * `onEvent`.
 *
 * @param props - See {@link BasicDetailsViewProps}.
 * @returns The stacked card layout for the Basic details tab.
 * @internal
 */
export function BasicDetailsView({ employeeId, onEvent }: BasicDetailsViewProps) {
  return (
    <Flex flexDirection="column" gap={24}>
      <ProfileCard employeeId={employeeId} onEvent={onEvent} />

      <HomeAddressCard employeeId={employeeId} onEvent={onEvent} />

      <WorkAddressCard employeeId={employeeId} onEvent={onEvent} />
    </Flex>
  )
}
