import type { PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1CompaniesCompanyIdPaySchedulesRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayschedules'
import type { PostV1CompaniesCompanyIdPaySchedulesRequestBody } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayschedules'
import type { PutV1CompaniesCompanyIdPaySchedulesPayScheduleIdRequestBody } from '@gusto/embedded-api/models/operations/putv1companiescompanyidpayschedulespayscheduleid'
import type { GetV1CompaniesCompanyIdPaySchedulesPreviewRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayschedulespreview'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export const getPaySchedules = http.get<PathParams, GetV1CompaniesCompanyIdPaySchedulesRequest>(
  `${API_BASE_URL}/v1/companies/:company_id/pay_schedules`,
  async () => {
    const responseFixture = await getFixture('get-v1-companies-company_id-pay_schedules')
    return HttpResponse.json(responseFixture.payScheduleList)
  },
)

export const getPayScheduleAssignments = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/assignments`,
  () => {
    return HttpResponse.json({
      type: 'single',
      default_pay_schedule_uuid: 'schedule-1',
    })
  },
)

export const previewPayScheduleAssignment = http.post(
  `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/assignment_preview`,
  () => {
    return HttpResponse.json({
      employee_changes: [
        {
          employee_uuid: 'employee-1',
          first_name: 'John',
          last_name: 'Doe',
          current_pay_schedule_uuid: 'schedule-1',
          new_pay_schedule_uuid: 'schedule-1',
          pay_frequency: 'Every week',
          first_pay_period: {
            check_date: '2025-01-15',
          },
          transition_pay_period: {
            start_date: '2025-01-01',
            end_date: '2025-01-14',
          },
        },
      ],
    })
  },
)

export const assignPaySchedules = http.post(
  `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/assign`,
  () => {
    return new HttpResponse(null, { status: 200 })
  },
)

export const getDepartments = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/departments`,
  () => {
    return HttpResponse.json([
      {
        uuid: 'dept-1',
        title: 'Engineering',
        company_uuid: 'company-123',
      },
      {
        uuid: 'dept-2',
        title: 'Sales',
        company_uuid: 'company-123',
      },
    ])
  },
)

export const getEmployeesList = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/employees`,
  () => {
    return HttpResponse.json([
      {
        uuid: 'employee-1',
        first_name: 'John',
        last_name: 'Doe',
      },
      {
        uuid: 'employee-2',
        first_name: 'Jane',
        last_name: 'Smith',
      },
    ])
  },
)

export const createPaySchedule = http.post<
  PathParams<'post-v1-companies-company_id-pay_schedules'>,
  PostV1CompaniesCompanyIdPaySchedulesRequestBody
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
  PutV1CompaniesCompanyIdPaySchedulesPayScheduleIdRequestBody
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
  GetV1CompaniesCompanyIdPaySchedulesPreviewRequest
>(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/preview`, async () => {
  const responseFixture = await getFixture('get-v1-companies-company_id-pay_schedules-preview')
  return HttpResponse.json(responseFixture)
})

export default [
  getPaySchedules,
  createPaySchedule,
  updatePaySchedule,
  getPaySchedulePreview,
  getPayScheduleAssignments,
  previewPayScheduleAssignment,
  assignPaySchedules,
  getDepartments,
  getEmployeesList,
]
