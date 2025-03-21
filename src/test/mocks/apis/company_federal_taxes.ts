import { http, HttpResponse, HttpResponseResolver } from 'msw'
import { getFixture } from '../fixtures/getFixture'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

export function handleGetCompanyFederalTaxes(
  resolver: HttpResponseResolver<
    PathParams<'get-v1-companies-company_id-federal_tax_details'>,
    RequestBodyParams<'get-v1-companies-company_id-federal_tax_details'>,
    ResponseType<'get-v1-companies-company_id-federal_tax_details', 200>
  >,
) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/federal_tax_details`, resolver)
}

const getCompanyFederalTaxes = handleGetCompanyFederalTaxes(async () => {
  const responseFixture = await getFixture('get-v1-companies-company_id-federal_tax_details')
  return HttpResponse.json(responseFixture)
})

export const updateCompanyFederalTaxes = http.put<
  PathParams<'put-v1-companies-company_id-federal_tax_details'>,
  RequestBodyParams<'put-v1-companies-company_id-federal_tax_details'>,
  ResponseType<'put-v1-companies-company_id-federal_tax_details', 200>
>(`${API_BASE_URL}/v1/companies/:company_id/federal_tax_details`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    filing_form: requestBody.filing_form,
    has_ein: Boolean(requestBody.ein),
    tax_payer_type: requestBody.tax_payer_type,
    legal_name: requestBody.legal_name,
    version: requestBody.version,
  })
})

export default [getCompanyFederalTaxes, updateCompanyFederalTaxes]
