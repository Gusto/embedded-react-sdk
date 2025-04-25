import { StateTaxesList } from './StateTaxesList/StateTaxesList'
import { StateTaxesForm } from './StateTaxesForm/StateTaxesForm'
import type { UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import { useFlowParams } from '@/components/Flow/hooks/useFlowParams'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

export interface StateTaxesContextInterface extends FlowContextInterface {
  companyId: string
  state?: string
  component: React.ComponentType | null
}

function useStateTaxesFlowParams(props: UseFlowParamsProps<StateTaxesContextInterface>) {
  return useFlowParams(props)
}

export function StateTaxesListContextual() {
  const { companyId, onEvent } = useStateTaxesFlowParams({
    component: 'StateTaxesList',
    requiredParams: ['companyId'],
  })
  return <StateTaxesList onEvent={onEvent} companyId={companyId} />
}

export function StateTaxesFormContextual() {
  const { companyId, state, onEvent } = useStateTaxesFlowParams({
    component: 'StateTaxesForm',
    requiredParams: ['companyId', 'state'],
  })
  return <StateTaxesForm companyId={companyId} state={state} onEvent={onEvent} />
}
