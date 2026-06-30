import { z } from 'zod'
import {
  buildFormSchema,
  type OptionalFieldsToRequire,
  type RequiredFieldConfig,
} from '@/partner-hook-utils/form/buildFormSchema'
import { ACCOUNT_NUMBER_REGEX, ROUTING_NUMBER_REGEX } from '@/helpers/validations'

/**
 * Validation error codes emitted by the contractor bank account form schema.
 * Map these codes to localized copy in `validationMessages` when composing the
 * hook.
 *
 * @public
 */
export const ContractorBankAccountErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_ROUTING_NUMBER: 'INVALID_ROUTING_NUMBER',
  INVALID_ACCOUNT_NUMBER: 'INVALID_ACCOUNT_NUMBER',
} as const

/**
 * Union of validation error code strings emitted by the contractor bank account
 * form schema.
 *
 * @public
 */
export type ContractorBankAccountErrorCode =
  (typeof ContractorBankAccountErrorCodes)[keyof typeof ContractorBankAccountErrorCodes]

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
export type ContractorAccountType = (typeof ACCOUNT_TYPES)[number]

const fieldValidators = {
  name: z.string(),
  routingNumber: z.string().regex(ROUTING_NUMBER_REGEX, {
    message: ContractorBankAccountErrorCodes.INVALID_ROUTING_NUMBER,
  }),
  accountNumber: z.string().regex(ACCOUNT_NUMBER_REGEX, {
    message: ContractorBankAccountErrorCodes.INVALID_ACCOUNT_NUMBER,
  }),
  accountType: z.enum(ACCOUNT_TYPES),
}

/**
 * Field names accepted by the contractor bank account form.
 *
 * @public
 */
export type ContractorBankAccountFormField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the contractor bank account form.
 *
 * @public
 * @interface
 */
export type ContractorBankAccountFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

/**
 * Shape of the validated values produced by the contractor bank account form on
 * submit. Internal seam between the form's input and parsed-output types; the
 * two coincide today, and partners consume the parsed values through
 * `form.getFormSubmissionValues` (typed as the form-data shape).
 *
 * @internal
 */
export type ContractorBankAccountFormOutputs = ContractorBankAccountFormData

const requiredFieldsConfig = {
  name: 'always',
  routingNumber: 'always',
  accountNumber: 'always',
  accountType: 'always',
} satisfies RequiredFieldConfig<typeof fieldValidators>

/**
 * Keys of optional contractor bank account fields that can be promoted to
 * required via the hook's `optionalFieldsToRequire` option.
 *
 * @public
 */
export type ContractorBankAccountOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/** @internal */
interface ContractorBankAccountSchemaOptions {
  optionalFieldsToRequire?: ContractorBankAccountOptionalFieldsToRequire
  /**
   * The contractor's current masked account number (e.g. `"XXXX1207"`), if one
   * is on file. The bank account API requires `account_number` on every write
   * and treats this exact masked token as "keep the existing account number,"
   * so the field is pre-filled with it and validation accepts it unchanged. Any
   * other value must be a real 1–17 digit account number.
   */
  existingAccountNumberMask?: string
}

/** @internal */
export function createContractorBankAccountSchema(
  options: ContractorBankAccountSchemaOptions = {},
) {
  const { optionalFieldsToRequire, existingAccountNumberMask } = options

  const accountNumber = existingAccountNumberMask
    ? z
        .string()
        .refine(value => value === existingAccountNumberMask || ACCOUNT_NUMBER_REGEX.test(value), {
          message: ContractorBankAccountErrorCodes.INVALID_ACCOUNT_NUMBER,
        })
    : fieldValidators.accountNumber

  return buildFormSchema(
    { ...fieldValidators, accountNumber },
    {
      requiredFieldsConfig,
      requiredErrorCode: ContractorBankAccountErrorCodes.REQUIRED,
      mode: 'create',
      optionalFieldsToRequire,
    },
  )
}
