import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse, type PathParams } from 'msw'
import type { GetV1CompaniesCompanyIdBankAccountsRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidbankaccounts'
import type { CompanyBankAccount$Outbound } from '@gusto/embedded-api/models/components/companybankaccount'
import type { PostV1CompaniesCompanyIdBankAccountsRequest } from '@gusto/embedded-api/models/operations/postv1companiescompanyidbankaccounts'
import type { PutV1CompaniesCompanyIdBankAccountsVerifyRequestBody } from '@gusto/embedded-api/models/operations/putv1companiescompanyidbankaccountsverify'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export function handleGetCompanyBankAccounts(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1CompaniesCompanyIdBankAccountsRequest,
    CompanyBankAccount$Outbound[]
  >,
) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/bank_accounts`, resolver)
}
export const getCompanyBankAccounts = handleGetCompanyBankAccounts(async () => {
  const responseFixture = await getFixture('get-v1-companies-company_id-bank_accounts')
  return HttpResponse.json(responseFixture)
})

export const getEmptyCompanyBankAccounts = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/bank_accounts`,
  () => HttpResponse.json([]),
)

export function handlePostCompanyBankAccount(
  resolver: HttpResponseResolver<
    PathParams,
    PostV1CompaniesCompanyIdBankAccountsRequest,
    CompanyBankAccount$Outbound
  >,
) {
  return http.post(`${API_BASE_URL}/v1/companies/:company_id/bank_accounts`, resolver)
}
export const postCompanyBankAccount = handlePostCompanyBankAccount(async () => {
  const responseFixture = await getFixture('get-v1-companies-company_id-bank_accounts')
  return HttpResponse.json(responseFixture[0], { status: 201 })
})

export function handlePutCompanyBankAccountVerify(
  resolver: HttpResponseResolver<
    PathParams,
    PutV1CompaniesCompanyIdBankAccountsVerifyRequestBody,
    CompanyBankAccount$Outbound
  >,
) {
  return http.put(
    `${API_BASE_URL}/v1/companies/:company_id/bank_accounts/:bank_account_uuid/verify`,
    resolver,
  )
}
export const putCompanyBankAccountVerify = handlePutCompanyBankAccountVerify(async () => {
  const responseFixture = await getFixture('get-v1-companies-company_id-bank_accounts')
  return HttpResponse.json(responseFixture[0])
})

export default [getCompanyBankAccounts, postCompanyBankAccount, putCompanyBankAccountVerify]
