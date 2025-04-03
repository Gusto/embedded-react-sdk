import type { PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1CompaniesCompanyIdPaySchedulesRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayschedules'
import type { PostV1CompaniesCompanyIdPaySchedulesRequestBody } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayschedules'
import type { PutV1CompaniesCompanyIdPaySchedulesPayScheduleIdRequestBody } from '@gusto/embedded-api/models/operations/putv1companiescompanyidpayschedulespayscheduleid'
import type {
  GetV1CompaniesCompanyIdPaySchedulesPreviewRequest,
  GetV1CompaniesCompanyIdPaySchedulesPreviewResponseBody$Outbound,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayschedulespreview'
import type { PayScheduleList$Outbound } from '@gusto/embedded-api/models/components/payschedulelist'
import type { PayScheduleCreateUpdate$Outbound } from '@gusto/embedded-api/models/components/payschedulecreateupdate'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export const getPaySchedules = http.get<
  PathParams,
  GetV1CompaniesCompanyIdPaySchedulesRequest,
  PayScheduleList$Outbound[]
>(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, async () => {
  const responseFixture = await getFixture('get-v1-companies-company_id-pay_schedules')
  return HttpResponse.json(responseFixture.payScheduleList)
})

export const createPaySchedule = http.post<
  PathParams<'post-v1-companies-company_id-pay_schedules'>,
  PostV1CompaniesCompanyIdPaySchedulesRequestBody,
  PayScheduleCreateUpdate$Outbound
>(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, async ({ request }) => {
  const requestBody = await request.json()
  const responseFixture = await getFixture('post-v1-companies-company_id-pay_schedules')
  // Merge the request body with the fixture template
  const response = {
    ...responseFixture,
    ...requestBody,
  }

  return HttpResponse.json(response, { status: 201 })
})

export const updatePaySchedule = http.put<
  PathParams<'put-v1-companies-company_id-pay_schedules-pay_schedule_id'>,
  PutV1CompaniesCompanyIdPaySchedulesPayScheduleIdRequestBody,
  PayScheduleCreateUpdate$Outbound
>(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:schedule_id`, async ({ request }) => {
  const requestBody = await request.json()
  const responseFixture = await getFixture(
    'put-v1-companies-company_id-pay_schedules-pay_schedule_id',
  )

  // Merge the request body with the fixture template
  const response = {
    ...responseFixture,
    ...requestBody,
  }

  return HttpResponse.json(response)
})

export const getPaySchedulePreview = http.get<
  PathParams<'get-v1-companies-company_id-pay_schedules-preview'>,
  GetV1CompaniesCompanyIdPaySchedulesPreviewRequest,
  Partial<GetV1CompaniesCompanyIdPaySchedulesPreviewResponseBody$Outbound>
>(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/preview`, async () => {
  const responseFixture = await getFixture('get-v1-companies-company_id-pay_schedules-preview')
  return HttpResponse.json(responseFixture)
})

export default [getPaySchedules, createPaySchedule, updatePaySchedule, getPaySchedulePreview]
