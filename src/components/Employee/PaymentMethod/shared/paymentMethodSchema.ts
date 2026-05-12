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

export const CombinedSchema = z.union([
  BankAccountSchema.extend({
    type: z.literal('Direct Deposit'),
    isSplit: z.literal(false),
  }),
  z.object({
    type: z.literal('Direct Deposit'),
    isSplit: z.literal(false),
    hasBankPayload: z.literal(false),
  }),
  z.object({
    type: z.literal('Check'),
  }),
  z.discriminatedUnion('splitBy', [
    z.object({
      type: z.literal('Direct Deposit'),
      isSplit: z.literal(true),
      hasBankPayload: z.literal(false),
      splitBy: z.literal('Percentage'),
      splitAmount: z
        .record(z.string(), z.number().int().max(100).min(0))
        .superRefine((input, ctx) => {
          const total = Object.values(input).reduce((acc, curr) => acc + curr, 0)
          if (total !== 100) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `percentage_split_total_error:${total}`,
            })
          }
        }),
      priority: z.record(z.string(), z.number()),
    }),
    z.object({
      type: z.literal('Direct Deposit'),
      isSplit: z.literal(true),
      hasBankPayload: z.literal(false),
      splitBy: z.literal('Amount'),
      priority: z.record(z.string(), z.number()).refine(input => {
        const arr = Object.values(input)
        return arr.filter((item, index) => arr.indexOf(item) !== index).length === 0
      }),
      splitAmount: z.record(z.string(), z.number().min(0).nullable()),
      remainder: z.string(),
    }),
  ]),
])

export type CombinedSchemaInputs = z.input<typeof CombinedSchema>
export type CombinedSchemaOutputs = z.output<typeof CombinedSchema>
