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
  REQUIRED_WORKWEEK: 'REQUIRED_WORKWEEK',
  REIMBURSEMENT_AMOUNT: 'REIMBURSEMENT_AMOUNT',
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

// One overtime-affecting line's per-workweek cells (a "row"): a record keyed by
// workweek start date. A row is all-or-nothing in the split view — either every
// cell is blank (the line stays a flat, untouched total) or every cell is filled
// (the line submits real breakdowns). A partial row (some filled, some blank)
// flags each blank cell REQUIRED_WORKWEEK so the user must complete it.
//
// In the collapsed (flat) view a row has exactly one cell (see buildWeekMap), so
// this rule is a natural no-op there: a single cell is trivially all-blank or
// all-filled.
const workweekRow = z.record(z.string(), nonNegativeAmount).superRefine((weekMap, ctx) => {
  const entries = Object.entries(weekMap)
  const filledCount = entries.filter(([, value]) => value !== '').length
  if (filledCount === 0 || filledCount === entries.length) return
  for (const [workweekStart, value] of entries) {
    if (value === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: PayrollEditEmployeeErrorCodes.REQUIRED_WORKWEEK,
        path: [workweekStart],
      })
    }
  }
})

// Committed reimbursement rows are presentational passthrough: they hold data
// that was already validated when its draft was saved (or came from the server),
// so the amount is a plain string here. All reimbursement validation lives in
// `reimbursementDraftSchema` below, mirroring the legacy editor.
const reimbursementSchema = z.object({
  uuid: z.string().nullable().optional(),
  description: z.string(),
  amount: z.string(),
  recurring: z.boolean().optional(),
})

/**
 * The single reimbursement validation schema: the "add reimbursement" draft row.
 * Amount must be a number greater than zero, matching the legacy editor's
 * inline validation. The hook validates the draft against this before committing
 * it to the presentational `reimbursements` list.
 *
 * @internal
 */
export const reimbursementDraftSchema = z.object({
  description: z.string(),
  amount: z.string().refine(value => parseFloat(value) > 0, {
    message: PayrollEditEmployeeErrorCodes.REIMBURSEMENT_AMOUNT,
  }),
})

/**
 * Builds the Zod schema for the payroll edit-employee form.
 *
 * @remarks
 * Overtime-affecting values are keyed by workweek internally: hours and
 * additional earnings are job-then-name-then-workweekStart records, so the
 * collapsed (flat) case is just the degenerate one-key form of the multi-workweek
 * shape. Each innermost row is validated all-or-nothing across its workweek cells
 * (see {@link PayrollEditEmployeeErrorCodes.REQUIRED_WORKWEEK}). Non-overtime
 * earnings (other) are flat job-then-name-to-amount records with no per-workweek
 * breakdown, since they do not feed the blended rate. Time off and final payout
 * are keyed by compensation name. This keeps one schema and one submit path.
 *
 * @returns The Zod schema validating {@link PayrollEditEmployeeFormData}.
 * @internal
 */
export function createPayrollEditEmployeeSchema() {
  return z.object({
    hours: z.record(z.string(), z.record(z.string(), workweekRow)),
    additionalEarnings: z.record(z.string(), z.record(z.string(), workweekRow)),
    other: z.record(z.string(), z.record(z.string(), nonNegativeAmount)),
    timeOff: z.record(z.string(), nonNegativeAmount),
    finalPayout: z.record(z.string(), nonNegativeAmount),
    reimbursements: z.array(reimbursementSchema),
    // Binding shape only — the draft is validated against `reimbursementDraftSchema`
    // at save time, not by the main resolver, so a half-filled draft never blocks
    // the payroll submit.
    reimbursementDraft: z.object({ description: z.string(), amount: z.string() }),
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
