import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceToISODate } from '@/partner-hook-utils/form/preprocessors'

// ── Error codes ────────────────────────────────────────────────────────

/**
 * Validation error codes emitted by the contractor rehire form schema. Map these
 * codes to localized copy in `validationMessages` when composing the hook.
 *
 * | Code | Meaning |
 * | ---- | ------- |
 * | `REQUIRED` | `startDate` is missing. |
 * | `START_DATE_BEFORE_MIN` | `startDate` precedes the caller-supplied minimum (the day after the dismissal). |
 *
 * @public
 */
export const ContractorRehireErrorCodes = {
  REQUIRED: 'REQUIRED',
  START_DATE_BEFORE_MIN: 'START_DATE_BEFORE_MIN',
} as const

/**
 * Union of validation error code strings emitted by the contractor rehire form schema.
 *
 * @public
 */
export type ContractorRehireErrorCode =
  (typeof ContractorRehireErrorCodes)[keyof typeof ContractorRehireErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  startDate: z.preprocess(
    coerceToISODate,
    z.iso.date({ error: () => ContractorRehireErrorCodes.REQUIRED }),
  ),
}

/**
 * Field names accepted by the contractor rehire form.
 *
 * @public
 */
export type ContractorRehireFormField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the contractor rehire form.
 *
 * @public
 * @interface
 */
export type ContractorRehireFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

/**
 * Shape of the validated values produced by the contractor rehire form on submit.
 * Internal seam between the form's input and parsed-output types; the two coincide
 * today, and partners consume the parsed values through `form.getFormSubmissionValues`.
 *
 * @internal
 */
export type ContractorRehireFormOutputs = ContractorRehireFormData

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

interface ContractorRehireSchemaOptions {
  /**
   * Absolute lower bound for `startDate` as a `YYYY-MM-DD` string — the day after the
   * contractor's dismissal, since a rehire cannot predate the dismissal it reverses.
   * Surfaces a `START_DATE_BEFORE_MIN` issue when violated. Omit when the contractor has
   * no recorded dismissal date, leaving the field unbounded.
   */
  minStartDate?: string | null
}

/** @internal */
export function createContractorRehireSchema(options: ContractorRehireSchemaOptions = {}) {
  const { minStartDate } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: ContractorRehireErrorCodes.REQUIRED,
    mode: 'create',
    // Enforced here as well as on the date picker: the picker's `minDate` only constrains
    // the calendar, so a typed-in date — or a partner driving the hook with their own
    // input — would otherwise reach the API and come back as a generic error banner
    // rather than a message on the field. Both values are `YYYY-MM-DD`, so a lexicographic
    // comparison is a chronological one.
    superRefine: (data, ctx) => {
      if (minStartDate && data.startDate && data.startDate < minStartDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startDate'],
          message: ContractorRehireErrorCodes.START_DATE_BEFORE_MIN,
        })
      }
    },
  })
}
