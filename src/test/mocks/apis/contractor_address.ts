import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1ContractorsContractorUuidRequest } from '@gusto/embedded-api/models/operations/getv1contractorscontractoruuid'
import type { GetV1ContractorsContractorUuidAddressRequest } from '@gusto/embedded-api/models/operations/getv1contractorscontractoruuidaddress'
import type { PutV1ContractorsContractorUuidAddressRequestBody } from '@gusto/embedded-api/models/operations/putv1contractorscontractoruuidaddress'
import type { Contractor$Outbound } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorAddress$Outbound } from '@gusto/embedded-api/models/components/contractoraddress'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export function handleGetContractor(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1ContractorsContractorUuidRequest,
    Contractor$Outbound
  >,
) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractorUuid`, resolver)
}

export const getContractor = handleGetContractor(async () => {
  const responseFixture = await getFixture('get-v1-contractors-contractor_id')
  return HttpResponse.json(responseFixture)
})

export function handleGetContractorAddress(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1ContractorsContractorUuidAddressRequest,
    ContractorAddress$Outbound
  >,
) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractorUuid/address`, resolver)
}

export const getContractorAddress = handleGetContractorAddress(async () => {
  const responseFixture = await getFixture('get-v1-contractors-contractor_id-address')
  return HttpResponse.json(responseFixture)
})

export function handleUpdateContractorAddress(
  resolver: HttpResponseResolver<
    PathParams,
    PutV1ContractorsContractorUuidAddressRequestBody,
    ContractorAddress$Outbound
  >,
) {
  return http.put(`${API_BASE_URL}/v1/contractors/:contractorUuid/address`, resolver)
}

export const updateContractorAddress = handleUpdateContractorAddress(async ({ request }) => {
  const requestBody = await request.json()
  const responseFixture = await getFixture('put-v1-contractors-contractor_id-address')
  return HttpResponse.json({
    ...responseFixture,
    ...requestBody,
  })
})

export default [getContractor, getContractorAddress, updateContractorAddress]
