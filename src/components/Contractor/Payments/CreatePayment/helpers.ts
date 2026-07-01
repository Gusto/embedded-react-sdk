import type { Contractor } from '@gusto/embedded-api-v-2026-02-01/models/components/contractor'
import { firstLastName } from '@/helpers/formattedStrings'

/** @internal */
export const getContractorDisplayName = (contractor?: Contractor): string => {
  if (!contractor) {
    return ''
  }
  if (contractor.type === 'Individual') {
    return firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName })
  } else {
    return contractor.businessName || ''
  }
}
