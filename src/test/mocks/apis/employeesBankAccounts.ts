import type { PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1EmployeesEmployeeIdBankAccountsRequest } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidbankaccounts'
import type { PostV1EmployeesEmployeeIdBankAccountsRequestBody } from '@gusto/embedded-api/models/operations/postv1employeesemployeeidbankaccounts'
import type {
  DeleteV1EmployeesEmployeeIdBankAccountsBankAccountIdRequest,
  DeleteV1EmployeesEmployeeIdBankAccountsBankAccountIdResponse,
} from '@gusto/embedded-api/models/operations/deletev1employeesemployeeidbankaccountsbankaccountid'
import type { GetV1EmployeesEmployeeIdPaymentMethodRequest } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidpaymentmethod'
import type { PutV1EmployeesEmployeeIdPaymentMethodRequestBody } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidpaymentmethod'
import type { EmployeeBankAccount$Outbound } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { EmployeePaymentMethod$Outbound } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export const getEmptyEmployeeBankAccounts = http.get(
  `${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`,
  () => HttpResponse.json([]),
)

const getEmployeeBankAccounts = http.get<
  PathParams,
  GetV1EmployeesEmployeeIdBankAccountsRequest,
  EmployeeBankAccount$Outbound[]
>(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, async ({ params }) => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-bank_accounts')
  return HttpResponse.json(responseFixture)
})

const createEmployeeBankAccount = http.post<
  PathParams,
  PostV1EmployeesEmployeeIdBankAccountsRequestBody,
  EmployeeBankAccount$Outbound
>(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, async ({ request }) => {
  const requestBody = await request.json()
  const responseFixture = await getFixture('get-v1-employees-employee_id-bank_accounts')
  return HttpResponse.json({
    ...responseFixture[0],
    accountType: requestBody.accountType,
    hiddenAccountNumber: requestBody.accountNumber,
    name: requestBody.name,
    routingNumber: requestBody.routingNumber,
  })
})

const deleteEmployeeBankAccount = http.delete<
  PathParams,
  DeleteV1EmployeesEmployeeIdBankAccountsBankAccountIdRequest,
  DeleteV1EmployeesEmployeeIdBankAccountsBankAccountIdResponse
>(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts/:bank_account_id`, () => {
  return new HttpResponse(null, {
    status: 204,
    statusText: 'Delete an employee',
  })
})

export const getEmptyEmployeePaymentMethod = http.get(
  `${API_BASE_URL}/v1/employees/:employee_id/payment_method`,
  () =>
    HttpResponse.json({
      version: 'ad88c4e3c40f122582e425030d5c2771',
      type: 'Check',
    }),
)

const getEmployeePaymentMethod = http.get<
  PathParams,
  GetV1EmployeesEmployeeIdPaymentMethodRequest,
  EmployeePaymentMethod$Outbound
>(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, async ({ params }) => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-payment_method')
  return HttpResponse.json(responseFixture)
})

export const updateEmptyEmployeePaymentMethod = http.put(
  `${API_BASE_URL}/v1/employees/:employee_id/payment_method`,
  () =>
    HttpResponse.json({
      version: 'ad88c4e3c40f122582e425030d5c2771',
      type: 'Check',
    }),
)

const updateEmployeePaymentMethod = http.put<
  PathParams,
  PutV1EmployeesEmployeeIdPaymentMethodRequestBody,
  EmployeePaymentMethod$Outbound
>(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, async ({ request }) => {
  const requestBody = await request.json()
  const responseFixture = await getFixture('get-v1-employees-employee_id-payment_method')
  return HttpResponse.json({
    ...responseFixture,
    ...requestBody,
  })
})

export default [
  getEmployeeBankAccounts,
  createEmployeeBankAccount,
  deleteEmployeeBankAccount,
  getEmployeePaymentMethod,
  updateEmployeePaymentMethod,
]
