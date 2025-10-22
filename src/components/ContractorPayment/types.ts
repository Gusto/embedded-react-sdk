import type { components } from '@/types/schema'

export type ContractorPaymentGroup = components['schemas']['Contractor-Payment-Group']
export type ContractorPaymentForGroup = components['schemas']['Contractor-Payment-For-Group']
export type ContractorPaymentGroupMinimal =
  components['schemas']['Contractor-Payment-Group-Minimal']

export interface ContractorPaymentGroupTotals {
  amount?: string
  debitAmount?: string
  wageAmount?: string
  reimbursementAmount?: string
}
