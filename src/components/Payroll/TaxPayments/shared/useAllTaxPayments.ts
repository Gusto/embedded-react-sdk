import { useMemo } from 'react'
import { useSuspenseQueries } from '@tanstack/react-query'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import {
  buildTaxPaymentsGetTaxPaymentsQuery,
  useTaxPaymentsGetTaxPaymentsSuspense,
} from '@gusto/embedded-api/react-query/taxPaymentsGetTaxPayments'
import type { TaxPayment } from '@gusto/embedded-api/models/components/taxpayment'

const SERVER_MAX_PER_PAGE = 100

/**
 * Fetches every page of a company's tax payments so filtering, search, and pagination can be
 * applied client-side.
 *
 * @remarks
 * Suspends until all pages resolve. Tax payment volume is low (a handful per jurisdiction per
 * quarter), so most companies need a single request.
 *
 * @param companyId - The company whose tax payments are fetched.
 * @returns Every tax payment for the company.
 * @internal
 */
export function useAllTaxPayments(companyId: string): TaxPayment[] {
  const gustoClient = useGustoEmbeddedContext()

  const { data: firstPage } = useTaxPaymentsGetTaxPaymentsSuspense({
    companyUuid: companyId,
    page: 1,
    per: SERVER_MAX_PER_PAGE,
  })

  const totalServerPages = Number(firstPage.httpMeta.response.headers.get('x-total-pages') ?? 1)

  const restPageResults = useSuspenseQueries({
    queries: Array.from({ length: Math.max(0, totalServerPages - 1) }, (_, i) =>
      buildTaxPaymentsGetTaxPaymentsQuery(gustoClient, {
        companyUuid: companyId,
        page: i + 2,
        per: SERVER_MAX_PER_PAGE,
      }),
    ),
  })

  return useMemo(
    () => [
      ...(firstPage.taxPaymentList ?? []),
      ...restPageResults.flatMap(result => result.data.taxPaymentList ?? []),
    ],
    [firstPage.taxPaymentList, restPageResults],
  )
}
