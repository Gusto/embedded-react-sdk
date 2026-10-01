import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { firstLastName } from '@/helpers/formattedStrings'
import { CONTRACTOR_TYPE } from '@/shared/constants'

/** @internal */
export function contractorDisplayName(contractor: Contractor): string {
  return contractor.type === CONTRACTOR_TYPE.BUSINESS
    ? (contractor.businessName ?? '')
    : firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName })
}
