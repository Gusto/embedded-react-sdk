import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1ContractorsContractorUuidPaymentMethodRequest } from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1contractorscontractoruuidpaymentmethod'
import type { GetV1ContractorsContractorUuidBankAccountsRequest } from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1contractorscontractoruuidbankaccounts'
import type { PutV1ContractorsContractorIdPaymentMethodType } from '@gusto/embedded-api-v-2025-11-15/models/operations/putv1contractorscontractoridpaymentmethod'
import type { ContractorBankAccountCreateRequestBody } from '@gusto/embedded-api-v-2025-11-15/models/components/contractorbankaccountcreaterequestbody'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export function handleGetContractorPaymentMethod(
  resolver: HttpResponseResolver<PathParams, GetV1ContractorsContractorUuidPaymentMethodRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractor_id/payment_method`, resolver)
}
export const getContractorPaymentMethod = http.get(
  `${API_BASE_URL}/v1/contractors/:contractor_id/payment_method`,
  async () => {
    const responseFixture = await getFixture('get-v1-contractors-contractor_id-payment_method')
    return HttpResponse.json(responseFixture)
  },
)

export const updateContractorPaymentMethod = http.put<
  PathParams,
  PutV1ContractorsContractorIdPaymentMethodType
>(`${API_BASE_URL}/v1/contractors/:contractor_id/payment_method`, async () => {
  const responseFixture = await getFixture('get-v1-contractors-contractor_id-payment_method')
  return HttpResponse.json(responseFixture)
})

export function handleGetContractorBankAccounts(
  resolver: HttpResponseResolver<PathParams, GetV1ContractorsContractorUuidBankAccountsRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractor_id/bank_accounts`, resolver)
}

export const getContractorBankAccounts = http.get(
  `${API_BASE_URL}/v1/contractors/:contractor_id/bank_accounts`,
  async () => {
    const responseFixture = await getFixture('get-v1-contractors-contractor_id-bank_accounts')
    return HttpResponse.json(responseFixture)
  },
)
export const createContractorBankAccount = http.post<
  PathParams,
  ContractorBankAccountCreateRequestBody
>(`${API_BASE_URL}/v1/contractors/:contractor_id/bank_accounts`, async () => {
  const responseFixture = await getFixture('get-v1-contractors-contractor_id-bank_accounts')
  return HttpResponse.json(responseFixture[0], { status: 201 })
})

export function handleCreateContractorBankAccount(
  resolver: HttpResponseResolver<PathParams, ContractorBankAccountCreateRequestBody>,
) {
  return http.post(`${API_BASE_URL}/v1/contractors/:contractor_id/bank_accounts`, resolver)
}

export default [
  getContractorPaymentMethod,
  getContractorBankAccounts,
  updateContractorPaymentMethod,
  createContractorBankAccount,
]
