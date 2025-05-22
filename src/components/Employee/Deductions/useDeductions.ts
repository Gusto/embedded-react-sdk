import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { z } from 'zod'
import { createCompoundContext } from '@/components/Base'

export type MODE = 'ADD' | 'LIST' | 'INITIAL' | 'EDIT'

export const DeductionSchema = z.object({
  active: z.boolean(),
  amount: z.number().min(0).transform(String),
  description: z.string().min(1),
  courtOrdered: z.boolean(),
  times: z.number().nullable(), //The number of times to apply the garnishment. Ignored if recurring is true.
  recurring: z.string().transform(val => val === 'true'),
  annualMaximum: z
    .number()
    .min(0)
    .transform(val => (val > 0 ? val.toString() : null))
    .nullable(),
  payPeriodMaximum: z
    .number()
    .min(0)
    .transform(val => (val > 0 ? val.toString() : null))
    .nullable(),
  deductAsPercentage: z.string().transform(val => val === 'true'),
})

export type DeductionInputs = z.input<typeof DeductionSchema>
export type DeductionPayload = z.output<typeof DeductionSchema>

type DeductionsContextType = {
  isPending: boolean
  deductions: Garnishment[]
  employeeId: string
  mode: MODE
  handleAdd: () => void
  handleCancel: () => void
  handleEdit: (deduction: Garnishment) => void
  handleDelete: (deduction: Garnishment) => void
  handlePassthrough: () => void
}
const [useDeductions, DeductionsProvider] =
  createCompoundContext<DeductionsContextType>('DeductionsContext')
export { useDeductions, DeductionsProvider }
