import { z } from 'zod'
import { GarnishmentType } from '@gusto/embedded-api/models/components/garnishment'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceNaN, coerceStringBoolean } from '@/partner-hook-utils/form/preprocessors'

// ── Error codes ────────────────────────────────────────────────────────

export const DeductionFormErrorCodes = {
  REQUIRED: 'REQUIRED',
  NEGATIVE_AMOUNT: 'NEGATIVE_AMOUNT',
} as const

export type DeductionFormErrorCode =
  (typeof DeductionFormErrorCodes)[keyof typeof DeductionFormErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  description: z.string(),
  // Radio groups deliver `'true'`/`'false'` strings; coerce to boolean for the
  // submit payload. Matches the useJobForm pattern.
  recurring: z.preprocess(coerceStringBoolean, z.boolean()),
  deductAsPercentage: z.preprocess(coerceStringBoolean, z.boolean()),
  // Currency / percent input. NumberInputField writes `number | undefined`;
  // coerce to a numeric so .min(0) runs reliably. The number-to-string
  // conversion the garnishment API expects happens inside the hook's onSubmit,
  // so the form value stays a number end-to-end (input === output).
  amount: z.preprocess(
    coerceNaN(0),
    z.number().min(0, { message: DeductionFormErrorCodes.NEGATIVE_AMOUNT }),
  ),
  // Optional caps. The hook drops them to `null` on the wire when 0 — matches
  // the legacy DeductionSchema's "0 means no cap" behavior.
  totalAmount: z.preprocess(
    coerceNaN(0),
    z.number().min(0, { message: DeductionFormErrorCodes.NEGATIVE_AMOUNT }),
  ),
  annualMaximum: z.preprocess(
    coerceNaN(0),
    z.number().min(0, { message: DeductionFormErrorCodes.NEGATIVE_AMOUNT }),
  ),
  // Only used when `courtOrdered: true` — see `excludeFields` below.
  garnishmentType: z.enum(GarnishmentType),
}

export type DeductionFormField = keyof typeof fieldValidators

export type DeductionFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

export type DeductionFormOutputs = DeductionFormData

// ── Required fields config ─────────────────────────────────────────────
//
// `description`, `recurring`, `deductAsPercentage`, `amount` are required by
// default. `garnishmentType` is required only when present in the shape
// (court-ordered branch). `totalAmount` and `annualMaximum` are caps the
// partner can leave blank.

const requiredFieldsConfig = {
  totalAmount: 'never',
  annualMaximum: 'never',
} satisfies RequiredFieldConfig<typeof fieldValidators>

export type DeductionFormOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

interface DeductionFormSchemaOptions {
  mode?: 'create' | 'update'
  /**
   * Court-ordered garnishments require `garnishmentType` (Federal Tax Lien,
   * Student Loan, etc.). Non-court-ordered "custom" deductions don't carry a
   * type — the field is excluded from the schema entirely, matching the legacy
   * GarnishmentForm vs CustomDeductionForm split.
   */
  courtOrdered: boolean
  optionalFieldsToRequire?: DeductionFormOptionalFieldsToRequire
}

export function createDeductionFormSchema(options: DeductionFormSchemaOptions) {
  const { mode = 'create', courtOrdered, optionalFieldsToRequire } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: DeductionFormErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    excludeFields: courtOrdered ? [] : ['garnishmentType'],
  })
}
