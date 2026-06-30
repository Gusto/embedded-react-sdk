import { z } from 'zod'
import {
  buildFormSchema,
  type OptionalFieldsToRequire,
  type RequiredFieldConfig,
} from '@/partner-hook-utils/form/buildFormSchema'
import { PAYMENT_METHODS } from '@/shared/constants'

/**
 * Validation error codes emitted by the payment method form schema. Map these
 * codes to localized copy in `validationMessages` when composing the hook.
 *
 * @public
 */
export const PaymentMethodFormErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

/**
 * Union of validation error code strings emitted by the payment method form
 * schema.
 *
 * @public
 */
export type PaymentMethodFormErrorCode =
  (typeof PaymentMethodFormErrorCodes)[keyof typeof PaymentMethodFormErrorCodes]

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
export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number]

const fieldValidators = {
  type: z.enum(PAYMENT_METHOD_TYPES),
}

/**
 * Field names accepted by the payment method form.
 *
 * @public
 */
export type PaymentMethodFormField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the payment method form.
 *
 * @public
 * @interface
 */
export type PaymentMethodFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
/**
 * Shape of the validated values produced by the payment method form on submit.
 *
 * @public
 */
export type PaymentMethodFormOutputs = PaymentMethodFormData

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<typeof fieldValidators>

/**
 * Keys of optional payment method fields that can be promoted to required via
 * the hook's `optionalFieldsToRequire` option.
 *
 * @public
 */
export type PaymentMethodFormOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/** @internal */
interface PaymentMethodFormSchemaOptions {
  optionalFieldsToRequire?: PaymentMethodFormOptionalFieldsToRequire
}

/** @internal */
export function createPaymentMethodFormSchema(options: PaymentMethodFormSchemaOptions = {}) {
  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: PaymentMethodFormErrorCodes.REQUIRED,
    mode: 'update',
    optionalFieldsToRequire: options.optionalFieldsToRequire,
  })
}
