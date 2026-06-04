import { ProfileCard } from '@/components/Employee/Profile/management/ProfileCard'
import { HomeAddressCard } from '@/components/Employee/HomeAddress/management/HomeAddressCard'
import { WorkAddressCard } from '@/components/Employee/WorkAddress/management/WorkAddressCard'
import { Flex } from '@/components/Common/Flex/Flex'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

export interface BasicDetailsViewProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Tab-mounted container for the Basic details tab. After the Profile,
 * Home address, and Work address cards moved to standalone
 * self-fetching surfaces, this container is just a layout wrapper —
 * each card owns its own data fetch and event emission.
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
