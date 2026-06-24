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
// API treats as optional are `'never'`. Type/wage/self-onboarding *applicability*
// (does a field apply to this contractor at all?) is handled separately by
// `excludeFields` — see `deriveContractorApplicability` — not by requiredness.
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
  /** Fields that do not apply to the current contractor type/wage/self-onboarding selection and should be dropped from the schema entirely. */
  excludeFields?: Array<keyof typeof fieldValidators>
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
    excludeFields: options.excludeFields,
  })
}

// ── Field applicability ────────────────────────────────────────────────

/**
 * Which contractor fields apply to a given type/wage/self-onboarding selection.
 *
 * @remarks
 * `excludeFields` lists the fields that should be dropped from the schema (they
 * neither render nor validate). `email` is never excluded — it always applies
 * and its requiredness is governed by the `selfOnboarding` predicate — but its
 * visibility is gated by `showEmail`.
 *
 * @internal
 */
export interface ContractorFieldApplicability {
  isIndividual: boolean
  isBusiness: boolean
  isHourly: boolean
  showEmail: boolean
  showSsn: boolean
  showEin: boolean
  showWorkState: boolean
  showFileNewHireReport: boolean
  excludeFields: Array<keyof typeof fieldValidators>
}

/**
 * Derives field applicability (and the resulting `excludeFields`) from the
 * watched contractor discriminators. Single source of truth shared by the
 * hook's schema, its `form.Fields` visibility gating, and the schema tests.
 *
 * @internal
 */
export function deriveContractorApplicability(values: {
  type?: ContractorDetailsFormData['type']
  wageType?: ContractorDetailsFormData['wageType']
  selfOnboarding?: boolean
  fileNewHireReport?: boolean
}): ContractorFieldApplicability {
  const isIndividual = values.type === ContractorType.Individual
  const isBusiness = values.type === ContractorType.Business
  const isHourly = values.wageType === WageType.Hourly
  const selfOnboarding = Boolean(values.selfOnboarding)

  const showEmail = selfOnboarding
  const showSsn = isIndividual && !selfOnboarding
  const showEin = isBusiness && !selfOnboarding
  const showWorkState = isIndividual && Boolean(values.fileNewHireReport)
  const showFileNewHireReport = isIndividual

  const excludeFields: Array<keyof typeof fieldValidators> = []
  if (!isHourly) excludeFields.push('hourlyRate')
  if (!isIndividual) excludeFields.push('firstName', 'lastName', 'middleInitial')
  if (!showFileNewHireReport) excludeFields.push('fileNewHireReport')
  if (!isBusiness) excludeFields.push('businessName')
  if (!showSsn) excludeFields.push('ssn')
  if (!showEin) excludeFields.push('ein')
  if (!showWorkState) excludeFields.push('workState')

  return {
    isIndividual,
    isBusiness,
    isHourly,
    showEmail,
    showSsn,
    showEin,
    showWorkState,
    showFileNewHireReport,
    excludeFields,
  }
}
