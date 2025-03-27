import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type {
  GetV1CompaniesCompanyIdEmployeesRequest,
  GetV1CompaniesCompanyIdEmployeesResponse,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidemployees'
import type {
  GetV1EmployeesRequest,
  GetV1EmployeesResponse,
} from '@gusto/embedded-api/models/operations/getv1employees'
import type {
  PostV1EmployeesRequestBody,
  PostV1EmployeesResponse,
} from '@gusto/embedded-api/models/operations/postv1employees'
import type {
  PutV1EmployeesRequestBody,
  PutV1EmployeesResponse,
} from '@gusto/embedded-api/models/operations/putv1employees'
import type {
  DeleteV1EmployeeRequest,
  DeleteV1EmployeeResponse,
} from '@gusto/embedded-api/models/operations/deletev1employee'
import type {
  GetV1EmployeesEmployeeIdOnboardingStatusRequest,
  GetV1EmployeesEmployeeIdOnboardingStatusResponse,
} from '@gusto/embedded-api/models/operations/getv1employeesemployeeidonboardingstatus'
import type {
  PutV1EmployeesEmployeeIdOnboardingStatusRequestBody,
  PutV1EmployeesEmployeeIdOnboardingStatusResponse,
} from '@gusto/embedded-api/models/operations/putv1employeesemployeeidonboardingstatus'
import type {
  GetV1EmployeesEmployeeIdJobsRequest,
  GetV1EmployeesEmployeeIdJobsResponse,
} from '@gusto/embedded-api/models/operations/getv1employeesemployeeidjobs'
import type {
  PostV1JobsJobIdRequestBody,
  PostV1JobsJobIdResponse,
} from '@gusto/embedded-api/models/operations/postv1jobsjobid'
import type {
  PutV1CompensationsCompensationIdRequestBody,
  PutV1CompensationsCompensationIdResponse,
} from '@gusto/embedded-api/models/operations/putv1compensationscompensationid'
import type {
  PutV1JobsJobIdRequestBody,
  PutV1JobsJobIdResponse,
} from '@gusto/embedded-api/models/operations/putv1jobsjobid'
import type {
  DeleteV1JobsJobIdRequest,
  DeleteV1JobsJobIdResponse,
} from '@gusto/embedded-api/models/operations/deletev1jobsjobid'
import { getFixture } from '../fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

export function handleGetCompanyEmployees(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1CompaniesCompanyIdEmployeesRequest,
    Partial<GetV1CompaniesCompanyIdEmployeesResponse>
  >,
) {
  return http.get(`${API_BASE_URL}/v1/companies/some-company-uuid/employees`, resolver)
}

export const getCompanyEmployees = handleGetCompanyEmployees(() =>
  HttpResponse.json({
    employeeList: [
      {
        uuid: 'some-unique-id',
        firstName: 'Maximus',
        lastName: 'Steel',
        paymentMethod: 'Direct Deposit',
      },
    ],
  }),
)

export const getEmployee = http.get<
  PathParams,
  GetV1EmployeesRequest,
  Partial<GetV1EmployeesResponse>
>(`${API_BASE_URL}/v1/employees/:employee_id`, async () => {
  const responseFixture = await getFixture('get-v1-employees')
  return HttpResponse.json(responseFixture)
})

export const createEmployee = http.post<
  PathParams,
  PostV1EmployeesRequestBody,
  Partial<PostV1EmployeesResponse>
>(`${API_BASE_URL}/v1/companies/:company_id/employees`, async () => {
  const responseFixture = await getFixture('get-v1-employees')
  return HttpResponse.json(responseFixture)
})

export const updateEmployee = http.put<
  PathParams,
  PutV1EmployeesRequestBody,
  Partial<PutV1EmployeesResponse>
>(`${API_BASE_URL}/v1/employees/:employee_id`, async () => {
  const responseFixture = await getFixture('get-v1-employees')
  return HttpResponse.json(responseFixture)
})

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
  Partial<GetV1EmployeesEmployeeIdOnboardingStatusResponse>
>(`${API_BASE_URL}/v1/employees/:employee_id/onboarding_status`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-onboarding_status')
  return HttpResponse.json(responseFixture)
})
export const updateEmployeeOnboardingStatus = http.put<
  PathParams,
  PutV1EmployeesEmployeeIdOnboardingStatusRequestBody,
  Partial<PutV1EmployeesEmployeeIdOnboardingStatusResponse>
>(`${API_BASE_URL}/v1/employees/:employee_id/onboarding_status`, async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-onboarding_status')
  return HttpResponse.json(responseFixture)
})

export function handleGetEmployeeJobs(
  resolver: HttpResponseResolver<
    PathParams,
    GetV1EmployeesEmployeeIdJobsRequest,
    Partial<GetV1EmployeesEmployeeIdJobsResponse>
  >,
) {
  return http.get(`${API_BASE_URL}/v1/employees/:employee_id/jobs`, resolver)
}
export const getEmployeeJobs = handleGetEmployeeJobs(async () => {
  const responseFixture = await getFixture('get-v1-employees-employee_id-jobs')
  return HttpResponse.json(responseFixture)
})

export function handleCreateEmployeeJob(
  resolver: HttpResponseResolver<
    PathParams,
    PostV1JobsJobIdRequestBody,
    Partial<PostV1JobsJobIdResponse>
  >,
) {
  return http.post(`${API_BASE_URL}/v1/employees/:employee_id/jobs`, resolver)
}

const createEmployeeJob = handleCreateEmployeeJob(async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    job: {
      uuid: 'job-uuid',
      title: requestBody.title,
      hireDate: requestBody.hireDate,
      twoPercentShareholder: requestBody.twoPercentShareholder,
      stateWcCovered: requestBody.stateWcCovered,
      stateWcClassCode: requestBody.stateWcClassCode,
    },
  })
})

export function handleUpdateEmployeeCompensation(
  resolver: HttpResponseResolver<
    PathParams,
    PutV1CompensationsCompensationIdRequestBody,
    Partial<PutV1CompensationsCompensationIdResponse>
  >,
) {
  return http.put(`${API_BASE_URL}/v1/compensations/:compensation_id`, resolver)
}

const updateEmployeeCompensation = handleUpdateEmployeeCompensation(async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    compensation: {
      ...requestBody,
      uuid: '1234',
      jobUuid: 'job-uuid',
    },
  })
})

export function handleUpdateEmployeeJob(
  resolver: HttpResponseResolver<
    PathParams,
    PutV1JobsJobIdRequestBody,
    Partial<PutV1JobsJobIdResponse>
  >,
) {
  return http.put(`${API_BASE_URL}/v1/jobs/:job_id`, resolver)
}

const updateEmployeeJob = handleUpdateEmployeeJob(async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    job: {
      ...requestBody,
      uuid: 'job-uuid',
      title: requestBody.title || 'My Job',
    },
  })
})

export function handleDeleteEmployeeJob(
  resolver: HttpResponseResolver<PathParams, DeleteV1JobsJobIdRequest, DeleteV1JobsJobIdResponse>,
) {
  return http.delete(`${API_BASE_URL}/v1/jobs/:job_id`, resolver)
}

const deleteEmployeeJob = handleDeleteEmployeeJob(() => {
  return new HttpResponse(null, {
    status: 204,
  })
})

export default [
  getCompanyEmployees,
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
