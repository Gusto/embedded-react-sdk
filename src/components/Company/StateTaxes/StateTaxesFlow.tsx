import { createMachine } from 'robot3'
import type { StateTaxesContextInterface } from './stateTaxesStateMachine'
import { StateTaxesListContextual, stateTaxesStateMachine } from './stateTaxesStateMachine'
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
