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
  REIMBURSEMENT_AMOUNT: 'REIMBURSEMENT_AMOUNT',
  REQUIRED_WORKWEEK: 'REQUIRED_WORKWEEK',
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

// A "row" is one job+name line's week map (`{ [workweekStart]: amount }`). A
// collapsed (non-split) row always has exactly one key, so `entries.length <= 1`
// makes this a no-op for collapsed rows — only a split row (multiple workweek
// keys) can be "partial." See the module-level remarks on {@link createPayrollEditEmployeeSchema}.
function addRequiredWorkweekIssues(
  ctx: z.RefinementCtx,
  section: Record<string, Record<string, Record<string, string>>>,
  sectionKey: 'hours' | 'additionalEarnings',
): void {
  for (const [jobUuid, names] of Object.entries(section)) {
    for (const [name, weekMap] of Object.entries(names)) {
      const entries = Object.entries(weekMap)
      if (entries.length <= 1) continue
      const hasAnyValue = entries.some(([, value]) => value !== '')
      if (!hasAnyValue) continue
      for (const [workweekStart, value] of entries) {
        if (value === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: PayrollEditEmployeeErrorCodes.REQUIRED_WORKWEEK,
            path: [sectionKey, jobUuid, name, workweekStart],
          })
        }
      }
    }
  }
}

/**
 * Builds the Zod schema for the payroll edit-employee form.
 *
 * @remarks
 * Overtime-affecting values are keyed by workweek internally: hours and
 * additional earnings are job-then-name-then-workweekStart records, so the
 * single-workweek (or not-yet-split) case is just the degenerate one-key form
 * of the multi-workweek shape. Non-overtime earnings (other) are flat
 * job-then-name-to-amount records with no per-workweek breakdown, since they do
 * not feed the blended rate. Time off and final payout are keyed by
 * compensation name. This keeps one schema and one submit path.
 *
 * A `superRefine` enforces per-row completeness on `hours` and
 * `additionalEarnings`: once any workweek cell in a job+name row is filled, every
 * other cell in that row must be filled too, surfaced per empty cell as
 * {@link PayrollEditEmployeeErrorCodes.REQUIRED_WORKWEEK}. A row with nothing
 * filled is left alone (still submittable as untouched). This needs no
 * workweek/split context passed in — it's purely structural on whatever keys a
 * row happens to have, which is why a collapsed row (always exactly one key)
 * can never trigger it.
 *
 * @returns The Zod schema validating {@link PayrollEditEmployeeFormData}.
 * @internal
 */
export function createPayrollEditEmployeeSchema() {
  return z
    .object({
      hours: z.record(z.string(), z.record(z.string(), z.record(z.string(), nonNegativeAmount))),
      additionalEarnings: z.record(
        z.string(),
        z.record(z.string(), z.record(z.string(), nonNegativeAmount)),
      ),
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
    .superRefine((data, ctx) => {
      addRequiredWorkweekIssues(ctx, data.hours, 'hours')
      addRequiredWorkweekIssues(ctx, data.additionalEarnings, 'additionalEarnings')
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
