import { LocationForm } from '../LocationForm/LocationForm'
import type { companyEvents } from '@/shared/constants'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export type EventPayloads = {
  [companyEvents.COMPANY_LOCATION_DONE]: undefined
  [companyEvents.COMPANY_LOCATION_EDIT]: { uuid: string }
  [companyEvents.COMPANY_LOCATION_CREATE]: undefined
}

/** @internal */
export interface LocationsContextInterface extends FlowContextInterface {
  companyId: string
  locationId?: string
}

/**
 * The create/edit address form, shared by both surfaces.
 *
 * @remarks
 * Onboarding and management differ only in their list screen; the form behind it is the same
 * in both, including its own Cancel.
 *
 * @internal
 */
export function LocationFormContextual() {
  const { onEvent, locationId, companyId } = useFlow<LocationsContextInterface>()
  return (
    <LocationForm companyId={ensureRequired(companyId)} locationId={locationId} onEvent={onEvent} />
  )
}
