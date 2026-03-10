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

export const WAGE_TYPE_CATEGORIES = ['regular', 'supplemental', 'reimbursement'] as const
export type WageTypeCategory = (typeof WAGE_TYPE_CATEGORIES)[number]

export interface WageTypeGroup {
  category: WageTypeCategory
  label: string
  description?: string
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
