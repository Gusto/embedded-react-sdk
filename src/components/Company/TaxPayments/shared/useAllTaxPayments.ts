import { useSuspenseQueries } from '@tanstack/react-query'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import {
  buildTaxPaymentsGetTaxPaymentsQuery,
  useTaxPaymentsGetTaxPaymentsSuspense,
} from '@gusto/embedded-api/react-query/taxPaymentsGetTaxPayments'
import type { TaxPayment } from '@gusto/embedded-api/models/components/taxpayment'

const SERVER_MAX_PER_PAGE = 100

/**
 * Hard ceiling on the number of pages fetched, so a company with an unexpectedly long history
 * degrades to a truncated list rather than an unbounded request fan-out.
 *
 * @internal
 */
const MAX_PAGES = 5

/**
 * Sort sent to the server. Matches the endpoint's own default, so page boundaries stay stable
 * across the requests that make up one list.
 *
 * @remarks
 * A single field only: the endpoint's OpenAPI schema advertises comma-separated multi-field sort,
 * but its validator splits on the first `:` and rejects anything else with a 422.
 *
 * @internal
 */
const SORT_BY = 'due_date:desc'

/**
 * Result of {@link useAllTaxPayments}.
 *
 * @internal
 */
export interface AllTaxPaymentsResult {
  /** Every tax payment fetched, newest due date first. */
  taxPayments: TaxPayment[]
  /** Whether the server reported more pages than {@link MAX_PAGES} and the list was truncated. */
  isTruncated: boolean
}

/**
 * Fetches a company's tax payments so filtering, search, and pagination can be applied client-side.
 *
 * @remarks
 * Suspends until every fetched page resolves. Filtering and search stay client-side deliberately:
 * the derived `Overdue` and `Scheduled` statuses depend on "not yet sent", which the API exposes no
 * filter for, the `jurisdiction` filter would silently drop local/city agencies that still report a
 * state code, and there is no text-search parameter at all.
 *
 * Fetching is capped at {@link MAX_PAGES} pages because the endpoint paginates an in-memory array —
 * each page request reloads the company's full payment history server-side, so an uncapped fan-out
 * multiplies that cost rather than amortizing it.
 *
 * @param companyId - The company whose tax payments are fetched.
 * @returns The fetched tax payments and whether the list was truncated.
 * @internal
 */
export function useAllTaxPayments(companyId: string): AllTaxPaymentsResult {
  const gustoClient = useGustoEmbeddedContext()

  const { data: firstPage } = useTaxPaymentsGetTaxPaymentsSuspense({
    companyUuid: companyId,
    page: 1,
    per: SERVER_MAX_PER_PAGE,
    sortBy: SORT_BY,
  })

  const totalServerPages = Number(firstPage.httpMeta.response.headers.get('x-total-pages') ?? 1)
  const pagesToFetch = Math.min(totalServerPages, MAX_PAGES)

  const restPageResults = useSuspenseQueries({
    queries: Array.from({ length: Math.max(0, pagesToFetch - 1) }, (_, index) =>
      buildTaxPaymentsGetTaxPaymentsQuery(gustoClient, {
        companyUuid: companyId,
        page: index + 2,
        per: SERVER_MAX_PER_PAGE,
        sortBy: SORT_BY,
      }),
    ),
  })

  // Not memoized: `useSuspenseQueries` hands back a fresh array every render, so a memo keyed on it
  // could never hit -- it would just add a dependency list that lies about caching anything.
  const taxPayments = [
    ...(firstPage.taxPaymentList ?? []),
    ...restPageResults.flatMap(result => result.data.taxPaymentList ?? []),
  ]

  return { taxPayments, isTruncated: totalServerPages > MAX_PAGES }
}
