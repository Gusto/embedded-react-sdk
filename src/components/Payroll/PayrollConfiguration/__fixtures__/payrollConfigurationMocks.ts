import { http, HttpResponse, type HttpHandler } from 'msw'
import { API_BASE_URL } from '@/test/constants'

/**
 * Shared, parameterizable mock data + MSW handlers for the PayrollConfiguration
 * container tests and the usePayrollConfiguration / usePayrollGrossUp hook tests.
 *
 * All shapes are the snake_case JSON the API returns (the SDK client normalizes
 * to camelCase), so these plug directly into MSW resolvers.
 */

interface EmployeeFixtureOptions {
  rate?: string
  paymentMethod?: string
}

export const createEmployee = (
  uuid: string,
  firstName: string,
  lastName: string,
  { rate = '25.00', paymentMethod = 'Direct Deposit' }: EmployeeFixtureOptions = {},
) => ({
  uuid,
  first_name: firstName,
  last_name: lastName,
  payment_method: paymentMethod,
  jobs: [
    {
      uuid: `job-${uuid}`,
      title: 'Software Engineer',
      primary: true,
      compensations: [
        {
          uuid: `comp-${uuid}`,
          rate,
          payment_unit: 'Hour',
          flsa_status: 'Nonexempt',
        },
      ],
    },
  ],
})

interface CompensationFixtureOptions {
  grossPay?: number
  excluded?: boolean
  paymentMethod?: string
  fixedCompensations?: Array<Record<string, unknown>>
}

export const createCompensation = (
  employeeUuid: string,
  {
    grossPay = 1000,
    excluded = false,
    paymentMethod = 'Direct Deposit',
    fixedCompensations = [],
  }: CompensationFixtureOptions = {},
) => ({
  excluded,
  payment_method: paymentMethod,
  memo: null,
  fixed_compensations: fixedCompensations,
  hourly_compensations: [
    {
      flsa_status: 'Nonexempt',
      name: 'Regular Hours',
      job_uuid: `job-${employeeUuid}`,
      amount: String(grossPay),
      compensation_multiplier: 1.0,
      hours: '40.000',
    },
  ],
  employee_uuid: employeeUuid,
  version: 'v1',
  paid_time_off: [],
  gross_pay: String(grossPay),
  net_pay: String(grossPay * 0.8),
  check_amount: String(grossPay * 0.8),
})

export const page1Employees = [
  createEmployee('emp-1', 'Alice', 'Anderson'),
  createEmployee('emp-2', 'Bob', 'Baker'),
  createEmployee('emp-3', 'Charlie', 'Clark'),
  createEmployee('emp-4', 'Diana', 'Davis'),
  createEmployee('emp-5', 'Eve', 'Evans'),
  createEmployee('emp-6', 'Frank', 'Foster'),
  createEmployee('emp-7', 'Grace', 'Green'),
  createEmployee('emp-8', 'Henry', 'Harris'),
  createEmployee('emp-9', 'Ivy', 'Irving'),
  createEmployee('emp-10', 'Jack', 'Johnson'),
  createEmployee('emp-11', 'Karen', 'Kent'),
  createEmployee('emp-12', 'Larry', 'Lane'),
  createEmployee('emp-13', 'Mary', 'Mason'),
  createEmployee('emp-14', 'Nick', 'Nash'),
  createEmployee('emp-15', 'Olivia', 'Owens'),
  createEmployee('emp-16', 'Paul', 'Palmer'),
  createEmployee('emp-17', 'Quinn', 'Quill'),
  createEmployee('emp-18', 'Rachel', 'Reed'),
  createEmployee('emp-19', 'Sam', 'Stone'),
  createEmployee('emp-20', 'Tina', 'Tucker'),
  createEmployee('emp-21', 'Uma', 'Underwood'),
  createEmployee('emp-22', 'Victor', 'Vance'),
  createEmployee('emp-23', 'Wendy', 'Walsh'),
  createEmployee('emp-24', 'Xander', 'Xu'),
  createEmployee('emp-25', 'Yara', 'Young'),
]

export const page2Employees = [
  createEmployee('emp-26', 'Kate', 'King'),
  createEmployee('emp-27', 'Leo', 'Lewis'),
]

export const allEmployees = [...page1Employees, ...page2Employees]

export const allCompensations = allEmployees.map(emp => createCompensation(emp.uuid))

export const mockPaySchedule = {
  uuid: 'schedule-1',
  frequency: 'Every week',
  anchor_pay_date: '2024-01-01',
  anchor_end_of_pay_period: '2024-01-07',
  custom_name: 'Weekly Schedule',
  active: true,
  version: 'v1',
}

interface PayrollStatusMetaFixture {
  cancellable?: boolean
  payroll_late?: boolean
  initial_check_date?: string
  expected_check_date?: string
  expected_debit_time?: string
  initial_debit_cutoff_time?: string
}

export interface BuildPayrollOptions {
  processed?: boolean
  checkDate?: string | null
  payrollDeadline?: string | null
  calculatedAt?: string | null
  processingRequest?: { status: string; errors: unknown[] } | null
  employeeCompensations?: Array<Record<string, unknown>>
  payrollStatusMeta?: PayrollStatusMetaFixture
  offCycle?: boolean
  offCycleReason?: string | null
  external?: boolean
}

