import { createMachine } from 'robot3'
import { stateTaxesStateMachine } from './stateTaxesStateMachine'
import type { StateTaxesContextInterface } from './StateTaxesFlowComponents'
import { StateTaxesListContextual } from './StateTaxesFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface StateTaxesFlowProps extends BaseComponentInterface<'Company.StateTaxes'> {
  companyId: string
}

export function StateTaxesFlow({ companyId, onEvent, dictionary }: StateTaxesFlowProps) {
  useComponentDictionary('Company.StateTaxes', dictionary)
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
