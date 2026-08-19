import { describe, expect, it } from 'vitest'
import { getContractorPaymentWageAmount, getContractorPaymentTotalAmount } from './paymentAmounts'

describe('getContractorPaymentWageAmount', () => {
  it('computes hours x hourlyRate for Hourly payments', () => {
    expect(
      getContractorPaymentWageAmount({ wageType: 'Hourly', hours: '10', hourlyRate: '18' }),
    ).toBe(180)
  })

  it('uses the raw wage field for Fixed payments', () => {
    expect(getContractorPaymentWageAmount({ wageType: 'Fixed', wage: '500' })).toBe(500)
  })

  it('defaults missing fields to zero', () => {
    expect(getContractorPaymentWageAmount({ wageType: 'Hourly' })).toBe(0)
    expect(getContractorPaymentWageAmount({ wageType: 'Fixed' })).toBe(0)
  })
})

describe('getContractorPaymentTotalAmount', () => {
  it('adds reimbursement to wageTotal', () => {
    expect(getContractorPaymentTotalAmount({ wageTotal: '230', reimbursement: '30' })).toBe(260)
  })

  it('defaults missing wageTotal and reimbursement to zero', () => {
    expect(getContractorPaymentTotalAmount({})).toBe(0)
    expect(getContractorPaymentTotalAmount({ wageTotal: '230' })).toBe(230)
    expect(getContractorPaymentTotalAmount({ reimbursement: '30' })).toBe(30)
  })
})
