import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { companyEvents } from '@/shared/constants'

export type EventPayloads = {
  [companyEvents.COMPANY_LOCATION_DONE]: undefined
  [companyEvents.COMPANY_LOCATION_EDIT]: { uuid: string }
  [companyEvents.COMPANY_LOCATION_CREATE]: undefined
}

export interface PaymentMethodContextInterface extends FlowContextInterface {
  companyId: string
  contractorId?: string
}
