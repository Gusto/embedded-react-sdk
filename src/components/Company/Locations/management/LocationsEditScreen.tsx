import { createMachine } from 'robot3'
import { useMemo } from 'react'
import type { LocationsContextInterface } from '../shared/locationsComponents'
import { createLocationsMachine } from '../shared/locationsMachine'
import { LocationsManagementListContextual } from './LocationsManagementComponents'
import { translateEvents } from '@/components/Company/shared/translateEvents'
import { Flow } from '@/components/Flow/Flow'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Props for {@link LocationsEditScreen}.
 *
 * @internal
 */
export interface LocationsEditScreenProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the screen emits an event. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * The address list, add and edit screens as a single management surface.
 *
 * @remarks
 * Mounted by both management orchestrators — the {@link Locations} block and
 * `CompanyManagement.DashboardFlow` — so the translation to
 * `company/management/locations/updated` lives in one place that both reach.
 *
 * Opens on the Add-only list rather than the onboarding one, which is what makes
 * `company/location/done` unnecessary here: there is no Continue to raise it.
 *
 * Both save events map to the same management event. A company usually adds several addresses
 * in one visit, so the hosting machine treats that event as "stay" rather than "leave" — see
 * the block's machine.
 *
 * The inner `CANCEL` that returns the add/edit form to the list stays inside this `Flow`.
 * `Flow` re-emits it upward, which is precisely why no hosting machine may declare a `CANCEL`
 * transition.
 *
 * @param props - See {@link LocationsEditScreenProps}.
 * @returns The locations sub-flow wired for a management surface.
 * @internal
 */
export function LocationsEditScreen({ companyId, onEvent }: LocationsEditScreenProps) {
  const machine = useMemo(
    () =>
      createMachine(
        'index',
        createLocationsMachine(LocationsManagementListContextual),
        (initialContext: LocationsContextInterface) => ({
          ...initialContext,
          component: LocationsManagementListContextual,
          companyId,
        }),
      ),
    [companyId],
  )

  return (
    <Flow
      machine={machine}
      onEvent={translateEvents(onEvent, {
        [componentEvents.COMPANY_LOCATION_CREATED]:
          componentEvents.COMPANY_MANAGEMENT_LOCATIONS_UPDATED,
        [componentEvents.COMPANY_LOCATION_UPDATED]:
          componentEvents.COMPANY_MANAGEMENT_LOCATIONS_UPDATED,
      })}
    />
  )
}
