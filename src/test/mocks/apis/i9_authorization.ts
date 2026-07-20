import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1EmployeesEmployeeIdI9AuthorizationRequest } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidi9authorization'
import type { I9AuthorizationRequestBody } from '@gusto/embedded-api/models/components/i9authorizationrequestbody'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export function handleGetI9Authorization(
  resolver: HttpResponseResolver<PathParams, GetV1EmployeesEmployeeIdI9AuthorizationRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/employees/:employee_id/i9_authorization`, resolver)
}

export const getI9Authorization = handleGetI9Authorization(async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-i9_authorization')
  return HttpResponse.json(responseFixture)
})

export const getI9AuthorizationNotFound = handleGetI9Authorization(() => {
  return new HttpResponse(null, { status: 404 })
})

export function handleUpdateI9Authorization(
  resolver: HttpResponseResolver<PathParams, I9AuthorizationRequestBody>,
) {
  return http.put(`${API_BASE_URL}/v1/employees/:employee_id/i9_authorization`, resolver)
}

export const updateI9Authorization = handleUpdateI9Authorization(async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-i9_authorization')
  return HttpResponse.json(responseFixture)
})

export default [getI9AuthorizationNotFound, updateI9Authorization]
