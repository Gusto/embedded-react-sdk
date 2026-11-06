import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

export function handleGetTaxPayments(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_uuid/tax_payments`, resolver)
}

export function handleGetTaxPayment(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_uuid/tax_payments/:uuid`, resolver)
}

export const mockFederalTaxPayment = {
  uuid: 'tax-payment-federal',
  company_uuid: 'company-123',
  agency_name: 'Internal Revenue Service',
  jurisdiction: 'US',
  period_start: '2026-09-01',
  period_end: '2026-09-30',
  due_date: '2026-10-15',
  payment_sent_on: null,
  amount: '14661.36',
  amount_paid: '0.00',
}

export const mockStateTaxPayment = {
  uuid: 'tax-payment-state',
  company_uuid: 'company-123',
  agency_name: 'Employment Development Department',
  jurisdiction: 'CA',
  period_start: '2026-07-01',
  period_end: '2026-09-30',
  due_date: '2026-07-15',
  payment_sent_on: null,
  amount: '1536.67',
  amount_paid: '0.00',
}

export const mockTaxPaymentWithLineItems = {
  ...mockFederalTaxPayment,
  line_items: [
    { payroll_uuid: 'payroll-1', unique_tax_id: '00-000-0000-FIT-000', amount: '2980.27' },
    { payroll_uuid: 'payroll-1', unique_tax_id: '00-000-0000-FICA-000', amount: '1762.91' },
  ],
}

export const getTaxPayments = handleGetTaxPayments(() =>
  HttpResponse.json([mockFederalTaxPayment, mockStateTaxPayment], {
    headers: { 'x-total-count': '2', 'x-total-pages': '1' },
  }),
)

export const getTaxPayment = handleGetTaxPayment(() =>
  HttpResponse.json(mockTaxPaymentWithLineItems),
)

export default [getTaxPayments, getTaxPayment]
