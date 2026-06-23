import type { Garnishment } from '@gusto/embedded-api-v-2026-02-01/models/components/garnishment'

/** @internal */
export interface DeductionAmountFormatters {
  formatCurrency: (value: number) => string
  formatPercent: (value: number) => string
  formatPerPaycheck: (value: string) => string
}

/** @internal */
export function formatDeductionAmount(
  deduction: Pick<Garnishment, 'amount' | 'deductAsPercentage' | 'recurring' | 'payPeriodMaximum'>,
  { formatCurrency, formatPercent, formatPerPaycheck }: DeductionAmountFormatters,
): string {
  const numericAmount = Number(deduction.amount)
  if (Number.isNaN(numericAmount)) return '-'

  // Child-support garnishments are always stored as `deductAsPercentage: true`,
  // but the percentage is optional — a user may withhold only a fixed dollar
  // amount (`payPeriodMaximum`). Rendering that as "0% per paycheck" is
  // misleading (SDK-945). When there's no percentage, show the dollar cap the
  // user actually entered, or "-" when neither is set.
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
