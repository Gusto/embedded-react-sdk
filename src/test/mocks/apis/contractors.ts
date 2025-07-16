import type { HttpResponseResolver, PathParams } from 'msw'
import { http } from 'msw'
import type { GetV1ContractorsContractorUuidRequest } from '@gusto/embedded-api/models/operations/getv1contractorscontractoruuid'
import type { PostV1CompaniesCompanyUuidContractorsRequestBody } from '@gusto/embedded-api/models/operations/postv1companiescompanyuuidcontractors'
import type { PutV1ContractorsContractorUuidRequestBody } from '@gusto/embedded-api/models/operations/putv1contractorscontractoruuid'
import type { Contractor$Outbound } from '@gusto/embedded-api/models/components/contractor'
import { API_BASE_URL } from '@/test/constants'

export function handleGetContractor(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1ContractorsContractorUuidRequest,
    Contractor$Outbound
  >,
) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractor_uuid`, resolver)
}

export function handleCreateContractor(
  resolver: HttpResponseResolver<
    PathParams,
    PostV1CompaniesCompanyUuidContractorsRequestBody,
    Contractor$Outbound
  >,
) {
  return http.post(`${API_BASE_URL}/v1/companies/:company_uuid/contractors`, resolver)
}

export function handleUpdateContractor(
  resolver: HttpResponseResolver<
    PathParams,
    PutV1ContractorsContractorUuidRequestBody,
    Contractor$Outbound
  >,
) {
  return http.put(`${API_BASE_URL}/v1/contractors/:contractor_uuid`, resolver)
}
