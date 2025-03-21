import { http, HttpResponse } from 'msw'
import { getFixture } from '../fixtures/getFixture'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

export const getEmployeeStateTaxes = http.get<
  PathParams<'get-v1-employees-employee_id-state_taxes'>,
  RequestBodyParams<'get-v1-employees-employee_id-state_taxes'>,
  ResponseType<'get-v1-employees-employee_id-state_taxes', 200>
>(`${API_BASE_URL}/v1/employees/:employee_id/state_taxes`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-state_taxes')
  return HttpResponse.json(responseFixture)
})

export const updateEmployeeStateTaxes = http.put<
  PathParams<'put-v1-employees-employee_id-state_taxes'>,
  RequestBodyParams<'put-v1-employees-employee_id-state_taxes'>,
  ResponseType<'put-v1-employees-employee_id-state_taxes', 200>
>(`${API_BASE_URL}/v1/employees/:employee_id/state_taxes`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-state_taxes')
  return HttpResponse.json(responseFixture)
})
