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

describe('getPayrollDisplayDates', () => {
  it('uses expected dates for an unprocessed off-cycle payroll with null lateness fields', () => {
    expect(getPayrollDisplayDates(payroll)).toEqual({
      checkDate: '2026-11-02',
      payrollDeadline: '2026-10-29T16:00:00-07:00',
    })
  })

  it.each([
    { offCycle: false },
    { processed: true },
    { payrollStatusMeta: undefined },
    { payrollStatusMeta: { expectedCheckDate: '2026-11-02' } },
    { payrollStatusMeta: { expectedDebitTime: '2026-10-29T16:00:00-07:00' } },
  ])('preserves stored dates for %j', overrides => {
    expect(getPayrollDisplayDates({ ...payroll, ...overrides })).toEqual({
      checkDate: payroll.checkDate,
      payrollDeadline: payroll.payrollDeadline,
    })
  })
})
