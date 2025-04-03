import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1CompaniesCompanyIdFederalTaxDetailsRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidfederaltaxdetails'
import type { PutV1CompaniesCompanyIdFederalTaxDetailsRequestBody } from '@gusto/embedded-api/models/operations/putv1companiescompanyidfederaltaxdetails'
import type { FederalTaxDetails$Outbound } from '@gusto/embedded-api/models/components/federaltaxdetails'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export function handleGetCompanyFederalTaxes(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1CompaniesCompanyIdFederalTaxDetailsRequest,
    FederalTaxDetails$Outbound
  >,
) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/federal_tax_details`, resolver)
}

const getCompanyFederalTaxes = handleGetCompanyFederalTaxes(async () => {
  const responseFixture = await getFixture('get-v1-companies-company_id-federal_tax_details')
  return HttpResponse.json(responseFixture)
})

export function handleUpdateCompanyFederalTaxes(
  resolver: HttpResponseResolver<
    PathParams,
    PutV1CompaniesCompanyIdFederalTaxDetailsRequestBody,
    FederalTaxDetails$Outbound
  >,
) {
  return http.put(`${API_BASE_URL}/v1/companies/:company_id/federal_tax_details`, resolver)
}

export const updateCompanyFederalTaxes = handleUpdateCompanyFederalTaxes(
  async (overrides: object | undefined) => {
    const responseFixture = await getFixture('get-v1-companies-company_id-federal_tax_details')
    return HttpResponse.json({ ...responseFixture, ...overrides })
  },
)

export default [getCompanyFederalTaxes, updateCompanyFederalTaxes]
