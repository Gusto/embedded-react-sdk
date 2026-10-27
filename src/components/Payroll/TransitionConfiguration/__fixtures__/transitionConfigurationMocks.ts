export const COMPANY_ID = 'company-1'
export const PAYROLL_ID = 'transition-payroll-1'
const PAY_SCHEDULE_ID = 'schedule-1'

export const buildTransitionPayroll = (overrides: Record<string, unknown> = {}) => ({
  payroll_uuid: PAYROLL_ID,
  uuid: PAYROLL_ID,
  company_uuid: COMPANY_ID,
  off_cycle: true,
  off_cycle_reason: 'Transition from old pay schedule',
  processed: false,
  check_date: '2025-08-29',
  pay_period: {
    start_date: '2025-08-14',
    end_date: '2025-08-27',
    pay_schedule_uuid: PAY_SCHEDULE_ID,
  },
  withholding_pay_period: null,
  skip_regular_deductions: null,
  fixed_withholding_rate: null,
  ...overrides,
})

export const buildPreparedTransitionPayroll = (overrides: Record<string, unknown> = {}) =>
  buildTransitionPayroll({
    employee_compensations: [
      { employee_uuid: 'employee-1', version: 'compensation-version-1', excluded: false },
      { employee_uuid: 'employee-2', version: 'compensation-version-2', excluded: false },
    ],
    ...overrides,
  })
