import { http, HttpResponse } from 'msw'
import { getFixture } from '../fixtures/getFixture'
import type { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/test/constants'

export const getEmptyEmployeeBankAccounts = http.get(
  `${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`,
  () => HttpResponse.json([]),
)

const getEmployeeBankAccounts = http.get<
  PathParams<'get-v1-employees-employee_id-bank_accounts'>,
  RequestBodyParams<'get-v1-employees-employee_id-bank_accounts'>,
  ResponseType<'get-v1-employees-employee_id-bank_accounts', 200>
>(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, async ({ params }) => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-bank_accounts')
  return HttpResponse.json(responseFixture)
})

const createEmployeeBankAccount = http.post<
  PathParams<'post-v1-employees-employee_id-bank_accounts'>,
  RequestBodyParams<'post-v1-employees-employee_id-bank_accounts'>,
  ResponseType<'post-v1-employees-employee_id-bank_accounts', 201>
>(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, async ({ request }) => {
  const requestBody = await request.json()
  const responseFixture = await getFixture('get-v1-employees-employee_id-bank_accounts')
  return HttpResponse.json({
    ...responseFixture[0],
    account_type: requestBody.account_type,
    hidden_account_number: requestBody.account_number,
    name: requestBody.name,
    routing_number: requestBody.routing_number,
  })
})

const deleteEmployeeBankAccount = http.delete<
  PathParams<'delete-v1-employees-employee_id-bank_accounts-bank_account_id'>,
  RequestBodyParams<'delete-v1-employees-employee_id-bank_accounts-bank_account_id'>,
  ResponseType<'delete-v1-employees-employee_id-bank_accounts-bank_account_id', 204>
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
  PathParams<'get-v1-employees-employee_id-payment_method'>,
  RequestBodyParams<'get-v1-employees-employee_id-payment_method'>,
  ResponseType<'get-v1-employees-employee_id-payment_method', 200>
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
  PathParams<'put-v1-employees-employee_id-payment_method'>,
  RequestBodyParams<'put-v1-employees-employee_id-payment_method'>,
  ResponseType<'put-v1-employees-employee_id-payment_method', 200>
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
