import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

const mockTimeOffPolicies = [
  {
    uuid: 'policy-1',
    company_uuid: '123',
    name: 'Vacation',
    policy_type: 'vacation',
    accrual_method: 'unlimited',
    is_active: true,
    employees: [],
  },
  {
    uuid: 'policy-2',
    company_uuid: '123',
    name: 'Sick Leave',
    policy_type: 'sick',
    accrual_method: 'per_pay_period',
    is_active: true,
    employees: [],
  },
]

const TimeOffPoliciesHandlers = [
  http.get(`${API_BASE_URL}/v1/companies/:company_uuid/time_off_policies`, () => {
    return HttpResponse.json(mockTimeOffPolicies)
  }),
  // PolicyList fetches this alongside time-off policies; 404 is handled gracefully
  http.get(`${API_BASE_URL}/v1/companies/:company_uuid/holiday_pay_policy`, () => {
    return HttpResponse.json({ message: 'Not found' }, { status: 404 })
  }),
  http.put(`${API_BASE_URL}/v1/time_off_policies/:timeOffPolicyUuid/add_employees`, () => {
    return HttpResponse.json({ ...mockTimeOffPolicies[0], employees: [] })
  }),
  http.put(`${API_BASE_URL}/v1/companies/:company_uuid/holiday_pay_policy/add`, () => {
    return HttpResponse.json({
      uuid: 'holiday-pay-policy-1',
      company_uuid: '123',
      version: 1,
      is_active: true,
    })
  }),
]

export default TimeOffPoliciesHandlers