const defaultStatusMeta: PayrollStatusMetaFixture = {
  cancellable: true,
  payroll_late: false,
  initial_check_date: '2025-08-15',
  expected_check_date: '2025-08-15',
  expected_debit_time: '2025-08-11T17:00:00-07:00',
  initial_debit_cutoff_time: '2025-08-11T17:00:00-07:00',
}

/**
 * Builds a payroll `GET`/`prepare` response body. Every field has a sensible
 * default; pass overrides for the dimension a test cares about (calculation
 * status, processed, off-cycle category, late-payroll meta, etc.).
 */
export const buildPayrollData = ({
  processed = false,
  checkDate = '2025-08-15',
  payrollDeadline = '2025-08-11T17:00:00-07:00',
  calculatedAt = '2025-08-10T12:00:00Z',
  processingRequest = null,
  employeeCompensations = allCompensations,
  payrollStatusMeta = defaultStatusMeta,
  offCycle = false,
  offCycleReason = null,
  external = false,
}: BuildPayrollOptions = {}) => ({
  uuid: 'payroll-uuid-1',
  payroll_uuid: 'payroll-uuid-1',
  company_uuid: 'company-123',
  off_cycle: offCycle,
  off_cycle_reason: offCycleReason,
  external,
  processed,
  check_date: checkDate,
  payroll_deadline: payrollDeadline,
  calculated_at: calculatedAt as string | null,
  pay_period: {
    start_date: '2025-07-30',
    end_date: '2025-08-13',
    pay_schedule_uuid: 'schedule-1',
  },
  employee_compensations: employeeCompensations,
  totals: {
    gross_pay: '4000.00',
    net_pay: '3200.00',
    company_debit: '4000.00',
    net_pay_debit: '3200.00',
    tax_debit: '800.00',
    reimbursement_debit: '0.00',
    child_support_debit: '0.00',
    reimbursements: '0.00',
    employee_bonuses: '0.00',
    employee_commissions: '0.00',
    employee_cash_tips: '0.00',
    employee_paycheck_tips: '0.00',
    additional_earnings: '0.00',
    owners_draw: '0.00',
    check_amount: '0.00',
    employer_taxes: '400.00',
    employee_taxes: '400.00',
    benefits: '0.00',
    employee_benefits_deductions: '0.00',
    deferred_payroll_taxes: '0.00',
    other_deductions: '0.00',
  },
  payroll_status_meta: payrollStatusMeta,
  processing_request: processingRequest,
})

/**
 * Default payroll fixture: a regular, unprocessed, already-calculated payroll.
 */
export const mockPayrollData = buildPayrollData()

interface PayrollHandlersOptions {
  /** Read the current payroll body on each request so tests can mutate it mid-flow. */
  getPayrollData: () => ReturnType<typeof buildPayrollData>
  /** Employees returned by the paginated list endpoint. Defaults to all 27. */
  employees?: Array<ReturnType<typeof createEmployee>>
  /** Pay schedule returned by the pay-schedule endpoint. */
  paySchedule?: typeof mockPaySchedule
  /** Blockers returned by the blockers endpoint. Defaults to none. */
  blockers?: unknown[]
}

/**
 * The standard set of MSW handlers a PayrollConfiguration render needs: blockers,
 * paginated employees list, payroll `GET`, `prepare` (filtered by requested UUIDs),
 * and pay schedule. Tests spread these into `server.use(...)` and add/override
 * endpoint handlers (e.g. `calculate`) as needed.
 */
export const buildPayrollConfigurationHandlers = ({
  getPayrollData,
  employees = allEmployees,
  paySchedule = mockPaySchedule,
  blockers = [],
}: PayrollHandlersOptions): HttpHandler[] => [
  http.get(`${API_BASE_URL}/v1/companies/:company_uuid/payrolls/blockers`, () =>
    HttpResponse.json(blockers),
  ),

  http.get(`${API_BASE_URL}/v1/companies/:company_id/employees`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const per = parseInt(url.searchParams.get('per') || '10', 10)

    const totalCount = employees.length
    const totalPages = Math.ceil(totalCount / per)
    const startIndex = (page - 1) * per
    const pageEmployees = employees.slice(startIndex, startIndex + per)

    return HttpResponse.json(pageEmployees, {
      headers: {
        'x-total-pages': String(totalPages),
        'x-total-count': String(totalCount),
        'x-page': String(page),
        'x-per-page': String(per),
      },
    })
  }),

  http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, () =>
    HttpResponse.json(getPayrollData()),
  ),

  http.put(
    `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`,
    async ({ request }) => {
      const body = (await request.json()) as { employee_uuids?: string[] } | null
      const employeeUuids = body?.employee_uuids
      const payrollData = getPayrollData()

      if (employeeUuids && employeeUuids.length > 0) {
        const filteredCompensations = payrollData.employee_compensations.filter(
          (comp): comp is Record<string, unknown> & { employee_uuid: string } =>
            typeof (comp as { employee_uuid?: string }).employee_uuid === 'string' &&
            employeeUuids.includes((comp as { employee_uuid: string }).employee_uuid),
        )
        return HttpResponse.json({
          ...payrollData,
          employee_compensations: filteredCompensations,
        })
      }

      return HttpResponse.json(payrollData)
    },
  ),

  http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:pay_schedule_id`, () =>
    HttpResponse.json(paySchedule),
  ),
]
