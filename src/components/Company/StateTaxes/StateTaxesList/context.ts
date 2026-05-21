import type { TaxRequirementStatesList } from '@gusto/embedded-api-v-2025-11-15/models/components/taxrequirementstateslist'
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
