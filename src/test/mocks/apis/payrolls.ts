import { http, HttpResponse } from 'msw'
import { getFixture } from '../fixtures/getFixture'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

const getHistoricalPayrolls = http.get<
  PathParams<'get-v1-companies-company_id-payrolls'>,
  RequestBodyParams<'get-v1-companies-company_id-payrolls'>,
  ResponseType<'get-v1-companies-company_id-payrolls', 200>
>(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, async ({ params }) => {
  const responseFixture = await getFixture(
    'get-v1-companies-company_id-payrolls-processed-payrolls',
  )
  return HttpResponse.json(responseFixture)
})

export default [getHistoricalPayrolls]
