import { z } from 'zod'
import { PayrollUpdatePaymentMethod } from '@gusto/embedded-api/models/components/payrollupdate'

/**
 * Payment-method option values, in display order. The hook publishes these on
 * `fieldsMetadata.paymentMethod` via `withOptions`; the UI supplies the
 * translated labels through `getOptionLabel`.
 *
 * @internal
 */
export const PAYMENT_METHOD_VALUES = [
  PayrollUpdatePaymentMethod.DirectDeposit,
  PayrollUpdatePaymentMethod.Check,
] as const

/** @internal */
export const PAYMENT_METHOD_OPTIONS = PAYMENT_METHOD_VALUES.map(value => ({ value, label: value }))

/**
 * Validation error codes produced by the payroll edit-employee schema.
 *
 * @public
 */
export const PayrollEditEmployeeErrorCodes = {
  NEGATIVE_AMOUNT: 'NEGATIVE_AMOUNT',
} as const

/**
 * Union of validation error codes emitted by the payroll edit-employee schema.
 *
 * @public
 */
export type PayrollEditEmployeeErrorCode =
  (typeof PayrollEditEmployeeErrorCodes)[keyof typeof PayrollEditEmployeeErrorCodes]

// A plain, non-negative decimal: one or more digits with an optional fractional
// part. Deliberately strict — `parseFloat` would accept "5ea" (→ 5), "Infinity",
// and "1e3", any of which would silently corrupt the amount downstream.
const NON_NEGATIVE = /^\d+(\.\d+)?$/

// Hours and amounts are entered as strings. Blank is allowed (it means "not
// provided" — see the submit rule), but any provided value must be a valid,
// non-negative number.
const nonNegativeAmount = z.string().refine(value => value === '' || NON_NEGATIVE.test(value), {
  message: PayrollEditEmployeeErrorCodes.NEGATIVE_AMOUNT,
})

const reimbursementSchema = z.object({
  uuid: z.string().nullable().optional(),
  description: z.string(),
  amount: nonNegativeAmount,
  recurring: z.boolean().optional(),
})

/**
 * Builds the Zod schema for the payroll edit-employee form.
 *
 * @remarks
 * Overtime-affecting values are keyed by workweek internally: hours and
 * additional earnings are job-then-name-then-workweekStart records, so the
 * single-workweek case is just the degenerate one-key form of the multi-workweek
 * shape. Non-overtime earnings (other) are flat job-then-name-to-amount records
 * with no per-workweek breakdown, since they do not feed the blended rate. Time
 * off and final payout are keyed by compensation name. This keeps one schema and
 * one submit path.
 *
 * @returns The Zod schema validating {@link PayrollEditEmployeeFormData}.
 * @internal
 */
export function createPayrollEditEmployeeSchema() {
  return z.object({
    hours: z.record(z.string(), z.record(z.string(), z.record(z.string(), nonNegativeAmount))),
    additionalEarnings: z.record(
      z.string(),
      z.record(z.string(), z.record(z.string(), nonNegativeAmount)),
    ),
    other: z.record(z.string(), z.record(z.string(), nonNegativeAmount)),
    timeOff: z.record(z.string(), nonNegativeAmount),
    finalPayout: z.record(z.string(), nonNegativeAmount),
    reimbursements: z.array(reimbursementSchema),
    paymentMethod: z.enum(PayrollUpdatePaymentMethod).optional(),
  })
}

/**
 * Shape of the values managed by the payroll edit-employee form.
 *
 * @public
 */
export type PayrollEditEmployeeFormData = z.infer<
  ReturnType<typeof createPayrollEditEmployeeSchema>
>

/**
 * Validated values produced by the payroll edit-employee form on submit.
 *
 * @internal
 */
export type PayrollEditEmployeeFormOutputs = PayrollEditEmployeeFormData

/**
 * A single reimbursement row in {@link PayrollEditEmployeeFormData}.
 *
 * @public
 */
export type ReimbursementFormEntry = PayrollEditEmployeeFormData['reimbursements'][number]
