import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
  type OptionalFieldsToRequire,
} from '@/partner-hook-utils/form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

/**
 * Validation error codes emitted by the sign-company-form schema. Map these
 * codes to localized copy in `validationMessages` when composing the hook.
 *
 * @public
 */
export const SignCompanyFormErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

/**
 * Union of validation error code strings emitted by the sign-company-form
 * schema.
 *
 * @public
 */
export type SignCompanyFormErrorCode =
  (typeof SignCompanyFormErrorCodes)[keyof typeof SignCompanyFormErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  signature: z.string().min(1, { message: SignCompanyFormErrorCodes.REQUIRED }),
  confirmSignature: z.boolean().refine(val => val, {
    message: SignCompanyFormErrorCodes.REQUIRED,
  }),
}

/**
 * Field names accepted by the sign-company form.
 *
 * @public
 */
export type SignCompanyFormField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the sign-company form.
 *
 * @public
 */
export type SignCompanyFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
/**
 * Shape of the validated values produced by the sign-company form on submit.
 *
 * @public
 */
export type SignCompanyFormOutputs = SignCompanyFormData

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

/**
 * Optional fields that may be promoted to required for the sign-company form.
 *
 * @remarks
 * Both fields of this form are already required by default, so passing this
 * is typically unnecessary.
 *
 * @public
 */
export type SignCompanyFormOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

interface SignCompanyFormSchemaOptions {
  optionalFieldsToRequire?: SignCompanyFormOptionalFieldsToRequire
}

/** @internal */
export function createSignCompanyFormSchema(options: SignCompanyFormSchemaOptions = {}) {
  const { optionalFieldsToRequire } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: SignCompanyFormErrorCodes.REQUIRED,
    mode: 'create',
    optionalFieldsToRequire,
  })
}
