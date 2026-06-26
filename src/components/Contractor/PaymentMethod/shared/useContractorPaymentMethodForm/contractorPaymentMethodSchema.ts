import { z } from 'zod'
import {
  buildFormSchema,
  type OptionalFieldsToRequire,
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
  INVALID_ROUTING_NUMBER: 'INVALID_ROUTING_NUMBER',
  INVALID_ACCOUNT_NUMBER: 'INVALID_ACCOUNT_NUMBER',
} as const

/**
 * Union of validation error code strings emitted by the contractor payment
 * method form schema.
 *
 * @public
 */
export type ContractorPaymentMethodErrorCode =
  (typeof ContractorPaymentMethodErrorCodes)[keyof typeof ContractorPaymentMethodErrorCodes]

const ROUTING_NUMBER_REGEX = /^[0-9]{9}$/
const ACCOUNT_NUMBER_REGEX = /^[0-9]{1,17}$/

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
export type ContractorPaymentMethodFormType = (typeof PAYMENT_METHOD_TYPES)[number]

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

// Bank-account format validation lives in `superRefine` gated on `type` rather
// than on the per-field validators. The masked `hiddenAccountNumber` is used as
// the default `accountNumber` value, so the bank fields must stay permissive at
// the field level: format checks only run for Direct Deposit, and the account
// number is only re-validated when a bank field actually changed.
const fieldValidators = {
  type: z.enum(PAYMENT_METHOD_TYPES),
  name: z.string(),
  routingNumber: z.string(),
  accountNumber: z.string(),
  accountType: z.enum(ACCOUNT_TYPES),
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
 */
export type ContractorPaymentMethodFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

/**
 * Shape of the validated values produced by the contractor payment method form
 * on submit.
 *
 * @public
 */
export type ContractorPaymentMethodFormOutputs = ContractorPaymentMethodFormData

// Bank fields are required whenever they apply (i.e. whenever Direct Deposit is
// selected). Applicability is handled by the value-aware `excludeFields`
// function below, which keeps every field in the schema — and therefore
// promotable via `optionalFieldsToRequire` — while skipping its required check
// when the payment method is Check.
const requiredFieldsConfig = {
  name: 'always',
  routingNumber: 'always',
  accountNumber: 'always',
  accountType: 'always',
} satisfies RequiredFieldConfig<typeof fieldValidators>

/**
 * Keys of optional contractor payment method fields that can be promoted to
 * required via the hook's `optionalFieldsToRequire` option.
 *
 * @public
 */
export type ContractorPaymentMethodOptionalFieldsToRequire = OptionalFieldsToRequire<
  typeof requiredFieldsConfig
>

/**
 * The masked bank account the form was seeded with, used to decide whether the
 * account number needs to be re-validated. When a bank field differs from these
 * values the account number is treated as freshly entered and format-checked.
 *
 * @internal
 */
export interface ExistingBankAccountComparison {
  name?: string
  routingNumber?: string
  accountType?: string
  hiddenAccountNumber?: string
}

/**
 * Bank fields that don't apply to the current selection. They're excluded — and
 * never rendered or required — when the payment method is Check.
 *
 * @internal
 */
export function getExcludedPaymentMethodFields(
  values: Pick<ContractorPaymentMethodFormData, 'type'>,
): Array<keyof typeof fieldValidators> {
  if (values.type === PAYMENT_METHODS.check) {
    return ['name', 'routingNumber', 'accountNumber', 'accountType']
  }
  return []
}

function bankFieldsChanged(
  data: ContractorPaymentMethodFormData,
  existing?: ExistingBankAccountComparison,
): boolean {
  if (!existing) return true
  return (
    data.name !== existing.name ||
    data.routingNumber !== existing.routingNumber ||
    data.accountType !== existing.accountType ||
    data.accountNumber !== existing.hiddenAccountNumber
  )
}

/** @internal */
interface ContractorPaymentMethodSchemaOptions {
  optionalFieldsToRequire?: ContractorPaymentMethodOptionalFieldsToRequire
  existingBankAccount?: ExistingBankAccountComparison
}

/** @internal */
export function createContractorPaymentMethodSchema(
  options: ContractorPaymentMethodSchemaOptions = {},
) {
  const { optionalFieldsToRequire, existingBankAccount } = options

  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: ContractorPaymentMethodErrorCodes.REQUIRED,
    mode: 'update',
    optionalFieldsToRequire,
    excludeFields: getExcludedPaymentMethodFields,
    superRefine: (data, ctx) => {
      if (data.type !== PAYMENT_METHODS.directDeposit) return

      if (data.routingNumber && !ROUTING_NUMBER_REGEX.test(data.routingNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['routingNumber'],
          message: ContractorPaymentMethodErrorCodes.INVALID_ROUTING_NUMBER,
        })
      }

      // The masked account number is only re-validated once a bank field
      // changes, mirroring the original component: an untouched Direct Deposit
      // submit reuses the masked value without a format error.
      if (
        bankFieldsChanged(data, existingBankAccount) &&
        data.accountNumber &&
        !ACCOUNT_NUMBER_REGEX.test(data.accountNumber)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['accountNumber'],
          message: ContractorPaymentMethodErrorCodes.INVALID_ACCOUNT_NUMBER,
        })
      }
    },
  })
}
