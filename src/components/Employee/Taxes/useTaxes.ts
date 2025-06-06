import type { EmployeeStateTaxesList } from '@gusto/embedded-api/models/components/employeestatetaxeslist'
import { createCompoundContext } from '@/components/Base'

type TaxesContextType = {
  employeeStateTaxes: EmployeeStateTaxesList[]
  isPending: boolean
  isAdmin: boolean
}

const [useTaxes, TaxesProvider] = createCompoundContext<TaxesContextType>('TaxesContext')
export { useTaxes, TaxesProvider }
