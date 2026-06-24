import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1EmployeesEmployeeIdFederalTaxesRequest } from '@gusto/embedded-api-v-2026-02-01/models/operations/getv1employeesemployeeidfederaltaxes'
import type { PutV1EmployeesEmployeeIdFederalTaxesRequestBody } from '@gusto/embedded-api-v-2026-02-01/models/operations/putv1employeesemployeeidfederaltaxes'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export function handleGetEmployeeFederalTaxes(
  resolver: HttpResponseResolver<PathParams, GetV1EmployeesEmployeeIdFederalTaxesRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/employees/:employee_id/federal_taxes`, resolver)
}

export const getEmployeeFederalTaxes = handleGetEmployeeFederalTaxes(async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-federal_taxes')
  return HttpResponse.json(responseFixture)
})

export function handleUpdateEmployeeFederalTaxes(
  resolver: HttpResponseResolver<PathParams, PutV1EmployeesEmployeeIdFederalTaxesRequestBody>,
) {
  return http.put(`${API_BASE_URL}/v1/employees/:employee_id/federal_taxes`, resolver)
}

export const updateEmployeeFederalTaxes = handleUpdateEmployeeFederalTaxes(async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-federal_taxes')
  return HttpResponse.json(responseFixture)
})
