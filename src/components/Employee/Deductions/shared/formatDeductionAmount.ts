import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'

export interface DeductionAmountFormatters {
  formatCurrency: (value: number) => string
  formatPercent: (value: number) => string
  formatPerPaycheck: (value: string) => string
}

export function formatDeductionAmount(
  deduction: Pick<Garnishment, 'amount' | 'deductAsPercentage' | 'recurring'>,
  { formatCurrency, formatPercent, formatPerPaycheck }: DeductionAmountFormatters,
): string {
  const numericAmount = Number(deduction.amount)
  if (Number.isNaN(numericAmount)) return '-'
  const formatted = deduction.deductAsPercentage
    ? formatPercent(numericAmount)
    : formatCurrency(numericAmount)
  return deduction.recurring ? formatPerPaycheck(formatted) : formatted
}
