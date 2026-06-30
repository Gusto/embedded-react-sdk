import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1ContractorsContractorUuidRequest } from '@gusto/embedded-api-v-2026-06-15/models/operations/getv1contractorscontractoruuid'
import type { GetV1ContractorsContractorUuidAddressRequest } from '@gusto/embedded-api-v-2026-06-15/models/operations/getv1contractorscontractoruuidaddress'
import type { ContractorAddressUpdateBody } from '@gusto/embedded-api-v-2026-06-15/models/components/contractoraddressupdatebody'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export function handleGetContractor(
  resolver: HttpResponseResolver<PathParams, GetV1ContractorsContractorUuidRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractorUuid`, resolver)
}

export const getContractor = handleGetContractor(async () => {
  const responseFixture = await getFixture('get-v1-contractors-contractor_id')
  return HttpResponse.json(responseFixture)
})

export function handleGetContractorAddress(
  resolver: HttpResponseResolver<PathParams, GetV1ContractorsContractorUuidAddressRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractorUuid/address`, resolver)
}

export const getContractorAddress = handleGetContractorAddress(async () => {
  const responseFixture = await getFixture('get-v1-contractors-contractor_id-address')
  return HttpResponse.json(responseFixture)
})

export function handleUpdateContractorAddress(
  resolver: HttpResponseResolver<PathParams, ContractorAddressUpdateBody>,
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
