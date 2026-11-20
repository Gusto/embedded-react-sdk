import { LocationsList } from '../LocationsList'
import type { LocationsContextInterface } from '../shared/locationsComponents'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * The onboarding address list.
 *
 * @remarks
 * Renders `LocationsList` with its default children, which include the Continue button that
 * advances the onboarding flow. The management list variant omits that button.
 *
 * @internal
 */
export function LocationsListContextual() {
  const { companyId, onEvent } = useFlow<LocationsContextInterface>()
  return <LocationsList companyId={ensureRequired(companyId)} onEvent={onEvent} />
}
