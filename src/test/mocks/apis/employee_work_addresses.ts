import { http, HttpResponse } from 'msw'
import { getFixture } from '../fixtures/getFixture'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

export const getEmployeeWorkAddresses = http.get<
  PathParams<'get-v1-employees-employee_id-work_addresses'>,
  RequestBodyParams<'get-v1-employees-employee_id-work_addresses'>,
  ResponseType<'get-v1-employees-employee_id-work_addresses', 200>
>(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-work_addresses')
  return HttpResponse.json(responseFixture)
})

export const getEmployeeWorkAddress = http.get<
  PathParams<'get-v1-work_addresses-work_address_uuid'>,
  RequestBodyParams<'get-v1-work_addresses-work_address_uuid'>,
  ResponseType<'get-v1-work_addresses-work_address_uuid', 200>
>(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, async () => {
  const responseFixture = await getFixture('get-v1-work_addresses-work_address_uuid')
  return HttpResponse.json(responseFixture)
})

export const createEmployeeWorkAddress = http.post<
  PathParams<'post-v1-employees-employee_id-work_addresses'>,
  RequestBodyParams<'post-v1-employees-employee_id-work_addresses'>,
  ResponseType<'post-v1-employees-employee_id-work_addresses', 201>
>(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, async () => {
  const responseFixture = await getFixture('get-v1-work_addresses-work_address_uuid')
  return HttpResponse.json(responseFixture)
})

export const updateEmployeeWorkAddress = http.put<
  PathParams<'put-v1-work_addresses-work_address_uuid'>,
  RequestBodyParams<'put-v1-work_addresses-work_address_uuid'>,
  ResponseType<'put-v1-work_addresses-work_address_uuid', 200>
>(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, async () => {
  const responseFixture = await getFixture('get-v1-work_addresses-work_address_uuid')
  return HttpResponse.json(responseFixture)
})

export const deleteEmployeeWorkAddress = http.delete<
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
