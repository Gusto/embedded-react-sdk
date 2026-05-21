import { describe, expect, it, vi } from 'vitest'
import type { Garnishment } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import { formatDeductionAmount } from './formatDeductionAmount'

const formatters = {
  formatCurrency: (n: number) => `$${n.toFixed(2)}`,
  formatPercent: (n: number) => `${n}%`,
  formatPerPaycheck: (value: string) => `${value} per paycheck`,
}

const baseDeduction: Pick<Garnishment, 'amount' | 'deductAsPercentage' | 'recurring'> = {
  amount: '50',
  deductAsPercentage: false,
  recurring: false,
}

describe('formatDeductionAmount', () => {
  it('formats a one-time fixed-dollar deduction as currency without suffix', () => {
    expect(formatDeductionAmount(baseDeduction, formatters)).toBe('$50.00')
  })

  it('formats a recurring fixed-dollar deduction with per-paycheck suffix', () => {
    expect(formatDeductionAmount({ ...baseDeduction, recurring: true }, formatters)).toBe(
      '$50.00 per paycheck',
    )
  })

  it('formats a one-time percentage deduction as percent without suffix', () => {
    expect(
      formatDeductionAmount(
        { ...baseDeduction, amount: '5', deductAsPercentage: true },
        formatters,
      ),
    ).toBe('5%')
  })

  it('formats a recurring percentage deduction as percent with per-paycheck suffix', () => {
    expect(
      formatDeductionAmount({ amount: '5', deductAsPercentage: true, recurring: true }, formatters),
    ).toBe('5% per paycheck')
  })

  it('returns "-" when amount is missing', () => {
    expect(formatDeductionAmount({ ...baseDeduction, amount: undefined }, formatters)).toBe('-')
  })

  it('returns "-" when amount cannot be parsed as a number', () => {
    expect(formatDeductionAmount({ ...baseDeduction, amount: 'not-a-number' }, formatters)).toBe(
      '-',
    )
  })

  it('routes the suffix through formatPerPaycheck so the caller owns the i18n template', () => {
    const formatPerPaycheck = vi.fn((value: string) => `${value} per paycheck`)
    formatDeductionAmount(
      { amount: '100', deductAsPercentage: false, recurring: true },
      { ...formatters, formatPerPaycheck },
    )
    expect(formatPerPaycheck).toHaveBeenCalledWith('$100.00')
  })
})
