import { describe, expect, it } from 'vitest'
import type { PayrollShow } from '@gusto/embedded-api/models/components/unprocessedpayroll'
import { getPayrollDisplayDates } from './payrollDates'

const payroll: PayrollShow = {
  offCycle: true,
  processed: false,
  checkDate: '2026-10-28',
  payrollDeadline: new Date('2026-10-27T16:00:00-07:00'),
  payrollStatusMeta: {
    initialCheckDate: null,
    payrollLate: null,
    expectedCheckDate: '2026-11-02',
    expectedDebitTime: '2026-10-29T16:00:00-07:00',
  },
}

const storedDates = { checkDate: payroll.checkDate, submitBy: payroll.payrollDeadline }

describe('getPayrollDisplayDates', () => {
  it('uses expected dates for an unprocessed off-cycle payroll', () => {
    expect(getPayrollDisplayDates(payroll)).toEqual({
      checkDate: '2026-11-02',
      submitBy: '2026-10-29T16:00:00-07:00',
    })
  })

  it('preserves stored dates for regular payrolls', () => {
    expect(getPayrollDisplayDates({ ...payroll, offCycle: false })).toEqual(storedDates)
  })

  it('preserves stored dates for processed payrolls', () => {
    expect(getPayrollDisplayDates({ ...payroll, processed: true })).toEqual(storedDates)
  })

  it('preserves stored dates when expected metadata is missing', () => {
    expect(getPayrollDisplayDates({ ...payroll, payrollStatusMeta: undefined })).toEqual(
      storedDates,
    )
  })

  it('preserves stored dates when the expected debit time is missing', () => {
    expect(
      getPayrollDisplayDates({
        ...payroll,
        payrollStatusMeta: { expectedCheckDate: '2026-11-02' },
      }),
    ).toEqual(storedDates)
  })

  it('preserves stored dates when the expected pay date is missing', () => {
    expect(
      getPayrollDisplayDates({
        ...payroll,
        payrollStatusMeta: { expectedDebitTime: '2026-10-29T16:00:00-07:00' },
      }),
    ).toEqual(storedDates)
  })
})
