import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

export const mockRecoveryCases = [
  {
    uuid: 'rc-1',
    company_uuid: 'company-123',
    status: 'open',
    latest_error_code: 'R01',
    original_debit_date: '2024-01-05',
    check_date: '2024-01-09',
    payroll_uuid: 'payroll-1',
    contractor_payment_uuids: null,
    amount_outstanding: '1000.00',
    event_total_amount: '1000.00',
  },
  {
    uuid: 'rc-2',
    company_uuid: 'company-123',
    status: 'open',
    latest_error_code: 'R16',
    original_debit_date: '2024-01-10',
    check_date: '2024-01-15',
    payroll_uuid: 'payroll-2',
    contractor_payment_uuids: null,
    amount_outstanding: '2500.00',
    event_total_amount: '2500.00',
  },
  {
    uuid: 'rc-3',
    company_uuid: 'company-123',
    status: 'open',
    latest_error_code: 'UNKNOWN_CODE',
    original_debit_date: null,
    check_date: '2024-01-20',
    payroll_uuid: 'payroll-3',
    contractor_payment_uuids: null,
    amount_outstanding: '500.00',
    event_total_amount: '500.00',
  },
]

export function handleGetRecoveryCases(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_uuid/recovery_cases`, resolver)
}

export function handleRedebitRecoveryCase(resolver: HttpResponseResolver) {
  return http.put(`${API_BASE_URL}/v1/recovery_cases/:recovery_case_uuid/redebit`, resolver)
}

const getRecoveryCases = handleGetRecoveryCases(() => {
  return HttpResponse.json(mockRecoveryCases)
})

const redebitRecoveryCase = handleRedebitRecoveryCase(() => {
  return new HttpResponse(null, { status: 202 })
})

export default [getRecoveryCases, redebitRecoveryCase]
