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
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export function handleGetCompanyEmployees(
  resolver: HttpResponseResolver<PathParams, GetV1CompaniesCompanyIdEmployeesRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_id/employees`, resolver)
}

const employeesListResponse = () =>
  HttpResponse.json(
    [
      {
        uuid: 'some-unique-id',
        first_name: 'Maximus',
        last_name: 'Steel',
        payment_method: 'Direct Deposit',
      },
    ],
    {
      headers: {
        'x-total-pages': '1',
        'x-total-count': '1',
      },
    },
  )

export const getCompanyEmployees = (companyId?: string) =>
  companyId
    ? http.get(`${API_BASE_URL}/v1/companies/${companyId}/employees`, employeesListResponse)
    : handleGetCompanyEmployees(employeesListResponse)

export const getEmployee = http.get<PathParams, GetV1EmployeesRequest>(
  `${API_BASE_URL}/v1/employees/:employee_id`,
  async () => {
    const responseFixture = await getFixture('get-v1-employees')
    return HttpResponse.json(responseFixture)
  },
)

export const createEmployee = http.post<PathParams, PostV1EmployeesRequestBody>(
  `${API_BASE_URL}/v1/companies/:company_id/employees`,
  async () => {
    const responseFixture = await getFixture('get-v1-employees')
    return HttpResponse.json(responseFixture, { status: 201 })
  },
)

export const updateEmployee = http.put<PathParams, PutV1EmployeesRequestBody>(
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
  GetV1EmployeesEmployeeIdOnboardingStatusRequest
>(`${API_BASE_URL}/v1/employees/:employee_id/onboarding_status`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-onboarding_status')
  return HttpResponse.json(responseFixture)
})
export const updateEmployeeOnboardingStatus = http.put<
  PathParams,
  PutV1EmployeesEmployeeIdOnboardingStatusRequestBody
>(`${API_BASE_URL}/v1/employees/:employee_id/onboarding_status`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-onboarding_status')
  return HttpResponse.json(responseFixture)
})

export function handleGetEmployeeJobs(
  resolver: HttpResponseResolver<PathParams, GetV1EmployeesEmployeeIdJobsRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/employees/:employee_id/jobs`, resolver)
}
export const getEmployeeJobs = handleGetEmployeeJobs(async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-jobs')
  return HttpResponse.json(responseFixture)
})

export function handleCreateEmployeeJob(
  resolver: HttpResponseResolver<PathParams, PostV1JobsJobIdRequestBody>,
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
  resolver: HttpResponseResolver<PathParams, PutV1CompensationsCompensationIdRequestBody>,
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
  resolver: HttpResponseResolver<PathParams, PutV1JobsJobIdRequestBody>,
) {
  return http.put(`${API_BASE_URL}/v1/jobs/:job_id`, resolver)
}

export const updateEmployeeJob = handleUpdateEmployeeJob(async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    ...requestBody,
    uuid: 'job-uuid',
    version: 'updated-job-version',
    employee_uuid: 'employee-uuid',
    current_compensation_uuid: 'compensation-uuid',
    payment_unit: 'Hour',
    primary: true,
    title: requestBody.title || 'My Job',
    compensations: [
      {
        uuid: 'compensation-uuid',
        version: 'compensation-version-123',
        payment_unit: 'Hour',
        flsa_status: 'Nonexempt',
        adjust_for_minimum_wage: false,
        job_uuid: 'job-uuid',
        effective_date: '2024-12-24',
        rate: '100.00',
      },
    ],
    rate: '100.00',
    hire_date: '2024-12-24',
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
