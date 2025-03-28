import type { PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1EmployeesEmployeeIdWorkAddressesRequest } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidworkaddresses'
import type { GetV1WorkAddressesWorkAddressUuidRequest } from '@gusto/embedded-api/models/operations/getv1workaddressesworkaddressuuid'
import type {
  DeleteV1WorkAddressesWorkAddressUuidRequest,
  DeleteV1WorkAddressesWorkAddressUuidResponse,
} from '@gusto/embedded-api/models/operations/deletev1workaddressesworkaddressuuid'
import type { PutV1WorkAddressesWorkAddressUuidRequestBody } from '@gusto/embedded-api/models/operations/putv1workaddressesworkaddressuuid'
import type { PostV1EmployeesEmployeeIdWorkAddressesRequestBody } from '@gusto/embedded-api/models/operations/postv1employeesemployeeidworkaddresses'
import type { EmployeeWorkAddress$Outbound } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export const getEmployeeWorkAddresses = http.get<
  PathParams,
  GetV1EmployeesEmployeeIdWorkAddressesRequest,
  EmployeeWorkAddress$Outbound[]
>(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-work_addresses')
  return HttpResponse.json(responseFixture)
})

export const getEmployeeWorkAddress = http.get<
  PathParams,
  GetV1WorkAddressesWorkAddressUuidRequest,
  EmployeeWorkAddress$Outbound
>(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, async () => {
  const responseFixture = await getFixture('get-v1-work_addresses-work_address_uuid')
  return HttpResponse.json(responseFixture)
})

export const createEmployeeWorkAddress = http.post<
  PathParams,
  PostV1EmployeesEmployeeIdWorkAddressesRequestBody,
  EmployeeWorkAddress$Outbound
>(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, async () => {
  const responseFixture = await getFixture('get-v1-work_addresses-work_address_uuid')
  return HttpResponse.json(responseFixture)
})

export const updateEmployeeWorkAddress = http.put<
  PathParams,
  PutV1WorkAddressesWorkAddressUuidRequestBody,
  EmployeeWorkAddress$Outbound
>(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, async () => {
  const responseFixture = await getFixture('get-v1-work_addresses-work_address_uuid')
  return HttpResponse.json(responseFixture)
})

export const deleteEmployeeWorkAddress = http.delete<
  PathParams<'delete-v1-work_addresses-work_address_uuid'>,
  DeleteV1WorkAddressesWorkAddressUuidRequest,
  DeleteV1WorkAddressesWorkAddressUuidResponse
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
