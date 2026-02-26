import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

export const mockEmployee = {
  uuid: 'employee-123',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  company_uuid: 'company-123',
  terminated: false,
  onboarded: true,
}

export const mockTerminatedEmployee = {
  ...mockEmployee,
  terminated: true,
}

const getFutureDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().split('T')[0]!
}

const getPastDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return date.toISOString().split('T')[0]!
}

export const mockTerminationCancelable = {
  uuid: 'termination-123',
  employee_uuid: 'employee-123',
  effective_date: getFutureDate(),
  run_termination_payroll: false,
  active: true,
  cancelable: true,
}

export const mockTerminationWithPayroll = {
  uuid: 'termination-456',
  employee_uuid: 'employee-123',
  effective_date: getFutureDate(),
  run_termination_payroll: true,
  active: true,
  cancelable: false,
}

export const mockTerminationPast = {
  uuid: 'termination-789',
  employee_uuid: 'employee-123',
  effective_date: getPastDate(),
  run_termination_payroll: false,
  active: true,
  cancelable: false,
}

export const mockTerminationPayPeriods = [
  {
    employee_uuid: 'employee-123',
    employee_name: 'John Doe',
    start_date: '2025-01-01',
    end_date: '2025-01-15',
    check_date: '2025-01-20',
    pay_schedule_uuid: 'pay-schedule-123',
  },
]

export const mockPayrollPrepared = {
  payroll_uuid: 'payroll-123',
  company_uuid: 'company-123',
  off_cycle: true,
  off_cycle_reason: 'Dismissed employee',
}

export function handleGetEmployee(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/employees/:employee_id`, resolver)
}

export function handleCreateTermination(resolver: HttpResponseResolver) {
  return http.post(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, resolver)
}

export function handleGetTerminations(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, resolver)
}

export function handleDeleteTermination(resolver: HttpResponseResolver) {
  return http.delete(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, resolver)
}

export function handleGetUnprocessedTerminationPeriods(resolver: HttpResponseResolver) {
  return http.get(
    `${API_BASE_URL}/v1/companies/:company_id/pay_periods/unprocessed_termination_pay_periods`,
    resolver,
  )
}

export function handleCreateOffCyclePayroll(resolver: HttpResponseResolver) {
  return http.post(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, resolver)
}

const getEmployee = handleGetEmployee(() => HttpResponse.json(mockEmployee))

const createTermination = handleCreateTermination(() =>
  HttpResponse.json(mockTerminationCancelable),
)

const getTerminations = handleGetTerminations(() => HttpResponse.json([mockTerminationCancelable]))

const deleteTermination = handleDeleteTermination(() => new HttpResponse(null, { status: 204 }))

const getUnprocessedTerminationPeriods = handleGetUnprocessedTerminationPeriods(() =>
  HttpResponse.json(mockTerminationPayPeriods),
)

const createOffCyclePayroll = handleCreateOffCyclePayroll(() =>
  HttpResponse.json(mockPayrollPrepared),
)

export default [
  getEmployee,
  createTermination,
  getTerminations,
  deleteTermination,
  getUnprocessedTerminationPeriods,
  createOffCyclePayroll,
]
