import { z } from 'zod'
import {
  buildFormSchema,
  type OptionalFieldsToRequire,
  type RequiredFieldConfig,
  type ValidatorsFor,
} from '@/partner-hook-utils/form/buildFormSchema'
import { PAYMENT_METHODS } from '@/shared/constants'

export const PaymentMethodFormErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

export type PaymentMethodFormErrorCode =
  (typeof PaymentMethodFormErrorCodes)[keyof typeof PaymentMethodFormErrorCodes]

export const PAYMENT_METHOD_TYPES = [PAYMENT_METHODS.directDeposit, PAYMENT_METHODS.check] as const

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[number]

export interface PaymentMethodFormData {
  type: PaymentMethodType
}
export type PaymentMethodFormOutputs = PaymentMethodFormData

const fieldValidators = {
  type: z.enum(PAYMENT_METHOD_TYPES),
} satisfies ValidatorsFor<PaymentMethodFormData>

export type PaymentMethodFormField = keyof PaymentMethodFormData

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<PaymentMethodFormData>

export type PaymentMethodFormOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

interface PaymentMethodFormSchemaOptions {
  optionalFieldsToRequire?: PaymentMethodFormOptionalFieldsToRequire
}

export function createPaymentMethodFormSchema(options: PaymentMethodFormSchemaOptions = {}) {
  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: PaymentMethodFormErrorCodes.REQUIRED,
    mode: 'update',
    optionalFieldsToRequire: options.optionalFieldsToRequire,
  })
}
