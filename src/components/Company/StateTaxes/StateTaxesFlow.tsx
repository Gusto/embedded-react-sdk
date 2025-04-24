import { createMachine } from 'robot3'
import { stateTaxesStateMachine } from './stateTaxesStateMachine'
import type { StateTaxesContextInterface } from './StateTaxesFlowComponents'
import { StateTaxesListContextual } from './StateTaxesFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'

export interface StateTaxesFlowProps extends BaseComponentInterface {
  companyId: string
}

export function StateTaxesFlow({ companyId, onEvent }: StateTaxesFlowProps) {
  const manageStateTaxes = createMachine(
    'viewStateTaxes',
    stateTaxesStateMachine,
    (initialContext: StateTaxesContextInterface) => ({
      ...initialContext,
      component: StateTaxesListContextual,
      companyId,
    }),
  )
  return <Flow machine={manageStateTaxes} onEvent={onEvent} />
}
