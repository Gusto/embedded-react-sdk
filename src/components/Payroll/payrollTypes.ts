import { OffCycleReasonType } from '@gusto/embedded-api-v-2025-11-15/models/components/payroll'
import type { Department } from '@gusto/embedded-api-v-2025-11-15/models/components/department'

/**
 * The department a payroll is scoped to, when departmental payroll is enabled.
 *
 * @internal
 */
export type PayrollDepartment = Department

/**
 * Enum-like map of payroll categories combining `Regular`, `External`, and every off-cycle reason.
 *
 * @internal
 */
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

/**
 * Union of payroll category string values from {@link PayrollCategory}.
 *
 * @internal
 */
export type PayrollCategory = (typeof PayrollCategory)[keyof typeof PayrollCategory]

const VALID_PAYROLL_CATEGORIES = new Set<string>(Object.values(PayrollCategory))

/**
 * Derives a {@link PayrollCategory} from a payroll's `external`, `offCycle`, and `offCycleReason` flags.
 *
 * @param payroll - The payroll whose category to derive.
 * @returns The matching category, falling back to `Regular` when nothing else applies.
 * @internal
 */
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

/**
 * Returns whether a payroll category represents an off-cycle payroll.
 *
 * @param category - The payroll category to check.
 * @returns `true` for any category other than `Regular` or `External`.
 * @internal
 */
export function isOffCyclePayroll(category: PayrollCategory): boolean {
  return category !== PayrollCategory.Regular && category !== PayrollCategory.External
}
