import { createMachine } from 'robot3'
import { stateTaxesStateMachine } from './stateTaxesStateMachine'
import type { StateTaxesContextInterface } from './StateTaxesComponents'
import { StateTaxesListContextual } from './StateTaxesComponents'
import { StateTaxesList } from './StateTaxesList/StateTaxesList'
import { StateTaxesForm } from './StateTaxesForm/StateTaxesForm'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'

export interface StateTaxesProps extends BaseComponentInterface {
  companyId: string
}

export function StateTaxes({ companyId, onEvent }: StateTaxesProps) {
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

StateTaxes.StateTaxesList = StateTaxesList
StateTaxes.StateTaxesForm = StateTaxesForm
