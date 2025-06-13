import type { PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1EmployeesEmployeeIdStateTaxesRequest } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidstatetaxes'
import type { PutV1EmployeesEmployeeIdStateTaxesRequest } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidstatetaxes'
import type { EmployeeStateTaxesList$Outbound } from '@gusto/embedded-api/models/components/employeestatetaxeslist'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export const getEmployeeStateTaxes = http.get<
  PathParams,
  GetV1EmployeesEmployeeIdStateTaxesRequest,
  EmployeeStateTaxesList$Outbound[]
>(`${API_BASE_URL}/v1/employees/:employee_id/state_taxes`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-state_taxes')
  return HttpResponse.json(responseFixture)
})

export const updateEmployeeStateTaxes = http.put<
  PathParams,
  PutV1EmployeesEmployeeIdStateTaxesRequest,
  EmployeeStateTaxesList$Outbound[]
>(`${API_BASE_URL}/v1/employees/:employee_id/state_taxes`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-state_taxes')
  return HttpResponse.json(responseFixture)
})
