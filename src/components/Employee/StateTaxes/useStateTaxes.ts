import type { EmployeeStateTaxesList } from '@gusto/embedded-api/models/components/employeestatetaxeslist'
import { createCompoundContext } from '@/components/Base'

type StateTaxesContextType = {
  employeeStateTaxes: EmployeeStateTaxesList[]
  isPending: boolean
  isAdmin: boolean
}

const [useStateTaxes, StateTaxesProvider] =
  createCompoundContext<StateTaxesContextType>('StateTaxesContext')
export { useStateTaxes, StateTaxesProvider }
