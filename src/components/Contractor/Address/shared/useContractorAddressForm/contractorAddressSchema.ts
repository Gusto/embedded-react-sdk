import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

/**
 * Validation error codes emitted by the contractor address form schema. Map
 * these codes to localized copy in `validationMessages` when composing the
 * hook.
 *
 * @public
 */
export const ContractorAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_ZIP: 'INVALID_ZIP',
} as const

/**
 * Union of validation error code strings emitted by the contractor address
 * form schema.
 *
 * @public
 */
export type ContractorAddressErrorCode =
  (typeof ContractorAddressErrorCodes)[keyof typeof ContractorAddressErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const ZIP_REGEX = /(^\d{5}$)|(^\d{5}-\d{4}$)/

const fieldValidators = {
  street1: z.string(),
  street2: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string().regex(ZIP_REGEX, { message: ContractorAddressErrorCodes.INVALID_ZIP }),
}

/**
 * Field names accepted by the contractor address form.
 *
 * @public
 */
export type ContractorAddressField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the contractor address form.
 *
 * @public
 * @interface
 */
export type ContractorAddressFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
/** @internal */
export type ContractorAddressFormOutputs = ContractorAddressFormData

// ── Required fields config ─────────────────────────────────────────────

// The contractor address API treats every address field as optional — only
// `version` is required, and that is not a form field. The hook mirrors that
// contract so partners get API-aligned defaults; consumers that need stricter
// requiredness (e.g. the SDK's own Address component) opt in via
// `optionalFieldsToRequire`.
const requiredFieldsConfig = {
  street1: 'never',
  street2: 'never',
  city: 'never',
  state: 'never',
  zip: 'never',
} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

/**
 * Keys of optional contractor address fields that can be promoted to required
 * via the hook's `optionalFieldsToRequire` option.
 *
 * @public
 */
export type ContractorAddressOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/** @internal */
interface ContractorAddressSchemaOptions {
  optionalFieldsToRequire?: ContractorAddressOptionalFieldsToRequire
}

/** @internal */
export function createContractorAddressSchema(options: ContractorAddressSchemaOptions = {}) {
  const { optionalFieldsToRequire } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: ContractorAddressErrorCodes.REQUIRED,
    mode: 'update',
    optionalFieldsToRequire,
  })
}
