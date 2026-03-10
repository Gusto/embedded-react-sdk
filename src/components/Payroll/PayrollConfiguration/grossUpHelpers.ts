import { OffCycleReasonType } from '@gusto/embedded-api/models/components/payroll'
import { COMPENSATION_NAME_BONUS, COMPENSATION_NAME_CORRECTION_PAYMENT } from '@/shared/constants'

const GROSS_UP_ELIGIBLE_REASONS = new Set<OffCycleReasonType>([
  OffCycleReasonType.Bonus,
  OffCycleReasonType.Correction,
])

export const isGrossUpEligible = (isOffCycle: boolean, offCycleReason?: string | null): boolean => {
  if (!isOffCycle || offCycleReason == null) return false
  return GROSS_UP_ELIGIBLE_REASONS.has(offCycleReason as OffCycleReasonType)
}

export const getGrossUpTargetCompensationName = (offCycleReason?: string | null): string | null => {
  if (offCycleReason === OffCycleReasonType.Bonus) return COMPENSATION_NAME_BONUS
  if (offCycleReason === OffCycleReasonType.Correction) return COMPENSATION_NAME_CORRECTION_PAYMENT
  return null
}
