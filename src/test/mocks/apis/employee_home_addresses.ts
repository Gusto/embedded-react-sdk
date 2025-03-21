import { http, HttpResponse } from 'msw'
import { getFixture } from '../fixtures/getFixture'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

export const getEmployeeHomeAddresses = http.get<
  PathParams<'get-v1-employees-employee_id-home_addresses'>,
  RequestBodyParams<'get-v1-employees-employee_id-home_addresses'>,
  ResponseType<'get-v1-employees-employee_id-home_addresses', 200>
>(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-home_addresses')
  return HttpResponse.json(responseFixture)
})

export const getEmployeeHomeAddress = http.get<
  PathParams<'get-v1-home_addresses-home_address_uuid'>,
  RequestBodyParams<'get-v1-home_addresses-home_address_uuid'>,
  ResponseType<'get-v1-home_addresses-home_address_uuid', 200>
>(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async () => {
  const responseFixture = await getFixture('get-v1-home_addresses-home_address_uuid')
  return HttpResponse.json(responseFixture)
})

export const createEmployeeHomeAddress = http.post<
  PathParams<'post-v1-employees-employee_id-home_addresses'>,
  RequestBodyParams<'post-v1-employees-employee_id-home_addresses'>,
  ResponseType<'post-v1-employees-employee_id-home_addresses', 201>
>(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, async () => {
  const responseFixture = await getFixture('get-v1-home_addresses-home_address_uuid')
  return HttpResponse.json(responseFixture)
})

export const updateEmployeeHomeAddress = http.put<
  PathParams<'put-v1-home_addresses-home_address_uuid'>,
  RequestBodyParams<'put-v1-home_addresses-home_address_uuid'>,
  ResponseType<'put-v1-home_addresses-home_address_uuid', 200>
>(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async () => {
  const responseFixture = await getFixture('get-v1-home_addresses-home_address_uuid')
  return HttpResponse.json(responseFixture)
})

export const deleteEmployeeHomeAddress = http.delete<
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
  updateEmployeeHomeAddress,
  deleteEmployeeHomeAddress,
]
