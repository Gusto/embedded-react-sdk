import type { PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type {
  GetV1CompaniesCompanyIdPayrollsRequest,
  GetV1CompaniesCompanyIdPayrollsResponse,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
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

export default [getHistoricalPayrolls]
