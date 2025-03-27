import type { PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type {
  GetV1EmployeesEmployeeIdFederalTaxesRequest,
  GetV1EmployeesEmployeeIdFederalTaxesResponse,
} from '@gusto/embedded-api/models/operations/getv1employeesemployeeidfederaltaxes'
import type {
  PutV1EmployeesEmployeeIdFederalTaxesRequestBody,
  PutV1EmployeesEmployeeIdFederalTaxesResponse,
} from '@gusto/embedded-api/models/operations/putv1employeesemployeeidfederaltaxes'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export const getEmployeeFederalTaxes = http.get<
  PathParams,
  GetV1EmployeesEmployeeIdFederalTaxesRequest,
  GetV1EmployeesEmployeeIdFederalTaxesResponse
>(`${API_BASE_URL}/v1/employees/:employee_id/federal_taxes`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-federal_taxes')
  return HttpResponse.json(responseFixture)
})

export const updateEmployeeFederalTaxes = http.put<
  PathParams,
  PutV1EmployeesEmployeeIdFederalTaxesRequestBody,
  PutV1EmployeesEmployeeIdFederalTaxesResponse
>(`${API_BASE_URL}/v1/employees/:employee_id/federal_taxes`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-federal_taxes')
  return HttpResponse.json(responseFixture)
})
