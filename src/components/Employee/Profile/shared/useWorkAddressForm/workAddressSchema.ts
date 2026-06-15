import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

/**
 * Validation error codes emitted by the work address form schema. Map these
 * codes to localized copy in `validationMessages` when composing the hook.
 *
 * @public
 */
export const WorkAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

/**
 * Union of validation error code strings emitted by the work address form
 * schema.
 *
 * @public
 */
export type WorkAddressErrorCode =
  (typeof WorkAddressErrorCodes)[keyof typeof WorkAddressErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  locationUuid: z.string().min(1, { message: WorkAddressErrorCodes.REQUIRED }),
  effectiveDate: z.iso.date({ error: () => WorkAddressErrorCodes.REQUIRED }),
}

/**
 * Field names accepted by the work address form.
 *
 * @public
 */
export type WorkAddressField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the work address form.
 *
 * @public
 */
export type WorkAddressFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
/**
 * Shape of the validated values produced by the work address form on submit.
 *
 * @public
 */
export type WorkAddressFormOutputs = WorkAddressFormData

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

/**
 * Keys of optional work address fields that can be promoted to required via
 * the hook's `optionalFieldsToRequire` option.
 *
 * @public
 */
export type WorkAddressOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/** @internal */
interface WorkAddressSchemaOptions {
  mode?: 'create' | 'update'
  optionalFieldsToRequire?: WorkAddressOptionalFieldsToRequire
  withEffectiveDateField?: boolean
}

/** @internal */
export function createWorkAddressSchema(options: WorkAddressSchemaOptions = {}) {
  const { mode = 'create', optionalFieldsToRequire, withEffectiveDateField = true } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: WorkAddressErrorCodes.REQUIRED,
    mode,
    optionalFieldsToRequire,
    excludeFields: withEffectiveDateField ? [] : ['effectiveDate'],
  })
}
