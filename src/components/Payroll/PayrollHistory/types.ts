import type { PayrollType } from '../types'

export type PayrollHistoryStatus =
  | 'Unprocessed'
  | 'Submitted'
  | 'Pending'
  | 'Paid'
  | 'Complete'
  | 'In progress'

export type TimeFilterOption = '3months' | '6months' | 'year'

export interface PayrollHistoryItem {
  id: string
  payPeriod: string
  type: PayrollType
  payDate: string
  status: PayrollHistoryStatus
  amount?: number
}
