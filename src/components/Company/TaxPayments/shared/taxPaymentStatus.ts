import type { TaxPayment } from '@gusto/embedded-api/models/components/taxpayment'

/** @internal */
export type TaxPaymentStatus = 'paid' | 'scheduled' | 'overdue' | 'refund'

/** @internal */
export const TAX_PAYMENT_STATUSES: readonly TaxPaymentStatus[] = [
  'paid',
  'scheduled',
  'overdue',
  'refund',
]

/**
 * Value of the "show everything" entry in the jurisdiction and status filters.
 *
 * @remarks
 * A non-empty sentinel rather than `''` so the filter has a real selected key — an empty key reads
 * as "no selection" to the underlying select, which renders the placeholder instead of the option
 * and cannot be distinguished from being cleared.
 *
 * @internal
 */
export const ALL_FILTER_VALUE = 'all'

/** @internal */
export const FEDERAL_JURISDICTION = 'US'

/** @internal */
export const TAX_PAYMENT_STATUS_BADGES: Record<
  TaxPaymentStatus,
  'info' | 'success' | 'warning' | 'error'
> = {
  paid: 'success',
  scheduled: 'info',
  overdue: 'error',
  refund: 'info',
}

/** @internal */
export function isFederalTaxPayment(payment: Pick<TaxPayment, 'jurisdiction'>): boolean {
  return payment.jurisdiction === FEDERAL_JURISDICTION
}

/**
 * Resolves the translation key and interpolation values for a tax payment's jurisdiction label.
 *
 * @remarks
 * Returns a key rather than a string because `Company.Management.TaxPaymentsList` and
 * `Company.Management.TaxPaymentDetail` each own their own i18n namespace and must translate from it. This
 * keeps the federal/state branching in one place while leaving the lookup to the caller.
 *
 * @param payment - The tax payment to label.
 * @returns The translation key and its interpolation values.
 * @internal
 */
export function getJurisdictionLabel(payment: Pick<TaxPayment, 'jurisdiction'>): {
  key: 'federal' | 'state'
  values: { jurisdiction: string }
} {
  return isFederalTaxPayment(payment)
    ? { key: 'federal', values: { jurisdiction: FEDERAL_JURISDICTION } }
    : { key: 'state', values: { jurisdiction: payment.jurisdiction ?? '' } }
}

/**
 * Derives a display status for a tax payment.
 *
 * @remarks
 * The API has no status field, so status is derived from the amounts and dates. The API sends
 * `payment_sent_on: null` for both never-sent and returned/cancelled payments, so a
 * returned/cancelled state cannot be distinguished here.
 *
 * Settlement is checked before the amount's sign, so a refund that has already been sent or
 * reimbursed reads as `paid` rather than staying `refund` forever.
 *
 * A zero-amount payment owes nothing and will never be sent, so it reads as `paid` rather than
 * sitting in `scheduled` indefinitely. The list endpoint does return zero-amount payments — it
 * applies `.for_taxes.non_penalty` but not `.with_amounts` — so this is a real case, not a
 * theoretical one.
 *
 * @param payment - The tax payment to classify.
 * @param today - Today's date as a `YYYY-MM-DD` string in the user's local timezone.
 * @returns The derived status.
 * @internal
 */
export function deriveTaxPaymentStatus(
  payment: Pick<TaxPayment, 'amount' | 'amountPaid' | 'dueDate' | 'paymentSentOn'>,
  today: string,
): TaxPaymentStatus {
  const amount = parseFloat(payment.amount)
  const amountPaid = parseFloat(payment.amountPaid)

  if (payment.paymentSentOn) return 'paid'
  if (amount === 0) return 'paid'
  if (amount > 0 && amountPaid >= amount) return 'paid'
  if (amount < 0 && amountPaid <= amount) return 'paid'

  if (amount < 0) return 'refund'

  const dueDate = payment.dueDate?.toString()
  if (dueDate && dueDate < today) return 'overdue'

  return 'scheduled'
}
