import type { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import { z } from 'zod'
import { BankAccountSchema } from './BankAccount'
import { createCompoundContext } from '@/components/Base'

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
      splitAmount: z.record(z.string(), z.number().max(100).min(0)).refine(
        input => Object.values(input).reduce((acc, curr) => acc + curr, 0) === 100,
        input => {
          const total = Object.values(input).reduce((acc, curr) => acc + curr, 0)
          return {
            message: `percentage_split_total_error:${total}`,
          }
        },
      ),
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

type PaymentMethodContextType = {
  bankAccounts: EmployeeBankAccount[]
  isPending: boolean
  watchedType?: string
  mode: MODE
  paymentMethod: EmployeePaymentMethod
  handleAdd: () => void
  handleSplit: () => void
  handleCancel: () => void
  handleDelete: (uuid: string) => void
}

export type MODE = 'ADD' | 'LIST' | 'SPLIT' | 'INITIAL'

const [usePaymentMethod, PaymentMethodProvider] =
  createCompoundContext<PaymentMethodContextType>('PaymentMethodContext')
export { usePaymentMethod, PaymentMethodProvider }
