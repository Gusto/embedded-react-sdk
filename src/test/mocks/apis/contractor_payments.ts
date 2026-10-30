import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

export function handleGetContractorPayments(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/contractors/:contractor_uuid/payments`, resolver)
}

const mockContractorPayments = [
  {
    uuid: 'contractor-payment-1',
    check_date: '2025-12-15',
    bonus: '0.00',
    hours: '10.0',
    hourly_rate: '75.00',
    payment_method: 'Direct Deposit',
    reimbursement: '0.33',
    status: 'Funded',
    wage: '0.00',
    wage_type: 'Hourly',
    wage_total: '750.00',
  },
  {
    uuid: 'contractor-payment-2',
    check_date: '2025-12-01',
    bonus: '20.11',
    hours: '0.0',
    hourly_rate: '0.00',
    payment_method: 'Check',
    reimbursement: '0.00',
    status: 'Unfunded',
    wage: '1500.00',
    wage_type: 'Fixed',
    wage_total: '1520.11',
  },
]

export const getContractorPayments = handleGetContractorPayments(() =>
  HttpResponse.json(mockContractorPayments, {
    headers: {
      'x-total-pages': '1',
      'x-total-count': String(mockContractorPayments.length),
    },
  }),
)

export const getEmptyContractorPayments = handleGetContractorPayments(() =>
  HttpResponse.json([], {
    headers: {
      'x-total-pages': '1',
      'x-total-count': '0',
    },
  }),
)

export default [getContractorPayments]
