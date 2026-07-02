import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { type LocationsContextInterface } from './locationsStateMachine'
import { locationsStateMachine } from './stateMachine'
import { LocationsListContextual } from './locationsStateMachine'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

/**
 * Props for the {@link Locations} component.
 *
 * @public
 */
export interface LocationsProps extends BaseComponentInterface<'Company.Locations'> {
  /** Identifier of the company whose locations are being managed. */
  companyId: string
}

/**
 * Orchestrated component for managing a company's mailing and filing addresses.
 *
 * @remarks
 * Internally switches between a list view and a create/edit form. For more granular control,
 * use the standalone `LocationForm` component directly.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/location/add` | A user chooses to add a new location | — |
 * | `company/location/add/done` | A new location is created | Response from the create company location API |
 * | `company/location/edit` | A user selects an existing location for editing | `{ uuid: string }` |
 * | `company/location/edit/done` | A location is successfully edited | Response from the update location API |
 * | `company/location/done` | A user chooses to proceed to the next step | — |
 * | `cancel` | A user cancels the create or edit form | — |
 *
 * @param props - See {@link LocationsProps}.
 * @returns The Locations flow element.
 * @public
 */
export function Locations({ companyId, onEvent, dictionary }: LocationsProps) {
  useComponentDictionary('Company.Locations', dictionary)

  const manageLocations = useMemo(
    () =>
      createMachine(
        'index',
        locationsStateMachine,
        (initialContext: LocationsContextInterface) => ({
          ...initialContext,
          component: LocationsListContextual,
          companyId,
        }),
      ),
    [companyId],
  )
  return <Flow machine={manageLocations} onEvent={onEvent} />
}
