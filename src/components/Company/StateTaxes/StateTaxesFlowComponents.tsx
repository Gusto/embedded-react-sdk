import { StateTaxesList } from './StateTaxesList/StateTaxesList'
import { StateTaxesForm } from './StateTaxesForm/StateTaxesForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface StateTaxesContextInterface extends FlowContextInterface {
  companyId: string
  state?: string
  component: React.ComponentType | null
}

export function StateTaxesListContextual() {
  const { companyId, onEvent } = useFlow<StateTaxesContextInterface>()
  return <StateTaxesList onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function StateTaxesFormContextual() {
  const { companyId, state, onEvent } = useFlow<StateTaxesContextInterface>()
  return (
    <StateTaxesForm
      companyId={ensureRequired(companyId)}
      state={ensureRequired(state)}
      onEvent={onEvent}
    />
  )
}
