import { z } from 'zod'
import {
  buildFormSchema,
  type OptionalFieldsToRequire,
  type RequiredFieldConfig,
} from '@/partner-hook-utils/form/buildFormSchema'

/**
 * Validation error codes emitted by the bank account form schema. Map these
 * codes to localized copy in `validationMessages` when composing the hook.
 *
 * @public
 */
export const BankFormErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_ROUTING_NUMBER: 'INVALID_ROUTING_NUMBER',
  INVALID_ACCOUNT_NUMBER: 'INVALID_ACCOUNT_NUMBER',
} as const

/**
 * Union of validation error code strings emitted by the bank account form
 * schema.
 *
 * @public
 */
export type BankFormErrorCode = (typeof BankFormErrorCodes)[keyof typeof BankFormErrorCodes]

const ROUTING_NUMBER_REGEX = /^[0-9]{9}$/
const ACCOUNT_NUMBER_REGEX = /^[0-9]{1,17}$/

/**
 * Supported bank account type values: checking and savings.
 *
 * @public
 */
export const ACCOUNT_TYPES = ['Checking', 'Savings'] as const
/**
 * Union of bank account type values that the form accepts.
 *
 * @public
 */
export type AccountType = (typeof ACCOUNT_TYPES)[number]

const fieldValidators = {
  name: z.string(),
  routingNumber: z
    .string()
    .regex(ROUTING_NUMBER_REGEX, { message: BankFormErrorCodes.INVALID_ROUTING_NUMBER }),
  accountNumber: z
    .string()
    .regex(ACCOUNT_NUMBER_REGEX, { message: BankFormErrorCodes.INVALID_ACCOUNT_NUMBER }),
  accountType: z.enum(ACCOUNT_TYPES),
}

/**
 * Field names accepted by the bank account form.
 *
 * @public
 */
export type BankFormField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the bank account form.
 *
 * @public
 */
export type BankFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
/**
 * Shape of the validated values produced by the bank account form on submit.
 *
 * @public
 */
export type BankFormOutputs = BankFormData

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<typeof fieldValidators>

/**
 * Keys of optional bank account fields that can be promoted to required via
 * the hook's `optionalFieldsToRequire` option.
 *
 * @public
 */
export type BankFormOptionalFieldsToRequire = OptionalFieldsToRequire<typeof requiredFieldsConfig>

/** @internal */
interface BankFormSchemaOptions {
  optionalFieldsToRequire?: BankFormOptionalFieldsToRequire
}

/** @internal */
export function createBankFormSchema(options: BankFormSchemaOptions = {}) {
  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: BankFormErrorCodes.REQUIRED,
    mode: 'create',
    optionalFieldsToRequire: options.optionalFieldsToRequire,
  })
}
