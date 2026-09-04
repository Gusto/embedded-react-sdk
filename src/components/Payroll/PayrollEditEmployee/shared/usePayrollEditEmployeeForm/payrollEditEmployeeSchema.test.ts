import { describe, it, expect } from 'vitest'
import { PayrollUpdatePaymentMethod } from '@gusto/embedded-api/models/components/payrollupdate'
import {
  createPayrollEditEmployeeSchema,
  PayrollEditEmployeeErrorCodes,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_METHOD_VALUES,
  type PayrollEditEmployeeFormData,
} from './payrollEditEmployeeSchema'

const baseFormData: PayrollEditEmployeeFormData = {
  hours: {},
  additionalEarnings: {},
  other: {},
  timeOff: {},
  finalPayout: {},
  reimbursements: [],
}

describe('createPayrollEditEmployeeSchema', () => {
  const schema = createPayrollEditEmployeeSchema()

  it('parses a fully populated, valid form payload', () => {
    const result = schema.safeParse({
      ...baseFormData,
      hours: { 'job-1': { 'Regular Hours': { '2025-01-01': '40', '2025-01-08': '32.5' } } },
      additionalEarnings: { 'job-1': { Bonus: { '2025-01-01': '100' } } },
      other: { 'job-1': { 'Cash Tips': '50' } },
      timeOff: { Vacation: '8' },
      finalPayout: { Vacation: '0' },
      reimbursements: [{ uuid: 'r-1', description: 'Travel', amount: '25', recurring: false }],
      paymentMethod: PayrollUpdatePaymentMethod.DirectDeposit,
    })

    expect(result.success).toBe(true)
  })

  it('treats a blank amount as valid ("not provided")', () => {
    const result = schema.safeParse({
      ...baseFormData,
      hours: { 'job-1': { 'Regular Hours': { '2025-01-01': '' } } },
    })

    expect(result.success).toBe(true)
  })

  it('rejects a negative amount with the NEGATIVE_AMOUNT code', () => {
    const result = schema.safeParse({
      ...baseFormData,
      hours: { 'job-1': { 'Regular Hours': { '2025-01-01': '-5' } } },
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(PayrollEditEmployeeErrorCodes.NEGATIVE_AMOUNT)
  })

  it('rejects a non-numeric amount with the NEGATIVE_AMOUNT code', () => {
    const result = schema.safeParse({
      ...baseFormData,
      other: { 'job-1': { 'Cash Tips': 'abc' } },
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(PayrollEditEmployeeErrorCodes.NEGATIVE_AMOUNT)
  })

  // parseFloat would have accepted all of these (as 5, Infinity, and 1000);
  // the schema must reject anything that is not a plain, non-negative decimal.
  it.each(['5ea', 'Infinity', 'NaN', '1e3', '  12', '$5', '.5'])(
    'rejects the malformed amount %j',
    malformed => {
      const result = schema.safeParse({
        ...baseFormData,
        hours: { 'job-1': { 'Regular Hours': { '2025-01-01': malformed } } },
      })

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe(PayrollEditEmployeeErrorCodes.NEGATIVE_AMOUNT)
    },
  )

  it.each(['40', '32.5', '0', '500.00'])('accepts the valid amount %j', valid => {
    const result = schema.safeParse({
      ...baseFormData,
      hours: { 'job-1': { 'Regular Hours': { '2025-01-01': valid } } },
    })

    expect(result.success).toBe(true)
  })

  it('allows paymentMethod to be omitted', () => {
    const result = schema.safeParse(baseFormData)

    expect(result.success).toBe(true)
  })

  it('rejects a paymentMethod outside the accepted enum values', () => {
    const result = schema.safeParse({ ...baseFormData, paymentMethod: 'Historical' })

    expect(result.success).toBe(false)
  })

  it('rejects a negative reimbursement amount', () => {
    const result = schema.safeParse({
      ...baseFormData,
      reimbursements: [{ uuid: 'r-1', description: 'Travel', amount: '-25', recurring: false }],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(PayrollEditEmployeeErrorCodes.NEGATIVE_AMOUNT)
  })
})

describe('payment method options', () => {
  it('exposes Direct Deposit then Check in display order', () => {
    expect(PAYMENT_METHOD_VALUES).toEqual([
      PayrollUpdatePaymentMethod.DirectDeposit,
      PayrollUpdatePaymentMethod.Check,
    ])
  })

  it('pairs each value with a matching option label', () => {
    expect(PAYMENT_METHOD_OPTIONS).toEqual([
      {
        value: PayrollUpdatePaymentMethod.DirectDeposit,
        label: PayrollUpdatePaymentMethod.DirectDeposit,
      },
      { value: PayrollUpdatePaymentMethod.Check, label: PayrollUpdatePaymentMethod.Check },
    ])
  })
})
