import { http, HttpResponse, type PathParams } from 'msw'
import type { PostV1CompensationsCompensationIdRequestBody } from '@gusto/embedded-api/models/operations/postv1compensationscompensationid'
import type { Compensation$Outbound } from '@gusto/embedded-api/models/components/compensation'
import { API_BASE_URL } from '@/test/constants'

const employeeCreateCompensation = http.post<
  PathParams,
  PostV1CompensationsCompensationIdRequestBody,
  Compensation$Outbound
>(`${API_BASE_URL}/v1/jobs/:job_id/compensations`, async ({ request }) => {
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
