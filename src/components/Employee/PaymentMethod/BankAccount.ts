import {
  object,
  pipe,
  string,
  nonEmpty,
  picklist,
  type InferNonNullableInput,
  literal,
} from 'valibot'
import { accountNumberValidation, routingNumberValidation } from '@/helpers/validations'

export const BankAccountSchema = object({
  name: pipe(string(), nonEmpty('f')),
  routingNumber: routingNumberValidation,
  accountNumber: accountNumberValidation,
  accountType: picklist(['Checking', 'Savings']),
  hasBankPayload: literal(true),
})

export type BankAccountInputs = InferNonNullableInput<typeof BankAccountSchema>
export type BankAccountDefaults = InferNonNullableInput<typeof BankAccountSchema>
