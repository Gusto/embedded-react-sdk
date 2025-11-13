import type { HttpResponseResolver, PathParams } from 'msw'
import { http, HttpResponse } from 'msw'
import type { GetCompaniesCompanyUuidWireInRequestUuidRequest } from '@gusto/embedded-api/models/operations/getcompaniescompanyuuidwireinrequestuuid'
import { API_BASE_URL } from '@/test/constants'

export const createWireInRequest = (overrides: Record<string, unknown> = {}) => ({
  uuid: 'wire-in-1',
  status: 'awaiting_funds',
  origination_bank: 'Test Bank',
  origination_bank_address: '123 Bank St, San Francisco, CA 94111',
  recipient_name: 'Gusto, Inc.',
  recipient_address: '525 20th Street, San Francisco, CA 94107',
  recipient_account_number: '1234567890',
  recipient_routing_number: '121000248',
  unique_tracking_code: 'TRACK123',
  payment_type: 'payroll',
  payment_uuid: 'payroll-uuid-1',
  requested_amount: '5000.00',
  wire_in_deadline: '2024-12-15T15:00:00Z',
  ...overrides,
})

export function handleGetWireInRequests(
  resolver: HttpResponseResolver<PathParams, GetCompaniesCompanyUuidWireInRequestUuidRequest>,
) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_uuid/wire_in_requests`, resolver)
}

export const getWireInRequests = handleGetWireInRequests(() =>
  HttpResponse.json([createWireInRequest()]),
)

export const getEmptyWireInRequests = handleGetWireInRequests(() => HttpResponse.json([]))

export default [getWireInRequests]
