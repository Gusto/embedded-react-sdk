import { z } from 'zod'
import {
  buildFormSchema,
  type RequiredFieldConfig,
} from '@/partner-hook-utils/form/buildFormSchema'
import { PAYMENT_METHODS } from '@/shared/constants'

/**
 * Validation error codes emitted by the contractor payment method form schema.
 * Map these codes to localized copy in `validationMessages` when composing the
 * hook.
 *
 * @public
 */
export const ContractorPaymentMethodErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

/**
 * Union of validation error code strings emitted by the contractor payment
 * method form schema.
 *
 * @public
 */
export type ContractorPaymentMethodErrorCode =
  (typeof ContractorPaymentMethodErrorCodes)[keyof typeof ContractorPaymentMethodErrorCodes]

/**
 * Supported payment method type values: direct deposit and check.
 *
 * @public
 */
export const PAYMENT_METHOD_TYPES = [PAYMENT_METHODS.directDeposit, PAYMENT_METHODS.check] as const

/**
 * Union of payment method type values that the form accepts.
 *
 * @public
 */
export type ContractorPaymentMethodFormType = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS]

const fieldValidators = {
  type: z.enum(PAYMENT_METHOD_TYPES),
}

/**
 * Field names accepted by the contractor payment method form.
 *
 * @public
 */
export type ContractorPaymentMethodFormField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the contractor payment method form.
 *
 * @public
 * @interface
 */
export type ContractorPaymentMethodFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

/**
 * Shape of the validated values produced by the contractor payment method form
 * on submit. Internal seam between the form's input and parsed-output types; the
 * two coincide today, and partners consume the parsed values through
 * `form.getFormSubmissionValues` (typed as the form-data shape).
 *
 * @internal
 */
export type ContractorPaymentMethodFormOutputs = ContractorPaymentMethodFormData

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<typeof fieldValidators>

/** @internal */
export function createContractorPaymentMethodSchema() {
  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: ContractorPaymentMethodErrorCodes.REQUIRED,
    mode: 'update',
  })
}
