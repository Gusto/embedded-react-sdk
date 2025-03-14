import { http, HttpResponse } from 'msw'
import { getFixture } from '../fixtures/getFixture'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

export const getEmptyCompanyFederalTaxes = http.get(
  `${API_BASE_URL}/v1/employees/:employee_id/federal_taxes`,
  () =>
    HttpResponse.json({
      w4_data_type: 'rev_2020_w4',
    }),
)

const getCompanyFederalTaxes = http.get<
  PathParams<'get-v1-companies-company_id-federal_tax_details'>,
  RequestBodyParams<'get-v1-companies-company_id-federal_tax_details'>,
  ResponseType<'get-v1-companies-company_id-federal_tax_details', 200>
>(`${API_BASE_URL}/v1/companies/:company_id/federal_tax_details`, async () => {
  const responseFixture = await getFixture('get-v1-companies-company_id-federal_tax_details')
  return HttpResponse.json(responseFixture)
})

export const updateEmptyCompanyFederalTaxes = http.put(
  `${API_BASE_URL}/v1/employees/:employee_id/federal_taxes`,
  () => HttpResponse.json(),
)

const updateCompanyFederalTaxes = http.put<
  PathParams<'put-v1-companies-company_id-federal_tax_details'>,
  RequestBodyParams<'put-v1-companies-company_id-federal_tax_details'>,
  ResponseType<'put-v1-companies-company_id-federal_tax_details', 200>
>(`${API_BASE_URL}/v1/companies/:company_id/federal_tax_details`, async ({ request }) => {
  const requestBody = await request.json()
  const responseFixture = await getFixture('get-v1-companies-company_id-federal_tax_details')
  return HttpResponse.json({
    ...responseFixture,
    filing_form: requestBody.filing_form,
  })
})

export default [getCompanyFederalTaxes, updateCompanyFederalTaxes]
