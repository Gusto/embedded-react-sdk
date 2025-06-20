import type { PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { PutV1ContractorsContractorUuidRequest } from '@gusto/embedded-api/models/operations/putv1contractorscontractoruuid'
import type { Contractor$Outbound } from '@gusto/embedded-api/models/components/contractor'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export const getContractor = http.get(`${API_BASE_URL}/v1/contractors/:contractor_id`, async () => {
  const responseFixture = await getFixture('get-v1-contractors-contractor_id')
  return HttpResponse.json(responseFixture)
})

export const updateContractor = http.put<
  PathParams,
  PutV1ContractorsContractorUuidRequest,
  Contractor$Outbound
>(`${API_BASE_URL}/v1/contractors/:contractor_id`, async () => {
  const responseFixture = await getFixture('get-v1-contractors-contractor_id')
  return HttpResponse.json(responseFixture)
})

export default [getContractor, updateContractor]
