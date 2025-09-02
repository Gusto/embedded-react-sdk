import type { PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type {
  GetV1CompaniesCompanyIdPayrollsRequest,
  GetV1CompaniesCompanyIdPayrollsResponse,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type {
  GetV1CompaniesCompanyIdPayrollsPayrollIdRequest,
  GetV1CompaniesCompanyIdPayrollsPayrollIdResponse,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrollspayrollid'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

const getHistoricalPayrolls = http.get<
  PathParams,
  GetV1CompaniesCompanyIdPayrollsRequest,
  GetV1CompaniesCompanyIdPayrollsResponse
>(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, async ({ params }) => {
  const responseFixture = await getFixture(
    'get-v1-companies-company_id-payrolls-processed-payrolls',
  )
  return HttpResponse.json(responseFixture)
})

const getSinglePayroll = http.get<
  PathParams,
  GetV1CompaniesCompanyIdPayrollsPayrollIdRequest,
  GetV1CompaniesCompanyIdPayrollsPayrollIdResponse
>(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, async ({ params }) => {
  const responseFixture = await getFixture('get-v1-companies-company_id-payrolls-payroll_id')
  return HttpResponse.json(responseFixture)
})

export default [getHistoricalPayrolls, getSinglePayroll]
