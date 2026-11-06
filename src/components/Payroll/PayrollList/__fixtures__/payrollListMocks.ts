import { http, HttpResponse, type HttpHandler, type HttpResponseResolver } from 'msw'
import { API_BASE_URL } from '@/test/constants'

/**
 * Shared, parameterizable mock data + MSW handlers for the PayrollList container tests.
 *
 * All shapes are the snake_case JSON the API returns (the SDK client normalizes
 * to camelCase), so these plug directly into MSW resolvers.
 */

export const COMPANY_ID = 'company-123'

export const createListPayroll = (overrides: Record<string, unknown> = {}) => ({
  payroll_uuid: 'payroll-regular-1',
  processed: false,
  off_cycle: false,
  external: false,
  payroll_type: 'Regular',
  check_date: '2025-01-15',
  payroll_deadline: '2025-01-14T23:30:00Z',
  pay_period: {
    start_date: '2025-01-01',
    end_date: '2025-01-15',
    pay_schedule_uuid: 'schedule-1',
  },
  ...overrides,
})

export const createOffCyclePayroll = (
  offCycleReason: string,
  overrides: Record<string, unknown> = {},
) =>
  createListPayroll({
    payroll_uuid: `payroll-off-cycle-${offCycleReason.toLowerCase().replace(/\W+/g, '-')}`,
    off_cycle: true,
    off_cycle_reason: offCycleReason,
    payroll_type: 'Off-Cycle',
    ...overrides,
  })

export const createPaySchedule = (overrides: Record<string, unknown> = {}) => ({
  uuid: 'schedule-1',
  frequency: 'Every week',
  anchor_pay_date: '2024-01-01',
  anchor_end_of_pay_period: '2024-01-07',
  custom_name: 'Weekly Schedule',
  active: true,
  version: 'schedule-version-1',
  ...overrides,
})

export const createTransitionPayPeriod = () => ({
  start_date: '2025-01-16',
  end_date: '2025-01-31',
  pay_schedule_uuid: 'schedule-1',
  payroll: { processed: false, payroll_type: 'transition' },
})

interface PayrollListHandlerOptions {
  payrolls?: Array<Record<string, unknown>>
  payrollsHeaders?: Record<string, string>
  payrollsResolver?: HttpResponseResolver
  paySchedules?: Array<Record<string, unknown>>
  blockers?: Array<Record<string, unknown>>
  wireInRequests?: Array<Record<string, unknown>>
  payPeriods?: Array<Record<string, unknown>>
}

export const buildPayrollListHandlers = ({
  payrolls = [],
  payrollsHeaders,
  payrollsResolver,
  paySchedules = [],
  blockers = [],
  wireInRequests = [],
  payPeriods = [],
}: PayrollListHandlerOptions = {}): HttpHandler[] => [
  http.get(
    `${API_BASE_URL}/v1/companies/:company_id/payrolls`,
    payrollsResolver ?? (() => HttpResponse.json(payrolls, { headers: payrollsHeaders })),
  ),
  http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, () =>
    HttpResponse.json(paySchedules),
  ),
  http.get(`${API_BASE_URL}/v1/companies/:company_uuid/payrolls/blockers`, () =>
    HttpResponse.json(blockers),
  ),
  http.get(`${API_BASE_URL}/v1/companies/:company_uuid/wire_in_requests`, () =>
    HttpResponse.json(wireInRequests),
  ),
  http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_periods`, () =>
    HttpResponse.json(payPeriods),
  ),
]

export const handleSkipPayroll = (resolver: HttpResponseResolver) =>
  http.post(`${API_BASE_URL}/v1/companies/:company_uuid/payrolls/skip`, resolver)

export const handleDeletePayroll = (resolver: HttpResponseResolver) =>
  http.delete(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, resolver)
