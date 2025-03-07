import { http, HttpResponse, HttpResponseResolver } from 'msw'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

export function handleGetPaySchedules(
  resolver: HttpResponseResolver<
    PathParams<'get-v1-companies-company_id-pay_schedules'>,
    RequestBodyParams<'get-v1-companies-company_id-pay_schedules'>,
    ResponseType<'get-v1-companies-company_id-pay_schedules', 200>
  >,
) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, resolver)
}

const getPaySchedules = handleGetPaySchedules(() =>
  HttpResponse.json([
    {
      uuid: 'schedule-1',
      frequency: 'Every week',
      anchor_pay_date: '2024-01-01',
      anchor_end_of_pay_period: '2024-01-07',
      custom_name: 'Weekly Schedule',
      active: true,
    },
  ]),
)

export function handleCreatePaySchedule(
  resolver: HttpResponseResolver<
    PathParams<'post-v1-companies-company_id-pay_schedules'>,
    RequestBodyParams<'post-v1-companies-company_id-pay_schedules'>,
    | ResponseType<'post-v1-companies-company_id-pay_schedules', 201>
    | { errors: Array<{ error_key: string; category: string; message: string }> }
  >,
) {
  return http.post(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, resolver)
}

const createPaySchedule = handleCreatePaySchedule(async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: 'new-schedule-1',
    frequency: requestBody.frequency,
    anchor_pay_date: requestBody.anchor_pay_date,
    anchor_end_of_pay_period: requestBody.anchor_end_of_pay_period,
    custom_name: requestBody.custom_name,
    active: true,
  })
})

export function handleUpdatePaySchedule(
  resolver: HttpResponseResolver<
    PathParams<'put-v1-companies-company_id-pay_schedules-pay_schedule_id'>,
    RequestBodyParams<'put-v1-companies-company_id-pay_schedules-pay_schedule_id'>,
    | ResponseType<'put-v1-companies-company_id-pay_schedules-pay_schedule_id', 200>
    | { errors: Array<{ error_key: string; category: string; message: string }> }
  >,
) {
  return http.put(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:schedule_id`, resolver)
}

const updatePaySchedule = handleUpdatePaySchedule(async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: 'schedule-1',
    frequency: requestBody.frequency,
    anchor_pay_date: requestBody.anchor_pay_date,
    anchor_end_of_pay_period: requestBody.anchor_end_of_pay_period,
    custom_name: requestBody.custom_name,
    active: true,
  })
})

export function handleGetPaySchedulePreview(
  resolver: HttpResponseResolver<
    PathParams<'get-v1-companies-company_id-pay_schedules-preview'>,
    RequestBodyParams<'get-v1-companies-company_id-pay_schedules-preview'>,
    ResponseType<'get-v1-companies-company_id-pay_schedules-preview', 200>
  >,
) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/preview`, resolver)
}

const getPaySchedulePreview = handleGetPaySchedulePreview(() =>
  HttpResponse.json({
    pay_periods: [
      {
        check_date: '2024-01-07',
        end_date: '2024-01-06',
        start_date: '2024-01-01',
        run_payroll_by: '2024-01-05',
      },
      {
        check_date: '2024-01-14',
        end_date: '2024-01-13',
        start_date: '2024-01-07',
        run_payroll_by: '2024-01-12',
      },
    ],
  }),
)

export default [getPaySchedules, createPaySchedule, updatePaySchedule, getPaySchedulePreview]
