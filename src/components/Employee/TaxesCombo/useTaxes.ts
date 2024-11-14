import { createCompoundContext } from '@/components/Base/createCompoundContext'
import { Schemas } from '@/types'

export type TaxesContextType = {
  employeeStateTaxes: Schemas['Employee-State-Tax'][]
  isPending: boolean
  handleCancel: () => void
}

export const [useTaxes, TaxesProvider] = createCompoundContext<TaxesContextType>('TaxesContext')
