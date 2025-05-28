import { z } from 'zod'
import { accountNumberValidation, routingNumberValidation } from '@/helpers/validations'

export const BankAccountSchema = z.object({
  name: z.string().min(1),
  routingNumber: routingNumberValidation,
  accountNumber: accountNumberValidation,
  accountType: z.enum(['Checking', 'Savings']),
  hasBankPayload: z.literal(true),
})

export type BankAccountInputs = z.input<typeof BankAccountSchema>
export type BankAccountDefaults = z.input<typeof BankAccountSchema>
