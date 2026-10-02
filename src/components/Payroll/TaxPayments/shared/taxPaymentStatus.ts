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
 * Derives a display status for a tax payment.
 *
 * @remarks
 * The API has no status field, so status is derived from the amounts and dates. The API sends
 * `payment_sent_on: null` for both never-sent and returned/cancelled payments, so a
 * returned/cancelled state cannot be distinguished here.
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
  if (amount < 0) return 'refund'
  if (payment.paymentSentOn) return 'paid'
  if (amount > 0 && parseFloat(payment.amountPaid) >= amount) return 'paid'
  const dueDate = payment.dueDate?.toString()
  if (dueDate && dueDate < today) return 'overdue'
  return 'scheduled'
}
