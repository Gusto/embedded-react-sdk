import type { WithholdingType } from '@/components/Payroll/OffCycleReasonSelection'

export type PayPeriodFrequency =
  | 'daily'
  | 'every_week'
  | 'every_other_week'
  | 'twice_per_month'
  | 'monthly'
  | 'quarterly'
  | 'semiannually'
  | 'annually'

export interface WageTypeGroup {
  id: string
  label: string
  description?: string
  category: 'regular' | 'supplemental' | 'reimbursement'
}

export interface OffCycleTaxWithholdingConfig {
  payPeriodFrequency: PayPeriodFrequency
  withholdingRate: WithholdingType
}

export interface OffCycleTaxWithholdingTableProps {
  wageTypeGroups: WageTypeGroup[]
  config: OffCycleTaxWithholdingConfig
  onEditClick: () => void
}
