import { z } from 'zod'
import {
  buildFormSchema,
  type OptionalFieldsToRequire,
  type RequiredFieldConfig,
  type ValidatorsFor,
} from '@/partner-hook-utils/form/buildFormSchema'

export const BankFormErrorCodes = {
  REQUIRED: 'REQUIRED',
  INVALID_ROUTING_NUMBER: 'INVALID_ROUTING_NUMBER',
  INVALID_ACCOUNT_NUMBER: 'INVALID_ACCOUNT_NUMBER',
} as const

export type BankFormErrorCode = (typeof BankFormErrorCodes)[keyof typeof BankFormErrorCodes]

const ROUTING_NUMBER_REGEX = /^[0-9]{9}$/
const ACCOUNT_NUMBER_REGEX = /^[0-9]{1,17}$/

export const ACCOUNT_TYPES = ['Checking', 'Savings'] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

export interface BankFormData {
  name: string
  routingNumber: string
  accountNumber: string
  accountType: AccountType
}
export type BankFormOutputs = BankFormData
export type BankFormField = keyof BankFormData

const fieldValidators = {
  name: z.string(),
  routingNumber: z
    .string()
    .regex(ROUTING_NUMBER_REGEX, { message: BankFormErrorCodes.INVALID_ROUTING_NUMBER }),
  accountNumber: z
    .string()
    .regex(ACCOUNT_NUMBER_REGEX, { message: BankFormErrorCodes.INVALID_ACCOUNT_NUMBER }),
  accountType: z.enum(ACCOUNT_TYPES),
} satisfies ValidatorsFor<BankFormData>

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<BankFormData>

export type BankFormOptionalFieldsToRequire = OptionalFieldsToRequire<typeof requiredFieldsConfig>

interface BankFormSchemaOptions {
  optionalFieldsToRequire?: BankFormOptionalFieldsToRequire
}

export function createBankFormSchema(options: BankFormSchemaOptions = {}) {
  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: BankFormErrorCodes.REQUIRED,
    mode: 'create',
    optionalFieldsToRequire: options.optionalFieldsToRequire,
  })
}
