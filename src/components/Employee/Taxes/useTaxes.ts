import type { EmployeeStateTax } from '@gusto/embedded-api/models/components/employeestatetax'
import { createCompoundContext } from '@/components/Base'

type TaxesContextType = {
  employeeStateTaxes: EmployeeStateTax[]
  isPending: boolean
  isAdmin: boolean
}

const [useTaxes, TaxesProvider] = createCompoundContext<TaxesContextType>('TaxesContext')
export { useTaxes, TaxesProvider }
