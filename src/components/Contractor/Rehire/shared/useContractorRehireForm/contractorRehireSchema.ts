import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceToISODate } from '@/partner-hook-utils/form/preprocessors'

// ── Error codes ────────────────────────────────────────────────────────

/**
 * Validation error codes emitted by the contractor rehire form schema. Map these
 * codes to localized copy in `validationMessages` when composing the hook.
 *
 * @public
 */
export const ContractorRehireErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

/**
 * Union of validation error code strings emitted by the contractor rehire form schema.
 *
 * @public
 */
export type ContractorRehireErrorCode =
  (typeof ContractorRehireErrorCodes)[keyof typeof ContractorRehireErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  startDate: z.preprocess(
    coerceToISODate,
    z.iso.date({ error: () => ContractorRehireErrorCodes.REQUIRED }),
  ),
}

/**
 * Field names accepted by the contractor rehire form.
 *
 * @public
 */
export type ContractorRehireFormField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the contractor rehire form.
 *
 * @public
 * @interface
 */
export type ContractorRehireFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

/**
 * Shape of the validated values produced by the contractor rehire form on submit.
 * Internal seam between the form's input and parsed-output types; the two coincide
 * today, and partners consume the parsed values through `form.getFormSubmissionValues`.
 *
 * @internal
 */
export type ContractorRehireFormOutputs = ContractorRehireFormData

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

/** @internal */
export function createContractorRehireSchema() {
  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: ContractorRehireErrorCodes.REQUIRED,
    mode: 'create',
  })
}
