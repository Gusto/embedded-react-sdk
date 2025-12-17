import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { firstLastName } from '@/helpers/formattedStrings'

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
