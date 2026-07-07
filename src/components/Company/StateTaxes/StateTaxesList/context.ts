import type { TaxRequirementStatesList } from '@gusto/embedded-api/models/components/taxrequirementstateslist'
import { createCompoundContext } from '@/components/Base'

type StateTaxesListContextType = {
  isPending: boolean
  stateTaxRequirements: TaxRequirementStatesList[]
  handleContinue: () => void
  handleChange: (state: string) => void
}

const [useStateTaxesList, StateTaxesListProvider] =
  createCompoundContext<StateTaxesListContextType>('StateTaxesListContext')

export { useStateTaxesList, StateTaxesListProvider }
