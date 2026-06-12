import { z } from 'zod'
import {
  buildFormSchema,
  type OptionalFieldsToRequire,
  type RequiredFieldConfig,
} from '@/partner-hook-utils/form/buildFormSchema'
import { SPLIT_BY } from '@/shared/constants'

/**
 * Validation error codes emitted by the split payments form schema. Map these
 * codes to localized copy in `validationMessages` when composing the hook.
 *
 * @public
 */
export const SplitPaymentsFormErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_PERCENTAGE: 'INVALID_PERCENTAGE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  DUPLICATE_PRIORITIES: 'DUPLICATE_PRIORITIES',
  PERCENTAGE_TOTAL_MISMATCH: 'PERCENTAGE_TOTAL_MISMATCH',
} as const

/**
 * Synthetic form path where the schema emits the percentage-sum-to-100
 * invariant. The hook subscribes to errors at this path to drive
 * `status.hasPercentageImbalance`.
 *
 * @internal
 */
export const PERCENTAGE_TOTAL_PATH = 'percentageTotal' as const

/**
 * Union of validation error code strings emitted by the split payments form
 * schema.
 *
 * @public
 */
export type SplitPaymentsFormErrorCode =
  (typeof SplitPaymentsFormErrorCodes)[keyof typeof SplitPaymentsFormErrorCodes]

/**
 * Supported split-by modes: split by percentage of net pay, or by fixed dollar
 * amount per account.
 *
 * @public
 */
export const SPLIT_BY_VALUES = [SPLIT_BY.percentage, SPLIT_BY.amount] as const
/**
 * Union of split-by mode values that the form accepts.
 *
 * @public
 */
export type SplitByValue = (typeof SPLIT_BY_VALUES)[number]

// Cleared NumberInput emits `NaN`. Normalize NaN to `null` at the schema
// boundary so it (a) doesn't trip Zod's built-in "expected number, received
// NaN" message, and (b) flows through the same REQUIRED branch in
// `superRefine` as an explicitly null value.
const splitAmountValueSchema = z.preprocess(
  v => (typeof v === 'number' && Number.isNaN(v) ? null : v),
  z.number().nullable(),
)

const fieldValidators = {
  splitBy: z.enum(SPLIT_BY_VALUES),
  splitAmount: z.record(z.string(), splitAmountValueSchema),
  priority: z.record(z.string(), z.number()),
}

/**
 * Field names accepted by the split payments form.
 *
 * @public
 */
export type SplitPaymentsFormField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the split payments form. `splitAmount` and
 * `priority` are keyed by bank account uuid.
 *
 * @public
 */
export type SplitPaymentsFormData = {
  /** Selected split mode — by percentage or by fixed amount. */
  splitBy: SplitByValue
  /** Per-account split values keyed by bank account uuid (percent or dollars depending on `splitBy`). */
  splitAmount: Record<string, number | null>
  /** Per-account priority values keyed by bank account uuid; the highest priority receives the remainder. */
  priority: Record<string, number>
}
/**
 * Shape of the validated values produced by the split payments form on submit.
 *
 * @public
 */
export type SplitPaymentsFormOutputs = SplitPaymentsFormData

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<typeof fieldValidators>

/**
 * Keys of optional split payments fields that can be promoted to required via
 * the hook's `optionalFieldsToRequire` option.
 *
 * @public
 */
export type SplitPaymentsFormOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/** @internal */
interface SplitPaymentsFormSchemaOptions {
  optionalFieldsToRequire?: SplitPaymentsFormOptionalFieldsToRequire
}

/**
 * Resolves the remainder uuid (highest priority value) from a priority map.
 * Exported so the hook can mirror the same selection rule when deriving
 * dynamic field metadata.
 */
function resolveRemainderUuid(priority: Record<string, number>): string {
  return Object.entries(priority).reduce<string>((maxId, [uuid, value]) => {
    if (!maxId) return uuid
    const currentMax = priority[maxId] ?? 0
    return value > currentMax ? uuid : maxId
  }, '')
}

/** @internal */
export function createSplitPaymentsFormSchema(options: SplitPaymentsFormSchemaOptions = {}) {
  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: SplitPaymentsFormErrorCodes.REQUIRED,
    mode: 'update',
    optionalFieldsToRequire: options.optionalFieldsToRequire,
    superRefine: (data, ctx) => {
      if (data.splitBy === SPLIT_BY.percentage) {
        let anyInvalid = false
        let total = 0
        for (const [uuid, value] of Object.entries(data.splitAmount)) {
          if (value === null) {
            anyInvalid = true
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['splitAmount', uuid],
              message: SplitPaymentsFormErrorCodes.REQUIRED,
            })
            continue
          }
          if (!Number.isInteger(value) || value < 0 || value > 100) {
            anyInvalid = true
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['splitAmount', uuid],
              message: SplitPaymentsFormErrorCodes.INVALID_PERCENTAGE,
            })
            continue
          }
          total += value
        }
        // Only enforce sum-to-100 when every split is otherwise valid. While
        // any value is missing or out of range, the per-field error is the
        // right thing to surface; an additional sum mismatch would be noise.
        // Emitted at the synthetic form path so the hook can drive a
        // form-level alert via `status.hasPercentageImbalance` without
        // polluting per-field errors.
        if (!anyInvalid && total !== 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [PERCENTAGE_TOTAL_PATH],
            message: SplitPaymentsFormErrorCodes.PERCENTAGE_TOTAL_MISMATCH,
          })
        }
      } else {
        const remainderUuid = resolveRemainderUuid(data.priority)
        for (const [uuid, value] of Object.entries(data.splitAmount)) {
          if (value === null) {
            if (uuid === remainderUuid) continue
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['splitAmount', uuid],
              message: SplitPaymentsFormErrorCodes.REQUIRED,
            })
            continue
          }
          if (value < 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['splitAmount', uuid],
              message: SplitPaymentsFormErrorCodes.INVALID_AMOUNT,
            })
          }
        }
        const priorities = Object.values(data.priority)
        if (new Set(priorities).size !== priorities.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['priority'],
            message: SplitPaymentsFormErrorCodes.DUPLICATE_PRIORITIES,
          })
        }
      }
    },
  })
}
