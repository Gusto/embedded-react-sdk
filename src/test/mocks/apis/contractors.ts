import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1ContractorsContractorUuidRequest } from '@gusto/embedded-api/models/operations/getv1contractorscontractoruuid'
import type { PostV1CompaniesCompanyUuidContractorsRequestBody } from '@gusto/embedded-api/models/operations/postv1companiescompanyuuidcontractors'
import type { PutV1ContractorsContractorUuidRequestBody } from '@gusto/embedded-api/models/operations/putv1contractorscontractoruuid'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export function handleGetContractor(
  resolver: HttpResponseResolver<PathParams, GetV1ContractorsContractorUuidRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractor_uuid`, resolver)
}

export function handleCreateContractor(
  resolver: HttpResponseResolver<PathParams, PostV1CompaniesCompanyUuidContractorsRequestBody>,
) {
  return http.post(`${API_BASE_URL}/v1/companies/:company_uuid/contractors`, resolver)
}

export function handleUpdateContractor(
  resolver: HttpResponseResolver<PathParams, PutV1ContractorsContractorUuidRequestBody>,
) {
  return http.put(`${API_BASE_URL}/v1/contractors/:contractor_uuid`, resolver)
}

export function handleGetContractorsList(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_uuid/contractors`, resolver)
}

const contractorFixture = {
  uuid: 'contractor-123',
  company_uuid: '123',
  wage_type: 'Hourly',
  start_date: '2024-01-01',
  is_active: true,
  version: 'version-123',
  type: 'Individual',
  first_name: 'John',
  last_name: 'Contractor',
  middle_initial: null,
  business_name: null,
  ein: null,
  has_ein: false,
  has_ssn: true,
  email: 'john.contractor@example.com',
  file_new_hire_report: true,
  work_state: 'CA',
  onboarded: false,
  onboarding_status: 'admin_onboarding_incomplete',
  address: null,
  hourly_rate: '50.00',
  payment_method: 'Check',
}

export const getContractorsList = handleGetContractorsList(() =>
  HttpResponse.json([contractorFixture], {
    headers: {
      'x-total-pages': '1',
      'x-total-count': '1',
    },
  }),
)

export const getContractor = handleGetContractor(async () => {
  const responseFixture = await getFixture('get-v1-contractors-contractor_id')
  return HttpResponse.json(responseFixture)
})

export const createContractor = handleCreateContractor(async ({ request }) => {
  const requestBody = (await request.json()) as Record<string, unknown>
  return HttpResponse.json(
    {
      ...contractorFixture,
      uuid: 'new-contractor-uuid',
      first_name: requestBody.firstName ?? 'New',
      last_name: requestBody.lastName ?? 'Contractor',
      email: requestBody.email,
      type: requestBody.type ?? 'Individual',
      wage_type: requestBody.wageType ?? 'Hourly',
      start_date: requestBody.startDate,
      self_onboarding: requestBody.selfOnboarding ?? false,
    },
    { status: 201 },
  )
})

export const updateContractor = handleUpdateContractor(async ({ request }) => {
  const requestBody = await request.json()
  const responseFixture = await getFixture('get-v1-contractors-contractor_id')
  return HttpResponse.json({
    ...responseFixture,
    ...requestBody,
    version: 'updated-version',
  })
})

export default [getContractorsList, getContractor, createContractor, updateContractor]
