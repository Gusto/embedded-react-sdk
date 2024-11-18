import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '../../../src/api/constants'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'

const getEmployeeHomeAddress = http.get<
  PathParams<'get-v1-home_addresses-home_address_uuid'>,
  RequestBodyParams<'get-v1-home_addresses-home_address_uuid'>,
  ResponseType<'get-v1-home_addresses-home_address_uuid', 200>
>(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, () =>
  HttpResponse.json({
    version: '1.0',
    street_1: '123 Main St',
    street_2: null,
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
    country: 'USA',
    active: true,
    uuid: 'address-uuid',
    employee_uuid: 'employee-uuid',
    effective_date: '2022-01-01',
    courtesy_withholding: true,
  }),
)

const getEmployeeHomeAddresses = http.get<
  PathParams<'get-v1-employees-employee_id-home_addresses'>,
  RequestBodyParams<'get-v1-employees-employee_id-home_addresses'>,
  ResponseType<'get-v1-employees-employee_id-home_addresses', 200>
>(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, () =>
  HttpResponse.json([
    {
      version: '1.0',
      street_1: '123 Main St',
      street_2: null,
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
      country: 'USA',
      active: true,
      uuid: 'address-uuid',
      employee_uuid: 'employee-uuid',
      effective_date: '2022-01-01',
      courtesy_withholding: true,
    },
  ]),
)

const createEmployeeHomeAddress = http.post<
  PathParams<'post-v1-employees-employee_id-home_addresses'>,
  RequestBodyParams<'post-v1-employees-employee_id-home_addresses'>,
  ResponseType<'post-v1-employees-employee_id-home_addresses', 200>
>(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    version: '1.0',
    street_1: requestBody.street_1,
    street_2: null,
    city: requestBody.city,
    state: requestBody.state,
    zip: requestBody.zip,
    country: 'USA',
    active: true,
    uuid: 'address-uuid',
    employee_uuid: 'employee-uuid',
    effective_date: '2022-01-01',
    courtesy_withholding: true,
  })
})

const updateEmployeeHomeAddress = http.put<
  PathParams<'put-v1-home_addresses-home_address_uuid'>,
  RequestBodyParams<'put-v1-home_addresses-home_address_uuid'>,
  ResponseType<'put-v1-home_addresses-home_address_uuid', 200>
>(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    version: '2.0',
    street_1: requestBody.street_1,
    street_2: null,
    city: requestBody.city,
    state: requestBody.state,
    zip: requestBody.zip,
    country: 'USA',
    active: true,
    uuid: 'address-uuid',
    employee_uuid: 'employee-uuid',
    effective_date: '2022-01-01',
    courtesy_withholding: true,
  })
})

const deleteEmployeeHomeAddress = http.delete<
  PathParams<'delete-v1-home_addresses-home_address_uuid'>,
  RequestBodyParams<'delete-v1-home_addresses-home_address_uuid'>,
  ResponseType<'delete-v1-home_addresses-home_address_uuid', 204>
>(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, () => {
  return new HttpResponse(null, {
    status: 204,
    statusText: 'Delete an employee',
  })
})

export default [
  getEmployeeHomeAddresses,
  getEmployeeHomeAddress,
  createEmployeeHomeAddress,
  updateEmployeeHomeAddress,
  deleteEmployeeHomeAddress,
]
