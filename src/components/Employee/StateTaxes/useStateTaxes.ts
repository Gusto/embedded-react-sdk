import { z } from 'zod'
import type { EmployeeStateTaxesList } from '@gusto/embedded-api/models/components/employeestatetaxeslist'
import { createCompoundContext } from '@/components/Base'

export const StateTaxFormSchema = z.object({
  states: z.record(z.string(), z.record(z.string(), z.unknown())).optional(),
})

export type StateTaxFormInputs = z.input<typeof StateTaxFormSchema>
export type StateTaxFormPayload = z.output<typeof StateTaxFormSchema>

type StateTaxesContextType = {
  employeeStateTaxes: EmployeeStateTaxesList[]
  isPending: boolean
  isAdmin?: boolean
}

const [useStateTaxes, StateTaxesProvider] =
  createCompoundContext<StateTaxesContextType>('StateTaxes')

export { useStateTaxes, StateTaxesProvider }
