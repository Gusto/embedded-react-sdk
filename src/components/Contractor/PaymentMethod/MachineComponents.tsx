import { PaymentMethodSelection } from './PaymentMethodSelection/PaymentMethodSelection'
import type { PaymentMethodContextInterface } from './types'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useFlow } from '@/components/Flow/useFlow'

export function PaymentMethodSelectionContextual() {
  const { contractorId, onEvent } = useFlow<PaymentMethodContextInterface>()
  return <PaymentMethodSelection contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}
// export function LocationFormContextual() {
//   const { onEvent, locationId, companyId } = useFlow<LocationsContextInterface>()
//   return (
//     <LocationForm companyId={ensureRequired(companyId)} locationId={locationId} onEvent={onEvent} />
//   )
// }
