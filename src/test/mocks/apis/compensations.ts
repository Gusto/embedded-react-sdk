import { http, HttpResponse, type HttpResponseResolver, type PathParams } from 'msw'
import type { CompensationsRequestBody } from '@gusto/embedded-api-v-2025-11-15/models/components/compensationsrequestbody'
import { API_BASE_URL } from '@/test/constants'

export function handleCreateCompensation(
  resolver: HttpResponseResolver<PathParams, CompensationsRequestBody>,
) {
  return http.post(`${API_BASE_URL}/v1/jobs/:job_id/compensations`, resolver)
}

export function handleGetCompensation(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/compensations/:compensation_id`, resolver)
}

export function handleGetJob(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/jobs/:job_id`, resolver)
}

export function handleGetJobCompensations(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/jobs/:job_id/compensations`, resolver)
}

const employeeCreateCompensation = handleCreateCompensation(async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: '12345678-1234-5678-1234-567812345678',
    version: '1.0',
    job_uuid: 'job-uuid',
    rate: requestBody.rate,
    payment_unit: requestBody.paymentUnit,
    flsa_status: requestBody.flsaStatus,
    effective_date: requestBody.effectiveDate,
    adjust_for_minimum_wage: requestBody.adjustForMinimumWage,
  })
})

export default [employeeCreateCompensation]
