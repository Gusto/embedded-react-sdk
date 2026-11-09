import { Flex } from '@/components/Common/Flex/Flex'
import { IndustryCard } from '@/components/Company/Industry/management/IndustryCard'
import { LocationsCard } from '@/components/Company/Locations/management/LocationsCard'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link CompanyDetailsView}.
 *
 * @internal
 */
export interface CompanyDetailsViewProps {
  /** The associated company identifier. */
  companyId: string
  /** Event handler invoked when the inner Industry and Locations cards emit events. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator forwarded to each card. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Layout container for the Company details tab of the company settings dashboard.
 *
 * @remarks
 * Renders the Industry and Locations cards stacked vertically. Each card is a
 * self-fetching surface that owns its own data fetch and event emission; this
 * container only forwards `companyId` and `onEvent`.
 *
 * @param props - See {@link CompanyDetailsViewProps}.
 * @returns The stacked card layout for the Company details tab.
 * @internal
 */
export function CompanyDetailsView({
  companyId,
  onEvent,
  LoaderComponent,
}: CompanyDetailsViewProps) {
  return (
    <Flex flexDirection="column" gap={24}>
      <IndustryCard companyId={companyId} onEvent={onEvent} LoaderComponent={LoaderComponent} />
      <LocationsCard companyId={companyId} onEvent={onEvent} LoaderComponent={LoaderComponent} />
    </Flex>
  )
}
