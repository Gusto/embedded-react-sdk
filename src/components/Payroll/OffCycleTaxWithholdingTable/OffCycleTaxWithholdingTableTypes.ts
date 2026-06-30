import { WithholdingPayPeriod } from '@gusto/embedded-api-v-2026-06-15/models/operations/postv1companiescompanyidpayrolls'
import type { WithholdingType } from '@/components/Payroll/OffCycleReasonSelection'

/** @internal */
export const WITHHOLDING_PAY_PERIOD_I18N_KEY = {
  [WithholdingPayPeriod.EveryWeek]: 'payPeriodFrequency.everyWeek',
  [WithholdingPayPeriod.EveryOtherWeek]: 'payPeriodFrequency.everyOtherWeek',
  [WithholdingPayPeriod.TwicePerMonth]: 'payPeriodFrequency.twicePerMonth',
  [WithholdingPayPeriod.Monthly]: 'payPeriodFrequency.monthly',
  [WithholdingPayPeriod.Quarterly]: 'payPeriodFrequency.quarterly',
  [WithholdingPayPeriod.Semiannually]: 'payPeriodFrequency.semiannually',
  [WithholdingPayPeriod.Annually]: 'payPeriodFrequency.annually',
} as const

/** @internal */
export const WAGE_TYPE_CATEGORIES = ['regular', 'supplemental', 'reimbursement'] as const
/** @internal */
export type WageTypeCategory = (typeof WAGE_TYPE_CATEGORIES)[number]

/** @internal */
export interface WageTypeGroup {
  /** Wage type grouping this row represents. */
  category: WageTypeCategory
  /** Display label for the wage type group. */
  label: string
  /** Optional supporting text shown beneath the label. */
  description?: string
}

/** @internal */
export interface OffCycleTaxWithholdingConfig {
  /** Pay period frequency used to compute regular withholding. */
  withholdingPayPeriod: WithholdingPayPeriod
  /** Whether supplemental wages are taxed at the regular or supplemental rate. */
  withholdingRate: WithholdingType
}

/** @internal */
export interface OffCycleTaxWithholdingTableProps {
  /** Wage type groups to render as rows in the table. */
  wageTypeGroups: WageTypeGroup[]
  /** Withholding configuration that determines how each row is taxed. */
  config: OffCycleTaxWithholdingConfig
  /** Invoked when the user clicks the edit button in the table header. */
  onEditClick: () => void
}
