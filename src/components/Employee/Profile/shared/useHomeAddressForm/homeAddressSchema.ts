import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

/**
 * Validation error codes emitted by the home address form schema. Map these
 * codes to localized copy in `validationMessages` when composing the hook.
 *
 * @public
 */
export const HomeAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_ZIP: 'INVALID_ZIP',
} as const

/**
 * Union of validation error code strings emitted by the home address form
 * schema.
 *
 * @public
 */
export type HomeAddressErrorCode =
  (typeof HomeAddressErrorCodes)[keyof typeof HomeAddressErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const ZIP_REGEX = /(^\d{5}$)|(^\d{5}-\d{4}$)/

const fieldValidators = {
  street1: z.string(),
  street2: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string().regex(ZIP_REGEX, { message: HomeAddressErrorCodes.INVALID_ZIP }),
  courtesyWithholding: z.boolean(),
  effectiveDate: z.iso.date({ error: () => HomeAddressErrorCodes.REQUIRED }),
}

/**
 * Field names accepted by the home address form.
 *
 * @public
 */
export type HomeAddressField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the home address form.
 *
 * @public
 * @interface
 */
export type HomeAddressFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
/**
 * Shape of the validated values produced by the home address form on submit.
 *
 * @public
 */
export type HomeAddressFormOutputs = HomeAddressFormData

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {
  street2: 'never',
} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

/**
 * Keys of optional home address fields that can be promoted to required via
 * the hook's `optionalFieldsToRequire` option.
 *
 * @public
 */
export type HomeAddressOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/** @internal */
interface HomeAddressSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: HomeAddressOptionalFieldsToRequire
  withEffectiveDateField?: boolean
}

/** @internal */
export function createHomeAddressSchema(options: HomeAddressSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, withEffectiveDateField = true } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: HomeAddressErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    excludeFields: withEffectiveDateField ? [] : ['effectiveDate'],
  })
}
