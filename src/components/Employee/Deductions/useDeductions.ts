import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import * as v from 'valibot'
import { createCompoundContext } from '@/components/Base'

export type MODE = 'ADD' | 'LIST' | 'INITIAL' | 'EDIT'

export const DeductionSchema = v.object({
  active: v.boolean(),
  amount: v.pipe(v.number(), v.minValue(0), v.transform(String)),
  description: v.pipe(v.string(), v.nonEmpty()),
  courtOrdered: v.boolean(),
  times: v.nullable(v.number()), //The number of times to apply the garnishment. Ignored if recurring is true.
  recurring: v.pipe(
    v.string(),
    v.transform(val => val === 'true'),
  ),
  annualMaximum: v.nullable(
    v.pipe(
      v.number(),
      v.minValue(0),
      v.transform(val => (val > 0 ? val.toString() : null)),
    ),
  ),
  payPeriodMaximum: v.nullable(
    v.pipe(
      v.number(),
      v.minValue(0),
      v.transform(val => (val > 0 ? val.toString() : null)),
    ),
  ),
  deductAsPercentage: v.pipe(
    v.string(),
    v.transform(val => val === 'true'),
  ),
})

export type DeductionInputs = v.InferInput<typeof DeductionSchema>
export type DeductionPayload = v.InferOutput<typeof DeductionSchema>

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
