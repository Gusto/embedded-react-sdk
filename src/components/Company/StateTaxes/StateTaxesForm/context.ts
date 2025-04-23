import { createCompoundContext } from '@/components/Base'

interface StateTaxFormContext {
  isPending: boolean
  state: string
}

const [useStateTaxesForm, StateTaxesFormProvider] =
  createCompoundContext<StateTaxFormContext>('StateTaxesFormContext')

export { useStateTaxesForm, StateTaxesFormProvider }
