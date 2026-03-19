import { OffCycleReasonType } from '@gusto/embedded-api/models/components/payroll'

export const PayrollCategory = {
  Regular: 'Regular',
  External: 'External',
  Bonus: OffCycleReasonType.Bonus,
  Correction: OffCycleReasonType.Correction,
  Dismissal: OffCycleReasonType.DismissedEmployee,
  HiredEmployee: OffCycleReasonType.HiredEmployee,
  Transition: OffCycleReasonType.TransitionFromOldPaySchedule,
  BenefitReversal: OffCycleReasonType.BenefitReversal,
  WageCorrection: OffCycleReasonType.WageCorrection,
  TaxReconciliation: OffCycleReasonType.TaxReconciliation,
  Reversal: OffCycleReasonType.Reversal,
  DisabilityInsurance: OffCycleReasonType.DisabilityInsuranceDistribution,
} as const

export type PayrollCategory = (typeof PayrollCategory)[keyof typeof PayrollCategory]

const VALID_PAYROLL_CATEGORIES = new Set<string>(Object.values(PayrollCategory))

export function derivePayrollCategory(payroll: {
  offCycle?: boolean
  offCycleReason?: string | null
  external?: boolean
}): PayrollCategory {
  if (payroll.external) return PayrollCategory.External
  if (
    payroll.offCycle &&
    payroll.offCycleReason &&
    VALID_PAYROLL_CATEGORIES.has(payroll.offCycleReason)
  ) {
    return payroll.offCycleReason as PayrollCategory
  }
  return PayrollCategory.Regular
}

export function isOffCyclePayroll(category: PayrollCategory): boolean {
  return category !== PayrollCategory.Regular && category !== PayrollCategory.External
}
