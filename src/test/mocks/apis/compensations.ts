import { http, HttpResponse, type PathParams } from 'msw'
import type {
  PostV1CompensationsCompensationIdRequestBody,
  PostV1CompensationsCompensationIdResponse,
} from '@gusto/embedded-api/models/operations/postv1compensationscompensationid'
import { API_BASE_URL } from '@/test/constants'

const employeeCreateCompensation = http.post<
  PathParams,
  PostV1CompensationsCompensationIdRequestBody,
  Partial<PostV1CompensationsCompensationIdResponse>
>(`${API_BASE_URL}/v1/jobs/:job_id/compensations`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    compensation: {
      uuid: '12345678-1234-5678-1234-567812345678',
      version: '1.0',
      jobUuid: 'job-uuid',
      rate: requestBody.rate,
      paymentUnit: requestBody.paymentUnit,
      flsaStatus: requestBody.flsaStatus,
      effectiveDate: requestBody.effectiveDate,
      adjustForMinimumWage: requestBody.adjustForMinimumWage,
    },
  })
})

export default [employeeCreateCompensation]
