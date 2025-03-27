import type { PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type {
  GetV1EmployeesEmployeeIdStateTaxesRequest,
  GetV1EmployeesEmployeeIdStateTaxesResponse,
} from '@gusto/embedded-api/models/operations/getv1employeesemployeeidstatetaxes'
import type {
  PutV1EmployeesEmployeeIdStateTaxesRequestBody,
  PutV1EmployeesEmployeeIdStateTaxesResponse,
} from '@gusto/embedded-api/models/operations/putv1employeesemployeeidstatetaxes'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export const getEmployeeStateTaxes = http.get<
  PathParams,
  GetV1EmployeesEmployeeIdStateTaxesRequest,
  GetV1EmployeesEmployeeIdStateTaxesResponse
>(`${API_BASE_URL}/v1/employees/:employee_id/state_taxes`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-state_taxes')
  return HttpResponse.json(responseFixture)
})

export const updateEmployeeStateTaxes = http.put<
  PathParams,
  PutV1EmployeesEmployeeIdStateTaxesRequestBody,
  PutV1EmployeesEmployeeIdStateTaxesResponse
>(`${API_BASE_URL}/v1/employees/:employee_id/state_taxes`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-state_taxes')
  return HttpResponse.json(responseFixture)
})
