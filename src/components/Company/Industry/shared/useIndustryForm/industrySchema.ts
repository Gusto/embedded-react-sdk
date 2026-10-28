import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

/**
 * Validation error codes emitted by the industry form schema. Map these codes
 * to localized copy in `validationMessages` when composing the hook.
 *
 * @public
 */
export const IndustryErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

/**
 * Union of validation error code strings emitted by the industry form schema.
 *
 * @public
 */
export type IndustryErrorCode = (typeof IndustryErrorCodes)[keyof typeof IndustryErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  // Deliberately no digit-length constraint. Valid NAICS codes are four to six
  // digits and the set of acceptable values is defined by the options the hook
  // supplies plus whatever classification is already on file — a client-side
  // length rule here would reject saved codes the API accepts.
  naicsCode: z.string().min(1, { message: IndustryErrorCodes.REQUIRED }),
}

/**
 * Field names accepted by the industry form.
 *
 * @public
 */
export type IndustryField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the industry form.
 *
 * @public
 * @interface
 */
export type IndustryFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
/** @internal */
export type IndustryFormOutputs = IndustryFormData

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

/**
 * Keys of optional industry fields that can be promoted to required via the
 * hook's `optionalFieldsToRequire` option.
 *
 * @public
 */
export type IndustryOptionalFieldsToRequire = OptionalFieldsToRequire<typeof requiredFieldsConfig>

/** @internal */
interface IndustrySchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: IndustryOptionalFieldsToRequire
}

/** @internal */
export function createIndustrySchema(options: IndustrySchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: IndustryErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
  })
}
