import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1CompaniesCompanyIdPayrollsRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type {
  GetV1CompaniesCompanyIdPayrollsPayrollIdRequest,
  GetV1CompaniesCompanyIdPayrollsPayrollIdResponse,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrollspayrollid'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

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

const getSinglePayroll = http.get<
  PathParams,
  GetV1CompaniesCompanyIdPayrollsPayrollIdRequest,
  GetV1CompaniesCompanyIdPayrollsPayrollIdResponse
>(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, async ({ params }) => {
  const responseFixture = await getFixture('get-v1-companies-company_id-payrolls-payroll_id')
  return HttpResponse.json(responseFixture)
})

const getPayrollBlockers = http.get(
  `${API_BASE_URL}/v1/companies/:company_uuid/payrolls/blockers`,
  async () => {
    const responseFixture = await getFixture('get-v1-companies-company_uuid-payrolls-blockers')
    return HttpResponse.json(responseFixture)
  },
)

export default [getPayrollBlockers, getHistoricalPayrolls, getSinglePayroll]
