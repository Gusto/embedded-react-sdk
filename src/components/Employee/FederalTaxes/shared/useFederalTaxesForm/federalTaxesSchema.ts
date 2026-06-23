import { z } from 'zod'
import { FilingStatus } from '@gusto/embedded-api-v-2026-02-01/models/operations/putv1employeesemployeeidfederaltaxes'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceNaN, coerceStringBoolean } from '@/partner-hook-utils/form/preprocessors'

// ── Error codes ────────────────────────────────────────────────────────

/**
 * Validation error codes emitted by the federal taxes form schema. Map these
 * codes to localized copy in `validationMessages` when composing the hook.
 *
 * @public
 */
export const FederalTaxesErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

/**
 * Union of validation error code strings emitted by the federal taxes form
 * schema.
 *
 * @public
 */
export type FederalTaxesErrorCode =
  (typeof FederalTaxesErrorCodes)[keyof typeof FederalTaxesErrorCodes]

// ── Filing status options ──────────────────────────────────────────────

/**
 * Supported W-4 filing status values: single, married filing jointly, head of
 * household, and exempt from withholding.
 *
 * @public
 */
export const FILING_STATUS_VALUES = [
  FilingStatus.Single,
  FilingStatus.Married,
  FilingStatus.HeadOfHousehold,
  FilingStatus.ExemptFromWithholding,
] as const

/**
 * Union of filing status values that the form accepts.
 *
 * @public
 */
export type FilingStatusValue = (typeof FILING_STATUS_VALUES)[number]

// ── Field validators ───────────────────────────────────────────────────

// `filingStatus` is typed as `string` (not `z.enum`) so the initial empty form state is valid
// for parsing while still failing the required check via `buildFormSchema`. The actual value is
// constrained at the UI layer via the Select's options, and cast back to `FilingStatus` at
// submission time.
const fieldValidators = {
  filingStatus: z.string(),
  twoJobs: z.preprocess(coerceStringBoolean, z.boolean()),
  dependentsAmount: z.preprocess(coerceNaN(0), z.number()),
  otherIncome: z.preprocess(coerceNaN(0), z.number()),
  deductions: z.preprocess(coerceNaN(0), z.number()),
  extraWithholding: z.preprocess(coerceNaN(0), z.number()),
}

/**
 * Field names accepted by the federal taxes form.
 *
 * @public
 */
export type FederalTaxesField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the federal taxes form.
 *
 * @public
 */
export type FederalTaxesFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
/**
 * Shape of the validated values produced by the federal taxes form on submit.
 *
 * @public
 */
export type FederalTaxesFormOutputs = FederalTaxesFormData

// ── Required fields config ─────────────────────────────────────────────

// Only `filingStatus` is required by the API on update. The remaining fields are
// optional by default so partners can decide their own UX; the bundled
// `<FederalTaxes>` component promotes them to required via `optionalFieldsToRequire`
// to preserve the original (all-required) behavior.
const requiredFieldsConfig = {
  twoJobs: 'never',
  dependentsAmount: 'never',
  otherIncome: 'never',
  deductions: 'never',
  extraWithholding: 'never',
} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

/**
 * Keys of optional federal taxes fields that can be promoted to required via
 * the hook's `optionalFieldsToRequire` option.
 *
 * @public
 */
export type FederalTaxesOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/** @internal */
interface FederalTaxesSchemaOptions {
  optionalFieldsToRequire?: FederalTaxesOptionalFieldsToRequire
}

/** @internal */
export function createFederalTaxesSchema(options: FederalTaxesSchemaOptions = {}) {
  const { optionalFieldsToRequire } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: FederalTaxesErrorCodes.REQUIRED,
    mode: 'update',
    optionalFieldsToRequire,
  })
}
