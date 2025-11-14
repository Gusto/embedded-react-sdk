import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1ContractorsContractorUuidPaymentMethodRequest } from '@gusto/embedded-api/models/operations/getv1contractorscontractoruuidpaymentmethod'
import type { GetV1ContractorsContractorUuidBankAccountsRequest } from '@gusto/embedded-api/models/operations/getv1contractorscontractoruuidbankaccounts'
import type { PutV1ContractorsContractorIdPaymentMethodType } from '@gusto/embedded-api/models/operations/putv1contractorscontractoridpaymentmethod'
import type { PostV1ContractorsContractorUuidBankAccountsAccountType } from '@gusto/embedded-api/models/operations/postv1contractorscontractoruuidbankaccounts'
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
  PostV1ContractorsContractorUuidBankAccountsAccountType
>(`${API_BASE_URL}/v1/contractors/:contractor_id/bank_accounts`, async () => {
  const responseFixture = await getFixture('get-v1-contractors-contractor_id-bank_accounts')
  return HttpResponse.json(responseFixture[0], { status: 201 })
})

export default [
  getContractorPaymentMethod,
  getContractorBankAccounts,
  updateContractorPaymentMethod,
  createContractorBankAccount,
]
