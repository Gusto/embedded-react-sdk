import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { isChildSupport } from './isChildSupport'

/** @internal */
export interface DeductionAmountFormatters {
  formatCurrency: (value: number) => string
  formatPercent: (value: number) => string
  formatPerPaycheck: (value: string) => string
}

/** @internal */
export function formatDeductionAmount(
  deduction: Pick<
    Garnishment,
    | 'amount'
    | 'deductAsPercentage'
    | 'recurring'
    | 'payPeriodMaximum'
    | 'childSupport'
    | 'garnishmentType'
  >,
  { formatCurrency, formatPercent, formatPerPaycheck }: DeductionAmountFormatters,
): string {
  if (isChildSupport(deduction)) {
    const dollarAmount = Number(deduction.payPeriodMaximum)
    if (Number.isFinite(dollarAmount) && dollarAmount > 0) return formatCurrency(dollarAmount)

    const percentage = Number(deduction.amount)
    return Number.isFinite(percentage) && percentage > 0 ? formatPercent(percentage) : '-'
  }

  const numericAmount = Number(deduction.amount)
  if (Number.isNaN(numericAmount)) return '-'

  if (deduction.deductAsPercentage && numericAmount === 0) {
    const cap = Number(deduction.payPeriodMaximum ?? 0)
    if (!Number.isNaN(cap) && cap > 0) {
      const capFormatted = formatCurrency(cap)
      return deduction.recurring ? formatPerPaycheck(capFormatted) : capFormatted
    }
    return '-'
  }

  const formatted = deduction.deductAsPercentage
    ? formatPercent(numericAmount)
    : formatCurrency(numericAmount)
  return deduction.recurring ? formatPerPaycheck(formatted) : formatted
}
