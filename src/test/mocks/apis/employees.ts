import { http, HttpResponse, HttpResponseResolver } from 'msw'
import { PathParams, RequestBodyParams, ResponseType } from './typeHelpers'
import { API_BASE_URL } from '@/api/constants'

export function handleGetCompanyEmployees(
  resolver: HttpResponseResolver<
    PathParams<'get-v1-companies-company_id-employees'>,
    RequestBodyParams<'get-v1-companies-company_id-employees'>,
    ResponseType<'get-v1-companies-company_id-employees', 200>
  >,
) {
  return http.get(`${API_BASE_URL}/v1/companies/some-company-uuid/employees`, resolver)
}

const getCompanyEmployees = handleGetCompanyEmployees(() =>
  HttpResponse.json([
    {
      uuid: 'some-unique-id',
      first_name: 'Maximus',
      last_name: 'Steel',
      payment_method: 'Direct Deposit',
    },
  ]),
)

export const getEmployee = http.get<
  PathParams<'get-v1-employees'>,
  RequestBodyParams<'get-v1-employees'>,
  ResponseType<'get-v1-employees', 200>
>(`${API_BASE_URL}/v1/employees/:employee_id`, ({ params }) => {
  return HttpResponse.json({
    uuid: params.employee_id,
    first_name: 'Lucy',
    last_name: 'MacLean',
    payment_method: 'Direct Deposit',
  })
})

const createEmployee = http.post<
  PathParams<'post-v1-employees'>,
  RequestBodyParams<'post-v1-employees'>,
  ResponseType<'post-v1-employees', 201>
>(`${API_BASE_URL}/v1/companies/:company_id/employees`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    first_name: requestBody.first_name,
    last_name: requestBody.last_name,
    payment_method: 'Direct Deposit',
    uuid: 'employee-uuid',
  })
})

export const updateEmployee = http.put<
  PathParams<'put-v1-employees'>,
  RequestBodyParams<'put-v1-employees'>,
  ResponseType<'put-v1-employees', 200>
>(`${API_BASE_URL}/v1/employees/:employee_id`, async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: '1234',
    first_name: requestBody.first_name || 'first_name',
    last_name: requestBody.last_name || 'last_name',
    payment_method: 'Direct Deposit',
  })
})

const deleteEmployee = http.delete<
  PathParams<'delete-v1-employee'>,
  RequestBodyParams<'delete-v1-employee'>,
  ResponseType<'delete-v1-employee', 204>
>(`${API_BASE_URL}/v1/employees/:employee_id`, () => {
  return new HttpResponse(null, {
    status: 204,
    statusText: 'Delete an employee',
  })
})

export function handleGetEmployeeJobs(
  resolver: HttpResponseResolver<
    PathParams<'get-v1-employees-employee_id-jobs'>,
    RequestBodyParams<'get-v1-employees-employee_id-jobs'>,
    ResponseType<'get-v1-employees-employee_id-jobs', 200>
  >,
) {
  return http.get(`${API_BASE_URL}/v1/employees/:employee_id/jobs`, resolver)
}

const getEmployeeJobs = handleGetEmployeeJobs(() => {
  return HttpResponse.json([
    {
      uuid: 'job-uuid',
      employee_uuid: 'employee-uuid',
      current_compensation_uuid: 'compensation-uuid',
      payment_unit: 'Hour',
      primary: true,
      two_percent_shareholder: false,
      title: 'My Job',
      compensations: [
        {
          uuid: 'compensation-uuid',
          payment_unit: 'Year',
          flsa_status: 'Exempt',
          adjust_for_minimum_wage: false,
          job_uuid: 'job-uuid',
          effective_date: '2024-12-24',
          rate: '100000.00',
        },
      ],
      rate: '100000.00',
      hire_date: '2024-12-24',
    },
  ])
})

export function handleCreateEmployeeJob(
  resolver: HttpResponseResolver<
    PathParams<'post-v1-jobs-job_id'>,
    RequestBodyParams<'post-v1-jobs-job_id'>,
    ResponseType<'post-v1-jobs-job_id', 201>
  >,
) {
  return http.post(`${API_BASE_URL}/v1/employees/:employee_id/jobs`, resolver)
}

const createEmployeeJob = handleCreateEmployeeJob(async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: 'job-uuid',
    title: requestBody.title,
    hire_date: requestBody.hire_date,
    two_percent_shareholder: requestBody.two_percent_shareholder,
    state_wc_covered: requestBody.state_wc_covered,
    state_wc_class_code: requestBody.state_wc_class_code,
  })
})

export function handleUpdateEmployeeCompensation(
  resolver: HttpResponseResolver<
    PathParams<'put-v1-compensations-compensation_id'>,
    RequestBodyParams<'put-v1-compensations-compensation_id'>,
    ResponseType<'put-v1-compensations-compensation_id', 200>
  >,
) {
  return http.put(`${API_BASE_URL}/v1/compensations/:compensation_id`, resolver)
}

const updateEmployeeCompensation = handleUpdateEmployeeCompensation(async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: '1234',
    job_uuid: 'job-uuid',
    rate: requestBody.rate,
    payment_unit: requestBody.payment_unit,
    flsa_status: requestBody.flsa_status,
    adjust_for_minimum_wage: requestBody.adjust_for_minimum_wage,
  })
})

export function handleUpdateEmployeeJob(
  resolver: HttpResponseResolver<
    PathParams<'put-v1-jobs-job_id'>,
    RequestBodyParams<'put-v1-jobs-job_id'>,
    ResponseType<'put-v1-jobs-job_id', 200>
  >,
) {
  return http.put(`${API_BASE_URL}/v1/jobs/:job_id`, resolver)
}

const updateEmployeeJob = handleUpdateEmployeeJob(async ({ request }) => {
  const requestBody = await request.json()
  return HttpResponse.json({
    uuid: 'job-uuid',
    title: requestBody.title || 'My Job',
    hire_date: requestBody.hire_date || '2024-12-24',
    two_percent_shareholder: requestBody.two_percent_shareholder || false,
    state_wc_covered: requestBody.state_wc_covered || false,
    state_wc_class_code: requestBody.state_wc_class_code || '1234',
  })
})

export function handleDeleteEmployeeJob(
  resolver: HttpResponseResolver<
    PathParams<'delete-v1-jobs-job_id'>,
    RequestBodyParams<'delete-v1-jobs-job_id'>,
    ResponseType<'delete-v1-jobs-job_id', 204>
  >,
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
