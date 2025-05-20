import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetV1CompaniesCompanyIdEmployeesRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidemployees'
import type { GetV1EmployeesRequest } from '@gusto/embedded-api/models/operations/getv1employees'
import type { PostV1EmployeesRequestBody } from '@gusto/embedded-api/models/operations/postv1employees'
import type { PutV1EmployeesRequestBody } from '@gusto/embedded-api/models/operations/putv1employees'
import type {
  DeleteV1EmployeeRequest,
  DeleteV1EmployeeResponse,
} from '@gusto/embedded-api/models/operations/deletev1employee'
import type { GetV1EmployeesEmployeeIdOnboardingStatusRequest } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidonboardingstatus'
import type { PutV1EmployeesEmployeeIdOnboardingStatusRequestBody } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidonboardingstatus'
import type { GetV1EmployeesEmployeeIdJobsRequest } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidjobs'
import type { PostV1JobsJobIdRequestBody } from '@gusto/embedded-api/models/operations/postv1jobsjobid'
import type { PutV1CompensationsCompensationIdRequestBody } from '@gusto/embedded-api/models/operations/putv1compensationscompensationid'
import type { PutV1JobsJobIdRequestBody } from '@gusto/embedded-api/models/operations/putv1jobsjobid'
import type {
  DeleteV1JobsJobIdRequest,
  DeleteV1JobsJobIdResponse,
} from '@gusto/embedded-api/models/operations/deletev1jobsjobid'
import type { Employee$Outbound } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeOnboardingStatus$Outbound } from '@gusto/embedded-api/models/components/employeeonboardingstatus'
import type { Job$Outbound } from '@gusto/embedded-api/models/components/job'
import type { Compensation$Outbound } from '@gusto/embedded-api/models/components/compensation'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export function handleGetCompanyEmployees(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1CompaniesCompanyIdEmployeesRequest,
    Employee$Outbound[]
  >,
  companyId = 'some-company-uuid',
) {
  return http.get(`${API_BASE_URL}/v1/companies/${companyId}/employees`, resolver)
}

export const getCompanyEmployees = (companyId?: string) =>
  handleGetCompanyEmployees(
    () =>
      HttpResponse.json([
        {
          uuid: 'some-unique-id',
          first_name: 'Maximus',
          last_name: 'Steel',
          payment_method: 'Direct Deposit',
        },
      ]),
    companyId,
  )

export const getEmployee = http.get<PathParams, GetV1EmployeesRequest, Employee$Outbound>(
  `${API_BASE_URL}/v1/employees/:employee_id`,
  async () => {
    const responseFixture = await getFixture('get-v1-employees')
    return HttpResponse.json(responseFixture)
  },
)

export const createEmployee = http.post<PathParams, PostV1EmployeesRequestBody, Employee$Outbound>(
  `${API_BASE_URL}/v1/companies/:company_id/employees`,
  async () => {
    const responseFixture = await getFixture('get-v1-employees')
    return HttpResponse.json(responseFixture, { status: 201 })
  },
)

export const updateEmployee = http.put<PathParams, PutV1EmployeesRequestBody, Employee$Outbound>(
  `${API_BASE_URL}/v1/employees/:employee_id`,
  async () => {
    const responseFixture = await getFixture('get-v1-employees')
    return HttpResponse.json(responseFixture)
  },
)

export const deleteEmployee = http.delete<
  PathParams,
  DeleteV1EmployeeRequest,
  DeleteV1EmployeeResponse
>(`${API_BASE_URL}/v1/employees/:employee_id`, () => {
  return new HttpResponse(null, {
    status: 204,
    statusText: 'Delete an employee',
  })
})

export const getEmployeeOnboardingStatus = http.get<
  PathParams,
  GetV1EmployeesEmployeeIdOnboardingStatusRequest,
  EmployeeOnboardingStatus$Outbound
>(`${API_BASE_URL}/v1/employees/:employee_id/onboarding_status`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-onboarding_status')
  return HttpResponse.json(responseFixture)
})
export const updateEmployeeOnboardingStatus = http.put<
  PathParams,
  PutV1EmployeesEmployeeIdOnboardingStatusRequestBody,
  EmployeeOnboardingStatus$Outbound
>(`${API_BASE_URL}/v1/employees/:employee_id/onboarding_status`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-onboarding_status')
  return HttpResponse.json(responseFixture)
})

export function handleGetEmployeeJobs(
  resolver: HttpResponseResolver<PathParams, GetV1EmployeesEmployeeIdJobsRequest, Job$Outbound[]>,
) {
  return http.get(`${API_BASE_URL}/v1/employees/:employee_id/jobs`, resolver)
}
export const getEmployeeJobs = handleGetEmployeeJobs(async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-jobs')
  return HttpResponse.json(responseFixture)
})

export function handleCreateEmployeeJob(
  resolver: HttpResponseResolver<PathParams, PostV1JobsJobIdRequestBody, Job$Outbound>,
) {
  return http.post(`${API_BASE_URL}/v1/employees/:employee_id/jobs`, resolver)
}

export const createEmployeeJob = handleCreateEmployeeJob(async ({ request }) => {
  const requestBody = await request.json()
  const responseFixture = await getFixture('get-v1-employees-employee_id-jobs')

  return HttpResponse.json(
    {
      ...responseFixture[0],
      title: requestBody.title,
      hire_date: requestBody.hireDate,
      two_percent_shareholder: requestBody.twoPercentShareholder,
      state_wc_covered: requestBody.stateWcCovered,
      state_wc_class_code: requestBody.stateWcClassCode,
    },
    { status: 201 },
  )
})

export function handleUpdateEmployeeCompensation(
  resolver: HttpResponseResolver<
    PathParams,
    PutV1CompensationsCompensationIdRequestBody,
    Compensation$Outbound
  >,
) {
  return http.put(`${API_BASE_URL}/v1/compensations/:compensation_id`, resolver)
}

export const updateEmployeeCompensation = handleUpdateEmployeeCompensation(async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    ...requestBody,
    uuid: '1234',
    job_uuid: 'job-uuid',
  })
})

export function handleUpdateEmployeeJob(
  resolver: HttpResponseResolver<PathParams, PutV1JobsJobIdRequestBody, Job$Outbound>,
) {
  return http.put(`${API_BASE_URL}/v1/jobs/:job_id`, resolver)
}

export const updateEmployeeJob = handleUpdateEmployeeJob(async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    ...requestBody,
    uuid: 'job-uuid',
    title: requestBody.title || 'My Job',
  })
})

export function handleDeleteEmployeeJob(
  resolver: HttpResponseResolver<PathParams, DeleteV1JobsJobIdRequest, DeleteV1JobsJobIdResponse>,
) {
  return http.delete(`${API_BASE_URL}/v1/jobs/:job_id`, resolver)
}

export const deleteEmployeeJob = handleDeleteEmployeeJob(() => {
  return new HttpResponse(null, {
    status: 204,
  })
})

export const getEmployeeGarnishments = http.get(
  `${API_BASE_URL}/v1/employees/:employee_id/garnishments`,
  () => HttpResponse.json([]),
)

export default [
  getCompanyEmployees(),
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeJobs,
  createEmployeeJob,
  updateEmployeeCompensation,
  updateEmployeeJob,
  deleteEmployeeJob,
]
