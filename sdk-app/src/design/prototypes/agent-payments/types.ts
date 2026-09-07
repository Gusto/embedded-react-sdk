export type TaxPaymentStatus = 'paid' | 'scheduled' | 'overdue' | 'refund'

export type TaxPaymentScope = 'federal' | 'state'

export const FEDERAL_JURISDICTION = 'US'

/**
 * A single payroll tax liability rolled up into a tax payment. Only present on
 * the detail (show) response; the list response omits it.
 */
export interface TaxPaymentLineItem {
  payroll_uuid: string
  unique_tax_id: string
  amount: string
}

/**
 * Wire shape of a tax payment from
 * `GET /v1/companies/:company_uuid/tax_payments[/:uuid]`. `amount`/`amount_paid`
 * are decimal strings and can be negative (corrections, refunds, credits).
 * `line_items` is only populated on the single-payment detail response.
 */
export interface TaxPayment {
  uuid: string
  company_uuid: string
  agency_name: string
  jurisdiction: string
  period_start: string
  period_end: string
  due_date: string
  payment_sent_on: string | null
  amount: string
  amount_paid: string
  line_items?: TaxPaymentLineItem[]
}

export function deriveTaxPaymentScope(payment: TaxPayment): TaxPaymentScope {
  return payment.jurisdiction === FEDERAL_JURISDICTION ? 'federal' : 'state'
}

export function deriveTaxPaymentStatus(payment: TaxPayment, today: string): TaxPaymentStatus {
  // The API has no status field, so status is derived. Note the API sends
  // `payment_sent_on: null` for both never-sent AND returned/cancelled payments,
  // so a returned/cancelled state cannot be distinguished here — don't add one.
  const amount = parseFloat(payment.amount)
  if (amount < 0) return 'refund'
  // `payment_sent_on` present is the "Gusto remitted" signal; otherwise treat a
  // fully-settled balance as paid, guarding the zero-amount edge (0 >= 0).
  if (payment.payment_sent_on) return 'paid'
  if (amount > 0 && parseFloat(payment.amount_paid) >= amount) return 'paid'
  if (payment.due_date < today) return 'overdue'
  return 'scheduled'
}
