import { http, HttpResponse } from 'msw'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

const getEmployeeWorkAddress = http.get<
  PathParams<'get-v1-work_addresses-work_address_uuid'>,
  RequestBodyParams<'get-v1-work_addresses-work_address_uuid'>,
  ResponseType<'get-v1-work_addresses-work_address_uuid', 200>
>(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, () =>
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
  }),
)

const getEmployeeWorkAddresses = http.get<
  PathParams<'get-v1-employees-employee_id-work_addresses'>,
  RequestBodyParams<'get-v1-employees-employee_id-work_addresses'>,
  ResponseType<'get-v1-employees-employee_id-work_addresses', 200>
>(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
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
    },
  ]),
)

const createEmployeeWorkAddress = http.post<
  PathParams<'post-v1-employees-employee_id-work_addresses'>,
  RequestBodyParams<'post-v1-employees-employee_id-work_addresses'>,
  ResponseType<'post-v1-employees-employee_id-work_addresses', 201>
>(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    version: '1.0',
    country: 'USA',
    active: true,
    uuid: requestBody.location_uuid!,
    employee_uuid: 'employee-uuid',
    effective_date: '2022-01-01',
  })
})

const updateEmployeeWorkAddress = http.put<
  PathParams<'put-v1-work_addresses-work_address_uuid'>,
  RequestBodyParams<'put-v1-work_addresses-work_address_uuid'>,
  ResponseType<'put-v1-work_addresses-work_address_uuid', 200>
>(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, ({ request }) => {
  // const requestBody = await request.json()
  return HttpResponse.json({
    version: '2.0',
    country: 'USA',
    active: true,
    uuid: 'address-uuid',
    employee_uuid: 'employee-uuid',
    effective_date: '2022-01-01',
  })
})

const deleteEmployeeWorkAddress = http.delete<
  PathParams<'delete-v1-work_addresses-work_address_uuid'>,
  RequestBodyParams<'delete-v1-work_addresses-work_address_uuid'>,
  ResponseType<'delete-v1-work_addresses-work_address_uuid', 204>
>(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, () => {
  return new HttpResponse(null, {
    status: 204,
    statusText: 'Delete an employee work address',
  })
})

export default [
  getEmployeeWorkAddresses,
  getEmployeeWorkAddress,
  createEmployeeWorkAddress,
  updateEmployeeWorkAddress,
  deleteEmployeeWorkAddress,
]
