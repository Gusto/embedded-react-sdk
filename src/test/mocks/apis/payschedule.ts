import { http, HttpResponse } from 'msw'
import { getFixture } from '../fixtures/getFixture'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

export const getPaySchedules = http.get<
  PathParams<'get-v1-companies-company_id-pay_schedules'>,
  RequestBodyParams<'get-v1-companies-company_id-pay_schedules'>,
  ResponseType<'get-v1-companies-company_id-pay_schedules', 200>
>(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, async () => {
  const responseFixture = await getFixture('get-v1-companies-company_id-pay_schedules')
  return HttpResponse.json(responseFixture.payScheduleList)
})

export const createPaySchedule = http.post<
  PathParams<'post-v1-companies-company_id-pay_schedules'>,
  RequestBodyParams<'post-v1-companies-company_id-pay_schedules'>,
  ResponseType<'post-v1-companies-company_id-pay_schedules', 201>
>(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, async ({ request }) => {
  const requestBody = await request.json()
  const responseFixture = await getFixture('post-v1-companies-company_id-pay_schedules')
  // Merge the request body with the fixture template
  const response = {
    ...responseFixture,
    frequency: requestBody.frequency,
    anchor_pay_date: requestBody.anchor_pay_date,
    anchor_end_of_pay_period: requestBody.anchor_end_of_pay_period,
    custom_name: requestBody.custom_name,
  }

  return HttpResponse.json(response, { status: 201 })
})

export const updatePaySchedule = http.put<
  PathParams<'put-v1-companies-company_id-pay_schedules-pay_schedule_id'>,
  RequestBodyParams<'put-v1-companies-company_id-pay_schedules-pay_schedule_id'>,
  ResponseType<'put-v1-companies-company_id-pay_schedules-pay_schedule_id', 200>
>(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:schedule_id`, async ({ request }) => {
  const requestBody = await request.json()
  const responseFixture = await getFixture(
    'put-v1-companies-company_id-pay_schedules-pay_schedule_id',
  )

  // Merge the request body with the fixture template
  const response = {
    ...responseFixture,
    frequency: requestBody.frequency,
    anchor_pay_date: requestBody.anchor_pay_date,
    anchor_end_of_pay_period: requestBody.anchor_end_of_pay_period,
    custom_name: requestBody.custom_name,
  }

  return HttpResponse.json(response)
})

export const getPaySchedulePreview = http.get<
  PathParams<'get-v1-companies-company_id-pay_schedules-preview'>,
  RequestBodyParams<'get-v1-companies-company_id-pay_schedules-preview'>,
  ResponseType<'get-v1-companies-company_id-pay_schedules-preview', 200>
>(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/preview`, async () => {
  const responseFixture = await getFixture('get-v1-companies-company_id-pay_schedules-preview')
  return HttpResponse.json(responseFixture)
})

export default [getPaySchedules, createPaySchedule, updatePaySchedule, getPaySchedulePreview]
