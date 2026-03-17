import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1CompaniesCompanyIdPayrollsRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type {
  GetV1CompaniesCompanyIdPayrollsPayrollIdRequest,
  GetV1CompaniesCompanyIdPayrollsPayrollIdResponse,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrollspayrollid'
import type { PutV1CompaniesCompanyIdPayrollsPayrollIdPrepareRequestBody } from '@gusto/embedded-api/models/operations/putv1companiescompanyidpayrollspayrollidprepare'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

type PayrollPhase = 'initial' | 'calculated' | 'submitted'
let currentPayrollPhase: PayrollPhase = 'initial'

export function setPayrollPhase(phase: PayrollPhase) {
  currentPayrollPhase = phase
}

export function resetPayrollPhase() {
  currentPayrollPhase = 'initial'
}

export const createPayroll = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  payroll_uuid: 'payroll-uuid-1',
  processed: true,
  check_date: '2024-12-15',
  external: false,
  off_cycle: false,
  pay_period: {
    start_date: '2024-12-01',
    end_date: '2024-12-15',
    pay_schedule_uuid: 'schedule-1',
  },
  totals: {
    net_pay: '2500.00',
    gross_pay: '3200.00',
  },
  ...overrides,
})

export function handleGetPayrolls(
  resolver: HttpResponseResolver<PathParams, GetV1CompaniesCompanyIdPayrollsRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, resolver)
}

const getHistoricalPayrolls = http.get<PathParams, GetV1CompaniesCompanyIdPayrollsRequest>(
  `${API_BASE_URL}/v1/companies/:company_id/payrolls`,
  async ({ params }) => {
    const responseFixture = await getFixture(
      'get-v1-companies-company_id-payrolls-processed-payrolls',
    )
    return HttpResponse.json(responseFixture)
  },
)

let lastCreatedOffCycleReason: string | null = null

const getSinglePayroll = http.get<
  PathParams,
  GetV1CompaniesCompanyIdPayrollsPayrollIdRequest,
  GetV1CompaniesCompanyIdPayrollsPayrollIdResponse
>(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, async () => {
  const responseFixture = await getFixture('get-v1-companies-company_id-payrolls-payroll_id')
  const offCycleOverrides = lastCreatedOffCycleReason
    ? { off_cycle: true, off_cycle_reason: lastCreatedOffCycleReason }
    : {}

  if (currentPayrollPhase === 'submitted') {
    return HttpResponse.json({
      ...responseFixture,
      ...offCycleOverrides,
      processed: true,
      submission_blockers: [],
      processing_request: { status: 'submit_success', errors: [] },
    })
  }

  if (currentPayrollPhase === 'calculated') {
    return HttpResponse.json({
      ...responseFixture,
      ...offCycleOverrides,
      processed: false,
      submission_blockers: [],
      calculated_at: new Date().toISOString(),
      processing_request: { status: 'calculate_success', errors: [] },
    })
  }

  return HttpResponse.json({
    ...responseFixture,
    ...offCycleOverrides,
  })
})

export function handleGetPayrollBlockers(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_uuid/payrolls/blockers`, resolver)
}

const getPayrollBlockers = handleGetPayrollBlockers(async () => {
  const responseFixture = await getFixture('get-v1-companies-company_uuid-payrolls-blockers')
  return HttpResponse.json(responseFixture)
})

export function handlePayrollsPrepare(
  resolver: HttpResponseResolver<
    PathParams,
    PutV1CompaniesCompanyIdPayrollsPayrollIdPrepareRequestBody
  >,
) {
  return http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`, resolver)
}

const preparePayroll = handlePayrollsPrepare(async ({ request }) => {
  const body = await request.json()
  const employeeUuids: string[] | undefined = body.employeeUuids ?? undefined

  const responseFixture = await getFixture(
    'put-v1-companies-company_id-payrolls-payroll_id-prepare',
  )

  if (employeeUuids && employeeUuids.length > 0) {
    const filteredCompensations = (
      responseFixture.employee_compensations as Array<{ employee_uuid: string }>
    ).filter(comp => employeeUuids.includes(comp.employee_uuid))
    return HttpResponse.json({
      ...responseFixture,
      employee_compensations: filteredCompensations,
    })
  }

  return HttpResponse.json(responseFixture)
})

const calculatePayroll = http.put(
  `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`,
  () => {
    currentPayrollPhase = 'calculated'
    return new HttpResponse(null, { status: 202 })
  },
)

const submitPayroll = http.put(
  `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/submit`,
  () => {
    currentPayrollPhase = 'submitted'
    return new HttpResponse(null, { status: 202 })
  },
)

const cancelPayroll = http.put(
  `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/cancel`,
  async () => {
    currentPayrollState = 'initial'
    const responseFixture = await getFixture('get-v1-companies-company_id-payrolls-payroll_id')
    return HttpResponse.json({
      ...responseFixture,
      processed: false,
    })
  },
)

const updatePayroll = http.put(
  `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`,
  async () => {
    const responseFixture = await getFixture('get-v1-companies-company_id-payrolls-payroll_id')
    return HttpResponse.json(responseFixture)
  },
)

const getPayrollReceipt = http.get(
  `${API_BASE_URL}/v1/payrolls/:payroll_uuid/receipt`,
  async () => {
    const responseFixture = await getFixture('payroll-receipt-test-data')
    return HttpResponse.json(responseFixture)
  },
)

const createPayrollOffCycle = http.post(
  `${API_BASE_URL}/v1/companies/:company_id/payrolls`,
  async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const isTransition =
      body.off_cycle_reason === 'Transition from old pay schedule' ||
      body.offCycleReason === 'Transition from old pay schedule'

    const offCycleReason = (body.off_cycle_reason ?? body.offCycleReason ?? 'Bonus') as string

    if (isTransition) {
      lastCreatedOffCycleReason = offCycleReason
      const responseFixture = await getFixture('post-v1-companies-company_id-payrolls-transition')
      return HttpResponse.json(responseFixture)
    }

    lastCreatedOffCycleReason = offCycleReason
    const responseFixture = await getFixture('get-v1-companies-company_id-payrolls-payroll_id')
    return HttpResponse.json({
      ...responseFixture,
      off_cycle: true,
      off_cycle_reason: offCycleReason,
      payroll_uuid: 'off-cycle-payroll-uuid-1',
      uuid: 'off-cycle-payroll-uuid-1',
      processed: false,
      calculated_at: null,
    })
  },
)

export default [
  getPayrollBlockers,
  getHistoricalPayrolls,
  getSinglePayroll,
  preparePayroll,
  calculatePayroll,
  submitPayroll,
  cancelPayroll,
  updatePayroll,
  getPayrollReceipt,
  createPayrollOffCycle,
]
