import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { CONTRACTOR_TYPE } from '@/shared/constants'
import { firstLastName } from '@/helpers/formattedStrings'

export function contractorName(contractor: Contractor) {
  return contractor.type === CONTRACTOR_TYPE.BUSINESS
    ? (contractor.businessName ?? '')
    : firstLastName({
        first_name: contractor.firstName,
        last_name: contractor.lastName,
      })
}
