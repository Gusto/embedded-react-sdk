import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/api/constants'

import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'

const getCompanyEmployees = http.get<
  PathParams<'get-v1-companies-company_id-employees'>,
  RequestBodyParams<'get-v1-companies-company_id-employees'>,
  ResponseType<'get-v1-companies-company_id-employees', 200>
>(`${API_BASE_URL}/v1/companies/some-company-uuid/employees`, () =>
  HttpResponse.json([
    {
      uuid: 'some-unique-id',
      first_name: 'Maximus',
      last_name: 'Steel',
      payment_method: 'Direct Deposit',
    },
  ]),
)

const getEmployee = http.get<
  PathParams<'get-v1-employees'>,
  RequestBodyParams<'get-v1-employees'>,
  ResponseType<'get-v1-employees', 200>
>(`${API_BASE_URL}/v1/employees/:employee_id`, ({ params }) => {
  return HttpResponse.json({
    uuid: params.employee_id,
    first_name: 'Lucy',
    last_name: 'MacLean',
    payment_method: 'Direct Deposit',
  })
})

const createEmployee = http.post<
  PathParams<'post-v1-employees'>,
  RequestBodyParams<'post-v1-employees'>,
  ResponseType<'post-v1-employees', 201>
>(`${API_BASE_URL}/v1/companies/:company_id/employees`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    first_name: requestBody.first_name,
    last_name: requestBody.last_name,
    payment_method: 'Direct Deposit',
    uuid: 'employee-uuid',
  })
})

const updateEmployee = http.put<
  PathParams<'put-v1-employees'>,
  RequestBodyParams<'put-v1-employees'>,
  ResponseType<'put-v1-employees', 200>
>(`${API_BASE_URL}/v1/employees/:employee_id`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: '1234',
    first_name: requestBody.first_name || 'first_name',
    last_name: requestBody.last_name || 'last_name',
    payment_method: 'Direct Deposit',
  })
})

const deleteEmployee = http.delete<
  PathParams<'delete-v1-employee'>,
  RequestBodyParams<'delete-v1-employee'>,
  ResponseType<'delete-v1-employee', 204>
>(`${API_BASE_URL}/v1/employees/:employee_id`, () => {
  return new HttpResponse(null, {
    status: 204,
    statusText: 'Delete an employee',
  })
})

export default [getCompanyEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee]
