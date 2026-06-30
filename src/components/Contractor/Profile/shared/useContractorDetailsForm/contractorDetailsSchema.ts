import { z } from 'zod'
import {
  WageType as ApiWageType,
  ContractorType as ApiContractorType,
} from '@gusto/embedded-api-v-2025-11-15/models/components/contractor'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceNaN, coerceToISODate } from '@/partner-hook-utils/form/preprocessors'
import { SSN_REGEX, NAME_REGEX } from '@/helpers/validations'
import { normalizeEin } from '@/helpers/federalEin'

/**
 * Contractor type enum (`Individual` / `Business`) re-exported from the API model.
 *
 * @public
 */
export const ContractorType = ApiContractorType
/**
 * Contractor wage type enum (`Fixed` / `Hourly`) re-exported from the API model.
 *
 * @public
 */
export const WageType = ApiWageType

// ── Error codes ────────────────────────────────────────────────────────

/**
 * Validation error codes emitted by the contractor details form schema. Map
 * these codes to localized copy in `validationMessages` when composing the
 * hook.
 *
 * @public
 */
export const ContractorDetailsErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_NAME: 'INVALID_NAME',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_SSN: 'INVALID_SSN',
  INVALID_EIN: 'INVALID_EIN',
} as const

/**
 * Union of validation error code strings emitted by the contractor details
 * form schema.
 *
 * @public
 */
export type ContractorDetailsErrorCode =
  (typeof ContractorDetailsErrorCodes)[keyof typeof ContractorDetailsErrorCodes]

const EIN_FORMAT_REGEX = /^\d{2}-\d{7}$/

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  type: z.enum([ContractorType.Individual, ContractorType.Business]),
  wageType: z.enum([WageType.Hourly, WageType.Fixed]),
  startDate: z.preprocess(
    coerceToISODate,
    z.iso.date({ error: () => ContractorDetailsErrorCodes.REQUIRED }),
  ),
  hourlyRate: z.preprocess(coerceNaN(0), z.number().min(0)),
  selfOnboarding: z.boolean(),
  fileNewHireReport: z.boolean(),
  email: z.email({ error: () => ContractorDetailsErrorCodes.INVALID_EMAIL }),
  firstName: z
    .string()
    .min(1, { message: ContractorDetailsErrorCodes.REQUIRED })
    .regex(NAME_REGEX, { message: ContractorDetailsErrorCodes.INVALID_NAME }),
  lastName: z
    .string()
    .min(1, { message: ContractorDetailsErrorCodes.REQUIRED })
    .regex(NAME_REGEX, { message: ContractorDetailsErrorCodes.INVALID_NAME }),
  middleInitial: z.string(),
  businessName: z.string(),
  workState: z.string(),
  ssn: z
    .string({ error: () => ContractorDetailsErrorCodes.REQUIRED })
    .refine((v: string) => SSN_REGEX.test(v.replace(/\D/g, '')), {
      message: ContractorDetailsErrorCodes.INVALID_SSN,
    }),
  ein: z
    .string({ error: () => ContractorDetailsErrorCodes.REQUIRED })
    .refine((v: string) => EIN_FORMAT_REGEX.test(normalizeEin(v)), {
      message: ContractorDetailsErrorCodes.INVALID_EIN,
    }),
}

/**
 * Shape of the values managed by the contractor details form.
 *
 * @public
 * @interface
 */
export type ContractorDetailsFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

/**
 * Shape of the validated values produced by the contractor details form on
 * submit.
 *
 * @public
 */
export type ContractorDetailsFormOutputs = ContractorDetailsFormData

// ── Required fields config ─────────────────────────────────────────────
//
// Requiredness mirrors the contractor create/update API contract: fields the
// API requires on create are `'create'` (optional on update), and fields the
// API treats as optional are `'never'`. Type/wage *applicability* (does a field
// apply to this contractor at all?) is handled separately by `excludeFields` —
// see `getExcludedContractorFields` — not by requiredness. SSN/EIN are never
// gated by `selfOnboarding`: each consumer decides whether to render and require
// them (admins hide them when inviting; self-onboarding profiles collect them).
//
// `email` is the one genuinely value-conditional rule: it always applies but is
// only required when self-onboarding is on (create and update, matching the
// API's "if self_onboarding is true, then email is required"). A single-operand
// predicate keeps `buildFormSchema`'s dependency-detecting Proxy accurate.

const requiredFieldsConfig = {
  startDate: 'create',
  firstName: 'create',
  lastName: 'create',
  businessName: 'create',
  hourlyRate: 'create',
  workState: 'create',
  middleInitial: 'never',
  ssn: 'never',
  ein: 'never',
  email: data => data.selfOnboarding,
} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

/**
 * Keys of optional contractor details fields that can be promoted to required
 * via the hook's `optionalFieldsToRequire` option.
 *
 * @public
 */
export type ContractorDetailsOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/** @internal */
interface ContractorDetailsSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: ContractorDetailsOptionalFieldsToRequire
  hasSsn?: boolean
  hasEin?: boolean
}

/** @internal */
export function createContractorDetailsSchema(options: ContractorDetailsSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, hasSsn = false, hasEin = false } = options

  const fieldsWithRedactedValues: Array<keyof typeof fieldValidators> = []
  if (hasSsn) fieldsWithRedactedValues.push('ssn')
  if (hasEin) fieldsWithRedactedValues.push('ein')

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: ContractorDetailsErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    fieldsWithRedactedValues,
    // Applicability gating: evaluated per-validation so a field's required
    // check is skipped while it doesn't apply to the current selection. The
    // field stays in the schema (validated as optional), keeping requiredness
    // static and fully promotable via `optionalFieldsToRequire`.
    excludeFields: getExcludedContractorFields,
  })
}

/** @internal */
export type ContractorDiscriminators = Partial<
  Pick<ContractorDetailsFormData, 'type' | 'wageType' | 'fileNewHireReport'>
>

/**
 * Fields that don't apply to the given contractor selection. Their required
 * check is skipped at validation time and they're never rendered. `email` is
 * never excluded — it always applies and its requiredness is governed by the
 * `selfOnboarding` predicate.
 *
 * @internal
 */
export function getExcludedContractorFields(
  values: ContractorDiscriminators,
): Array<keyof typeof fieldValidators> {
  const isIndividual = values.type === ContractorType.Individual
  const excluded: Array<keyof typeof fieldValidators> = []

  if (values.wageType !== WageType.Hourly) excluded.push('hourlyRate')

  if (isIndividual) {
    excluded.push('businessName', 'ein')
    if (!values.fileNewHireReport) excluded.push('workState')
  } else {
    excluded.push('firstName', 'lastName', 'middleInitial', 'fileNewHireReport', 'ssn', 'workState')
  }

  return excluded
}
