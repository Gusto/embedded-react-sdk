import { describe, expect, it } from 'vitest'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { deriveTaxPaymentStatus, isFederalTaxPayment } from './taxPaymentStatus'

const TODAY = '2026-10-02'

const buildPayment = (
  overrides: Partial<Parameters<typeof deriveTaxPaymentStatus>[0]> = {},
): Parameters<typeof deriveTaxPaymentStatus>[0] => ({
  amount: '100.00',
  amountPaid: '0.00',
  dueDate: new RFCDate('2026-10-15'),
  paymentSentOn: null,
  ...overrides,
})

describe('deriveTaxPaymentStatus', () => {
  it('returns refund for negative amounts', () => {
    expect(deriveTaxPaymentStatus(buildPayment({ amount: '-25.00' }), TODAY)).toBe('refund')
  })

  it('returns paid when the payment has been sent', () => {
    expect(
      deriveTaxPaymentStatus(buildPayment({ paymentSentOn: new RFCDate('2026-09-01') }), TODAY),
    ).toBe('paid')
  })

  it('returns paid when the amount has been fully settled', () => {
    expect(deriveTaxPaymentStatus(buildPayment({ amountPaid: '100.00' }), TODAY)).toBe('paid')
  })

  it('does not treat a zero-amount payment as paid', () => {
    expect(deriveTaxPaymentStatus(buildPayment({ amount: '0.00' }), TODAY)).toBe('scheduled')
  })

  it('returns overdue when the due date has passed', () => {
    expect(
      deriveTaxPaymentStatus(buildPayment({ dueDate: new RFCDate('2026-09-15') }), TODAY),
    ).toBe('overdue')
  })

  it('returns scheduled when due today or later', () => {
    expect(deriveTaxPaymentStatus(buildPayment({ dueDate: new RFCDate(TODAY) }), TODAY)).toBe(
      'scheduled',
    )
  })

  it('returns scheduled when there is no due date', () => {
    expect(deriveTaxPaymentStatus(buildPayment({ dueDate: null }), TODAY)).toBe('scheduled')
  })
})

describe('isFederalTaxPayment', () => {
  it('identifies the federal jurisdiction', () => {
    expect(isFederalTaxPayment({ jurisdiction: 'US' })).toBe(true)
    expect(isFederalTaxPayment({ jurisdiction: 'CA' })).toBe(false)
  })
})
