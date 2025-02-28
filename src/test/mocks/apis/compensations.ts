import { http, HttpResponse } from 'msw'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

const employeeCreateCompensation = http.post<
  PathParams<'post-v1-compensations-compensation_id'>,
  RequestBodyParams<'post-v1-compensations-compensation_id'>,
  ResponseType<'post-v1-compensations-compensation_id', 201>
>(`${API_BASE_URL}/v1/jobs/:job_id/compensations`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: '12345678-1234-5678-1234-567812345678',
    version: '1.0',
    job_uuid: 'job-uuid',
    rate: requestBody.rate,
    payment_unit: requestBody.payment_unit,
    flsa_status: requestBody.flsa_status,
    effective_date: requestBody.effective_date,
    adjust_for_minimum_wage: requestBody.adjust_for_minimum_wage,
  })
})

export default [employeeCreateCompensation]
