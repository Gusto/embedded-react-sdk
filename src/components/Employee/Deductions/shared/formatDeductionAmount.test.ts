import { describe, expect, it, vi } from 'vitest'
import type { Garnishment } from '@gusto/embedded-api-v-2026-06-15/models/components/garnishment'
import { formatDeductionAmount } from './formatDeductionAmount'

const formatters = {
  formatCurrency: (n: number) => `$${n.toFixed(2)}`,
  formatPercent: (n: number) => `${n}%`,
  formatPerPaycheck: (value: string) => `${value} per paycheck`,
}

const baseDeduction: Pick<
  Garnishment,
  'amount' | 'deductAsPercentage' | 'recurring' | 'payPeriodMaximum'
> = {
  amount: '50',
  deductAsPercentage: false,
  recurring: false,
  payPeriodMaximum: null,
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
      formatDeductionAmount(
        { amount: '5', deductAsPercentage: true, recurring: true, payPeriodMaximum: null },
        formatters,
      ),
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

  // SDK-945: child-support garnishments are stored as deductAsPercentage:true
  // even when the user only set a fixed dollar cap (payPeriodMaximum) and no
  // percentage. The amount is then "0", which must not render as "0%".
  it('shows the dollar cap (not "0%") for a percentage deduction with no percentage but a payPeriodMaximum', () => {
    expect(
      formatDeductionAmount(
        { amount: '0', deductAsPercentage: true, recurring: true, payPeriodMaximum: '300' },
        formatters,
      ),
    ).toBe('$300.00 per paycheck')
  })

  it('shows the dollar cap without suffix for a one-time percentage deduction with only a payPeriodMaximum', () => {
    expect(
      formatDeductionAmount(
        { amount: '0', deductAsPercentage: true, recurring: false, payPeriodMaximum: '300' },
        formatters,
      ),
    ).toBe('$300.00')
  })

  it('returns "-" for a percentage deduction with neither a percentage nor a payPeriodMaximum', () => {
    expect(
      formatDeductionAmount(
        { amount: '0', deductAsPercentage: true, recurring: true, payPeriodMaximum: null },
        formatters,
      ),
    ).toBe('-')
  })

  it('still formats a non-zero percentage normally even when a payPeriodMaximum is also set', () => {
    expect(
      formatDeductionAmount(
        { amount: '25', deductAsPercentage: true, recurring: true, payPeriodMaximum: '300' },
        formatters,
      ),
    ).toBe('25% per paycheck')
  })

  it('routes the suffix through formatPerPaycheck so the caller owns the i18n template', () => {
    const formatPerPaycheck = vi.fn((value: string) => `${value} per paycheck`)
    formatDeductionAmount(
      { amount: '100', deductAsPercentage: false, recurring: true, payPeriodMaximum: null },
      { ...formatters, formatPerPaycheck },
    )
    expect(formatPerPaycheck).toHaveBeenCalledWith('$100.00')
  })
})
