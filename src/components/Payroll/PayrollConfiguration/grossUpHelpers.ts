import { PayrollCategory } from '../payrollTypes'
import { COMPENSATION_NAME_BONUS, COMPENSATION_NAME_CORRECTION_PAYMENT } from '@/shared/constants'

const GROSS_UP_ELIGIBLE_CATEGORIES = new Set<PayrollCategory>([
  PayrollCategory.Bonus,
  PayrollCategory.Correction,
])

export const isGrossUpEligible = (payrollCategory: PayrollCategory): boolean => {
  return GROSS_UP_ELIGIBLE_CATEGORIES.has(payrollCategory)
}

export const getGrossUpTargetCompensationName = (
  payrollCategory: PayrollCategory,
): string | null => {
  if (payrollCategory === PayrollCategory.Bonus) return COMPENSATION_NAME_BONUS
  if (payrollCategory === PayrollCategory.Correction) return COMPENSATION_NAME_CORRECTION_PAYMENT
  return null
}
