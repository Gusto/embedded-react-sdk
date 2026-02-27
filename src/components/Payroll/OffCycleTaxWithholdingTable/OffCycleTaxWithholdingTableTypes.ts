import type { WithholdingPayPeriod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import type { WithholdingType } from '@/components/Payroll/OffCycleReasonSelection'

export interface WageTypeGroup {
  id: string
  label: string
  description?: string
  category: 'regular' | 'supplemental' | 'reimbursement'
}

export interface OffCycleTaxWithholdingConfig {
  withholdingPayPeriod: WithholdingPayPeriod
  withholdingRate: WithholdingType
}

export interface OffCycleTaxWithholdingTableProps {
  wageTypeGroups: WageTypeGroup[]
  config: OffCycleTaxWithholdingConfig
  onEditClick: () => void
}
