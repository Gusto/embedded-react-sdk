/**
 * The subset of a contractor payment record needed to derive its wage and total amounts. Both
 * pre-creation (`ContractorPayments`, `ContractorPaymentForGroupPreview`) and post-creation
 * (`ContractorPaymentForGroup`) payment shapes satisfy this structurally.
 *
 * @internal
 */
export interface ContractorPaymentAmountFields {
  wageType?: string
  hourlyRate?: string
  hours?: string
  wage?: string
  bonus?: string
  reimbursement?: string
  wageTotal?: string
}

/**
 * The payment's wage amount: `hours * hourlyRate` for Hourly contractors, otherwise the raw
 * `wage` field. The API only populates `wage` for Fixed-wage contractors, so Hourly payments
 * must be derived from hours and rate instead.
 *
 * @internal
 */
export function getContractorPaymentWageAmount(payment: ContractorPaymentAmountFields): number {
  return payment.wageType === 'Hourly'
    ? Number(payment.hours || '0') * Number(payment.hourlyRate || '0')
    : Number(payment.wage || '0')
}

/**
 * The payment's true total: `wageTotal + reimbursement`. The API's `wageTotal` field is
 * `(hours * hourlyRate) + wage + bonus` and excludes reimbursement by design, so callers must add
 * it back in rather than treating `wageTotal` alone as "the total".
 *
 * @internal
 */
export function getContractorPaymentTotalAmount(payment: ContractorPaymentAmountFields): number {
  return Number(payment.wageTotal || '0') + Number(payment.reimbursement || '0')
}
