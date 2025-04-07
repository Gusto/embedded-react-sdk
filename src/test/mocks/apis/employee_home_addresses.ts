import type { PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type {
  GetV1EmployeesEmployeeIdHomeAddressesRequest,
  GetV1EmployeesEmployeeIdHomeAddressesResponse,
} from '@gusto/embedded-api/models/operations/getv1employeesemployeeidhomeaddresses'
import type {
  GetV1HomeAddressesHomeAddressUuidRequest,
  GetV1HomeAddressesHomeAddressUuidResponse,
} from '@gusto/embedded-api/models/operations/getv1homeaddresseshomeaddressuuid'
import type { PostV1EmployeesEmployeeIdHomeAddressesRequestBody } from '@gusto/embedded-api/models/operations/postv1employeesemployeeidhomeaddresses'
import type { PutV1HomeAddressesHomeAddressUuidRequestBody } from '@gusto/embedded-api/models/operations/putv1homeaddresseshomeaddressuuid'
import type {
  DeleteV1HomeAddressesHomeAddressUuidRequest,
  DeleteV1HomeAddressesHomeAddressUuidResponse,
} from '@gusto/embedded-api/models/operations/deletev1homeaddresseshomeaddressuuid'
import type { EmployeeAddress$Outbound } from '@gusto/embedded-api/models/components/employeeaddress'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export const getEmployeeHomeAddresses = http.get<
  PathParams,
  GetV1EmployeesEmployeeIdHomeAddressesRequest,
  GetV1EmployeesEmployeeIdHomeAddressesResponse
>(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-home_addresses')
  return HttpResponse.json(responseFixture)
})

export const getEmployeeHomeAddress = http.get<
  PathParams,
  GetV1HomeAddressesHomeAddressUuidRequest,
  GetV1HomeAddressesHomeAddressUuidResponse
>(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async () => {
  const responseFixture = await getFixture('get-v1-home_addresses-home_address_uuid')
  return HttpResponse.json(responseFixture)
})

export const createEmployeeHomeAddress = http.post<
  PathParams,
  PostV1EmployeesEmployeeIdHomeAddressesRequestBody,
  EmployeeAddress$Outbound
>(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, async () => {
  const responseFixture = await getFixture('get-v1-home_addresses-home_address_uuid')
  return HttpResponse.json(responseFixture, { status: 201 })
})

export const updateEmployeeHomeAddress = http.put<
  PathParams,
  PutV1HomeAddressesHomeAddressUuidRequestBody,
  EmployeeAddress$Outbound
>(`${API_BASE_URL}/v1/home_addresses/:home_address_uuid`, async () => {
  const responseFixture = await getFixture('get-v1-home_addresses-home_address_uuid')
  return HttpResponse.json(responseFixture)
})

export const deleteEmployeeHomeAddress = http.delete<
  PathParams,
  DeleteV1HomeAddressesHomeAddressUuidRequest,
  DeleteV1HomeAddressesHomeAddressUuidResponse
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
