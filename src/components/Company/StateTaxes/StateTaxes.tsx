import { createMachine } from 'robot3'
import { stateTaxesStateMachine } from './stateTaxesStateMachine'
import type { StateTaxesContextInterface } from './StateTaxesComponents'
import { StateTaxesListContextual } from './StateTaxesComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface StateTaxesProps extends BaseComponentInterface<'Company.StateTaxes'> {
  companyId: string
}

export function StateTaxes({ companyId, onEvent, dictionary }: StateTaxesProps) {
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
