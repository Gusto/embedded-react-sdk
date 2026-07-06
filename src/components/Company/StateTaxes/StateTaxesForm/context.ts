import type { TaxRequirementsState } from '@gusto/embedded-api/models/components/taxrequirementsstate'
import { createCompoundContext } from '@/components/Base'

interface StateTaxFormContext {
  isPending: boolean
  state: string
  stateTaxRequirements: TaxRequirementsState
  handleCancel: () => void
}

const [useStateTaxesForm, StateTaxesFormProvider] =
  createCompoundContext<StateTaxFormContext>('StateTaxesFormContext')

export { useStateTaxesForm, StateTaxesFormProvider }
