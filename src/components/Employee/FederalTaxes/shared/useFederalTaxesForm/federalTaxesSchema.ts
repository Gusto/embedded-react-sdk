import { z } from 'zod'
import { FilingStatus } from '@gusto/embedded-api-v-2025-11-15/models/operations/putv1employeesemployeeidfederaltaxes'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceNaN, coerceStringBoolean } from '@/partner-hook-utils/form/preprocessors'

// ── Error codes ────────────────────────────────────────────────────────

export const FederalTaxesErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

export type FederalTaxesErrorCode =
  (typeof FederalTaxesErrorCodes)[keyof typeof FederalTaxesErrorCodes]

// ── Filing status options ──────────────────────────────────────────────

export const FILING_STATUS_VALUES = [
  FilingStatus.Single,
  FilingStatus.Married,
  FilingStatus.HeadOfHousehold,
  FilingStatus.ExemptFromWithholding,
] as const

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

export type FederalTaxesField = keyof typeof fieldValidators

export type FederalTaxesFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
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

export type FederalTaxesOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

interface FederalTaxesSchemaOptions {
  optionalFieldsToRequire?: FederalTaxesOptionalFieldsToRequire
}

export function createFederalTaxesSchema(options: FederalTaxesSchemaOptions = {}) {
  const { optionalFieldsToRequire } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: FederalTaxesErrorCodes.REQUIRED,
    mode: 'update',
    optionalFieldsToRequire,
  })
}
