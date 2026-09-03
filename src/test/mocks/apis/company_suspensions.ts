import type { HttpResponseResolver } from 'msw'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

/**
 * A suspension record as it appears on the wire (snake_case). Used to seed the default
 * handlers and as a starting point for per-test overrides.
 */
export const defaultSuspension = {
  uuid: 'suspension-uuid-1',
  company_uuid: 'company_id',
  effective_date: '2026-05-15',
  reason: 'switching_provider',
  leaving_for: 'rippling',
  reconcile_tax_method: 'pay_taxes',
  file_quarterly_forms: true,
  file_yearly_forms: true,
  comments: null,
  tax_refunds: [] as Array<{ description?: string; amount?: string }>,
}

export function handleGetCompanySuspensions(resolver: HttpResponseResolver) {
  return http.get(`${API_BASE_URL}/v1/companies/:company_uuid/suspensions`, resolver)
}

export const getCompanySuspensions = handleGetCompanySuspensions(() =>
  HttpResponse.json([defaultSuspension]),
)

export function handleSuspendCompany(resolver: HttpResponseResolver) {
  return http.post(`${API_BASE_URL}/v1/companies/:company_uuid/suspensions`, resolver)
}

export const suspendCompany = handleSuspendCompany(async ({ request, params }) => {
  const body = (await request.json()) as Record<string, unknown>
  return HttpResponse.json({
    ...defaultSuspension,
    ...body,
    company_uuid: params.company_uuid,
  })
})

export default [getCompanySuspensions, suspendCompany]
