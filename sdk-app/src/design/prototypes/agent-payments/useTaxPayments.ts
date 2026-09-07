import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { TaxPayment } from './types'

/**
 * Hand-rolled data access for the `tax_payments` endpoint.
 *
 * PROTOTYPE ONLY. The `@gusto/embedded-api` package does not yet expose
 * `tax_payments` — the endpoint is in beta and its OpenAPI spec is still marked
 * `document: false`, so it is excluded from the generated SDK client (see
 * APL-249). Until that flips and a new dated package ships, this prototype talks
 * to the endpoint directly through sdk-app's `/api` → `/fe_sdk/<token>` proxy,
 * which supplies auth. Replace with the generated React Query hooks once the
 * SDK includes them.
 */
const TAX_PAYMENTS_PROTOTYPE_KEY = 'prototype:tax-payments'

async function fetchTaxPayments<T>(path: string): Promise<T> {
  const res = await fetch(`/api/v1/companies/${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(body.message ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export function useTaxPaymentsList(companyId: string): UseQueryResult<TaxPayment[]> {
  // Request the max page size so the list UI's client-side filtering/sorting sees
  // the full result set. `per` is capped at 100 server-side; a company with more
  // than 100 tax payments would need a page loop keyed off the total-count header.
  return useQuery({
    queryKey: [TAX_PAYMENTS_PROTOTYPE_KEY, 'list', companyId],
    queryFn: () => fetchTaxPayments<TaxPayment[]>(`${companyId}/tax_payments?per=100`),
  })
}

export function useTaxPayment(companyId: string, uuid: string): UseQueryResult<TaxPayment> {
  return useQuery({
    queryKey: [TAX_PAYMENTS_PROTOTYPE_KEY, 'detail', companyId, uuid],
    queryFn: () => fetchTaxPayments<TaxPayment>(`${companyId}/tax_payments/${uuid}`),
  })
}
