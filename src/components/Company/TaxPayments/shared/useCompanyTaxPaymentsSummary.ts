import { useTaxPaymentsGetTaxPayments } from '@gusto/embedded-api/react-query/taxPaymentsGetTaxPayments'
import type { TaxPayment } from '@gusto/embedded-api/models/components/taxpayment'
import { deriveTaxPaymentStatus } from './taxPaymentStatus'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { formatDateToStringDate, toRFCDate } from '@/helpers/dateFormatting'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * How many past-due payments are examined when counting what is still unpaid.
 *
 * @remarks
 * The API has no "not yet sent" filter, so overdue has to be derived client-side
 * from a window of payments whose due date has passed. One page of the server's
 * maximum size covers that window without the multi-page fan-out
 * `useAllTaxPayments` needs: a company with more unpaid history than this reads
 * as having at least this many overdue payments, and the full ledger is one
 * click away in `TaxPaymentsFlow`.
 *
 * @internal
 */
const OVERDUE_WINDOW_SIZE = 100

/**
 * How many upcoming payments are examined when picking the next one due.
 *
 * @remarks
 * More than one because the nearest due date may already be settled — a
 * zero-amount payment reads as paid the moment it is created — and the card
 * reports the next payment that still owes something.
 *
 * @internal
 */
const UPCOMING_WINDOW_SIZE = 25

/**
 * Single-field sort, ordered so the first entry of each window is the one
 * closest to today. Multi-field sort is advertised by the endpoint's schema but
 * rejected by its validator with a 422.
 *
 * @internal
 */
const SORT_MOST_RECENTLY_DUE = 'due_date:desc'
const SORT_SOONEST_DUE = 'due_date:asc'

/**
 * Parameters accepted by {@link useCompanyTaxPaymentsSummary}.
 *
 * @internal
 */
export interface UseCompanyTaxPaymentsSummaryParams {
  /** UUID of the company whose tax payments are being read. */
  companyId: string
}

type UseCompanyTaxPaymentsSummaryReady = BaseHookReady<
  {
    /** Payments whose due date has passed and which have not been settled, most recently due first. */
    overduePayments: TaxPayment[]
    /** The soonest payment that still owes something, or `undefined` when nothing is outstanding. */
    nextPayment?: TaxPayment
  },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Discriminated union returned by {@link useCompanyTaxPaymentsSummary} — either the loading state or the ready state carrying the company's outstanding tax payments.
 *
 * @internal
 */
export type UseCompanyTaxPaymentsSummaryResult =
  HookLoadingResult | UseCompanyTaxPaymentsSummaryReady

/**
 * Read-only data hook for the company Tax payments management card. Reports what
 * a company still owes: the payments past their due date and the next one coming
 * due.
 *
 * @remarks
 * Reads two bounded, single-page windows around today rather than the company's
 * whole ledger. A payment's status is not a field the API returns — it is
 * derived from the amounts and dates by {@link deriveTaxPaymentStatus} — so
 * "overdue" cannot be asked for directly and a date-bounded window has to be
 * filtered client-side. Deliberately not built on `useAllTaxPayments`: that hook
 * suspends across up to five sequential pages, which is the right trade for the
 * full searchable list and the wrong one for a dashboard card.
 *
 * Payments with no recorded due date — legacy records the API returns
 * `due_date: null` for — fall outside both windows and are not reported here.
 *
 * @param params - See {@link UseCompanyTaxPaymentsSummaryParams}.
 * @returns See {@link UseCompanyTaxPaymentsSummaryResult}.
 * @internal
 */
export function useCompanyTaxPaymentsSummary({
  companyId,
}: UseCompanyTaxPaymentsSummaryParams): UseCompanyTaxPaymentsSummaryResult {
  // Read once so both windows and every derived status agree on which day
  // "today" is, even across a midnight boundary.
  const now = new Date()
  const today = formatDateToStringDate(now) ?? ''
  const todayOnTheWire = toRFCDate(now)

  const overdueQuery = useTaxPaymentsGetTaxPayments(
    {
      companyUuid: companyId,
      dueDateTo: todayOnTheWire,
      sortBy: SORT_MOST_RECENTLY_DUE,
      page: 1,
      per: OVERDUE_WINDOW_SIZE,
    },
    { staleTime: Infinity },
  )

  const upcomingQuery = useTaxPaymentsGetTaxPayments(
    {
      companyUuid: companyId,
      dueDateFrom: todayOnTheWire,
      sortBy: SORT_SOONEST_DUE,
      page: 1,
      per: UPCOMING_WINDOW_SIZE,
    },
    { staleTime: Infinity },
  )

  const errorHandling = composeErrorHandler([overdueQuery, upcomingQuery])

  if (overdueQuery.isLoading || upcomingQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  // Both windows are bounded inclusively at today, so a payment due today
  // appears in each. The status filters keep it in one: it is never `overdue`,
  // and it is the next payment due only while it remains unsettled.
  const overduePayments = (overdueQuery.data?.taxPaymentList ?? []).filter(
    payment => deriveTaxPaymentStatus(payment, today) === 'overdue',
  )

  const nextPayment = (upcomingQuery.data?.taxPaymentList ?? []).find(
    payment => deriveTaxPaymentStatus(payment, today) !== 'paid',
  )

  return {
    isLoading: false,
    data: { overduePayments, nextPayment },
    status: {
      isFetching: overdueQuery.isFetching || upcomingQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
