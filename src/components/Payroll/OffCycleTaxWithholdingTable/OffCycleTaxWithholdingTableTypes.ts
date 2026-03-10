import { WithholdingPayPeriod } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import type { WithholdingType } from '@/components/Payroll/OffCycleReasonSelection'

export const WITHHOLDING_PAY_PERIOD_I18N_KEY = {
  [WithholdingPayPeriod.EveryWeek]: 'payPeriodFrequency.everyWeek',
  [WithholdingPayPeriod.EveryOtherWeek]: 'payPeriodFrequency.everyOtherWeek',
  [WithholdingPayPeriod.TwicePerMonth]: 'payPeriodFrequency.twicePerMonth',
  [WithholdingPayPeriod.Monthly]: 'payPeriodFrequency.monthly',
  [WithholdingPayPeriod.Quarterly]: 'payPeriodFrequency.quarterly',
  [WithholdingPayPeriod.Semiannually]: 'payPeriodFrequency.semiannually',
  [WithholdingPayPeriod.Annually]: 'payPeriodFrequency.annually',
} as const

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
