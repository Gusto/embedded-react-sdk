import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1EmployeesEmployeeIdStateTaxesRequest } from '@gusto/embedded-api-v-2026-06-15/models/operations/getv1employeesemployeeidstatetaxes'
import type { PutV1EmployeesEmployeeIdStateTaxesRequest } from '@gusto/embedded-api-v-2026-06-15/models/operations/putv1employeesemployeeidstatetaxes'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export function handleGetEmployeeStateTaxes(
  resolver: HttpResponseResolver<PathParams, GetV1EmployeesEmployeeIdStateTaxesRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/employees/:employee_id/state_taxes`, resolver)
}

export function handleUpdateEmployeeStateTaxes(
  resolver: HttpResponseResolver<PathParams, PutV1EmployeesEmployeeIdStateTaxesRequest>,
) {
  return http.put(`${API_BASE_URL}/v1/employees/:employee_id/state_taxes`, resolver)
}

export const getEmployeeStateTaxes = handleGetEmployeeStateTaxes(async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-state_taxes')
  return HttpResponse.json(responseFixture)
})

export const updateEmployeeStateTaxes = handleUpdateEmployeeStateTaxes(async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-state_taxes')
  return HttpResponse.json(responseFixture)
})
