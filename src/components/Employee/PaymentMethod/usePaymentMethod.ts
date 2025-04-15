import type { EmployeeBankAccount } from '@gusto/embedded-api/models/components/employeebankaccount'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import * as v from 'valibot'
import { BankAccountSchema } from './BankAccount'
import { createCompoundContext } from '@/components/Base'

export const CombinedSchema = v.union([
  v.object({
    type: v.literal('Direct Deposit'),
    isSplit: v.literal(false),
    ...BankAccountSchema.entries,
  }),
  v.object({
    type: v.literal('Direct Deposit'),
    isSplit: v.literal(false),
    hasBankPayload: v.literal(false),
  }),
  v.object({
    type: v.literal('Check'),
  }),
  v.object({
    type: v.literal('Direct Deposit'),
    isSplit: v.literal(true),
    hasBankPayload: v.literal(false),
    splitBy: v.literal('Percentage'),
    splitAmount: v.pipe(
      v.record(v.string(), v.pipe(v.number(), v.maxValue(100), v.minValue(0))),
      v.check(
        input => Object.values(input).reduce((acc, curr) => acc + curr, 0) === 100,
        'Must be 100',
      ),
    ),
    priority: v.record(v.string(), v.number()),
  }),
  v.object({
    type: v.literal('Direct Deposit'),
    isSplit: v.literal(true),
    hasBankPayload: v.literal(false),
    splitBy: v.literal('Amount'),
    priority: v.pipe(
      v.record(v.string(), v.number()),
      v.check(input => {
        const arr = Object.values(input)
        return arr.filter((item, index) => arr.indexOf(item) !== index).length === 0
      }),
    ),
    splitAmount: v.record(v.string(), v.nullable(v.pipe(v.number(), v.minValue(0)))),
    remainder: v.string(),
  }),
])

export type CombinedSchemaInputs = v.InferInput<typeof CombinedSchema>
export type CombinedSchemaOutputs = v.InferOutput<typeof CombinedSchema>

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
