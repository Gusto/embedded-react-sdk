import {
  object,
  pipe,
  string,
  nonEmpty,
  regex,
  picklist,
  type InferNonNullableInput,
  literal,
} from 'valibot'

export const BankAccountSchema = object({
  name: pipe(string(), nonEmpty('f')),
  routingNumber: pipe(string(), regex(/^[0-9]{9}$/)),
  accountNumber: pipe(string(), regex(/^[0-9]{9,18}$/)),
  accountType: picklist(['Checking', 'Savings']),
  hasBankPayload: literal(true),
})

export type BankAccountInputs = InferNonNullableInput<typeof BankAccountSchema>
export type BankAccountDefaults = InferNonNullableInput<typeof BankAccountSchema>
