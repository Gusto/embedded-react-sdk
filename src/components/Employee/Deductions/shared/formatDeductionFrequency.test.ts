import { describe, expect, it } from 'vitest'
import { formatDeductionFrequency } from './formatDeductionFrequency'

const labels = {
  recurring: 'Every payroll',
  oneTime: 'Next payroll only',
  paymentPeriods: {
    everyWeek: 'Weekly order',
    everyOtherWeek: 'Biweekly order',
    twicePerMonth: 'Semimonthly order',
    monthly: 'Monthly order',
  },
}

describe('formatDeductionFrequency', () => {
  it.each([
    ['Every week', 'Weekly order'],
    ['Every other week', 'Biweekly order'],
    ['Twice per month', 'Semimonthly order'],
    ['Monthly', 'Monthly order'],
  ] as const)('maps %s to the supplied label', (paymentPeriod, expected) => {
    expect(
      formatDeductionFrequency({ recurring: true, childSupport: { paymentPeriod } }, labels),
    ).toBe(expected)
  })

  it('does not substitute payroll recurrence for a missing child support period', () => {
    expect(
      formatDeductionFrequency({ recurring: true, garnishmentType: 'child_support' }, labels),
    ).toBe('-')
  })

  it('uses payroll recurrence for standard deductions', () => {
    expect(formatDeductionFrequency({ recurring: true }, labels)).toBe('Every payroll')
    expect(formatDeductionFrequency({ recurring: false }, labels)).toBe('Next payroll only')
  })
})
