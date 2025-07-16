import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1ContractorsContractorUuidRequest } from '@gusto/embedded-api/models/operations/getv1contractorscontractoruuid'
import type { PostV1CompaniesCompanyUuidContractorsRequestBody } from '@gusto/embedded-api/models/operations/postv1companiescompanyuuidcontractors'
import type { PutV1ContractorsContractorUuidRequestBody } from '@gusto/embedded-api/models/operations/putv1contractorscontractoruuid'
import type { Contractor$Outbound } from '@gusto/embedded-api/models/components/contractor'
import { API_BASE_URL } from '@/test/constants'

const basicContractor: Contractor$Outbound = {
  uuid: 'contractor-123',
  version: '1.0',
  type: 'Business',
  wage_type: 'Fixed',
  start_date: '2024-01-01',
  business_name: 'Test Business',
  ein: '12-3456789',
  is_active: true,
  file_new_hire_report: false,
}

export function handleGetContractor(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1ContractorsContractorUuidRequest,
    { contractor: Contractor$Outbound }
  >,
) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractor_uuid`, resolver)
}

export const getContractor = http.get(`${API_BASE_URL}/v1/contractors/:contractor_uuid`, () => {
  return HttpResponse.json({ contractor: basicContractor })
})

export function handleCreateContractor(
  resolver: HttpResponseResolver<
    PathParams,
    PostV1CompaniesCompanyUuidContractorsRequestBody,
    { contractor: Contractor$Outbound }
  >,
) {
  return http.post(`${API_BASE_URL}/v1/companies/:company_uuid/contractors`, resolver)
}

export const createContractor = http.post<
  PathParams,
  PostV1CompaniesCompanyUuidContractorsRequestBody,
  { contractor: Contractor$Outbound }
>(`${API_BASE_URL}/v1/companies/:company_uuid/contractors`, async ({ request }) => {
  const requestBody = await request.json()

  return HttpResponse.json(
    {
      contractor: {
        uuid: 'new-contractor-123',
        version: '1.0',
        type: requestBody.type,
        wage_type: requestBody.wageType,
        start_date: requestBody.startDate,
        business_name: requestBody.businessName,
        ein: requestBody.ein,
        first_name: requestBody.firstName,
        middle_initial: requestBody.middleInitial,
        last_name: requestBody.lastName,
        has_ssn: true,
        email: requestBody.email,
        hourly_rate: requestBody.hourlyRate,
        is_active: true,
        file_new_hire_report: false,
      },
    },
    { status: 201 },
  )
})

export function handleUpdateContractor(
  resolver: HttpResponseResolver<
    PathParams,
    PutV1ContractorsContractorUuidRequestBody,
    { contractor: Contractor$Outbound }
  >,
) {
  return http.put(`${API_BASE_URL}/v1/contractors/:contractor_uuid`, resolver)
}

export const updateContractor = http.put<
  PathParams,
  PutV1ContractorsContractorUuidRequestBody,
  { contractor: Contractor$Outbound }
>(`${API_BASE_URL}/v1/contractors/:contractor_uuid`, async ({ request, params }) => {
  const requestBody = await request.json()

  return HttpResponse.json({
    contractor: {
      uuid: params.contractor_uuid as string,
      version: requestBody.version,
      type: requestBody.type,
      wage_type: requestBody.wageType,
      start_date: requestBody.startDate,
      business_name: requestBody.businessName,
      ein: requestBody.ein,
      first_name: requestBody.firstName,
      middle_initial: requestBody.middleInitial,
      last_name: requestBody.lastName,
      has_ssn: true,
      email: requestBody.email,
      hourly_rate: requestBody.hourlyRate,
      is_active: true,
      file_new_hire_report: false,
    },
  })
})

export default [getContractor, createContractor, updateContractor]
