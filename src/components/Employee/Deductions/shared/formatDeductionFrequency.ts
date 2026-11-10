import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import type { PaymentPeriod } from '@gusto/embedded-api/models/components/garnishmentchildsupport'
import { isChildSupport } from './isChildSupport'

interface FrequencyLabels {
  recurring: string
  oneTime: string
  paymentPeriods: {
    everyWeek: string
    everyOtherWeek: string
    twicePerMonth: string
    monthly: string
  }
}

const paymentPeriodKeys = {
  'Every week': 'everyWeek',
  'Every other week': 'everyOtherWeek',
  'Twice per month': 'twicePerMonth',
  Monthly: 'monthly',
} as const satisfies Record<PaymentPeriod, keyof FrequencyLabels['paymentPeriods']>

/**
 * Formats the order frequency for child support or recurrence for other deductions.
 *
 * @param deduction - The deduction whose frequency is displayed.
 * @param labels - Translated frequency labels supplied by the rendering component.
 * @returns The frequency label, or a placeholder when the order period is missing.
 * @internal
 */
export function formatDeductionFrequency(
  deduction: Pick<Garnishment, 'garnishmentType' | 'childSupport' | 'recurring'>,
  labels: FrequencyLabels,
): string {
  if (isChildSupport(deduction)) {
    const paymentPeriod = deduction.childSupport?.paymentPeriod
    return paymentPeriod ? labels.paymentPeriods[paymentPeriodKeys[paymentPeriod]] : '-'
  }
  return deduction.recurring ? labels.recurring : labels.oneTime
}
