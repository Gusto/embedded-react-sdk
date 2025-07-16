import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { stateTaxesStateMachine } from './stateTaxesStateMachine'
import type { StateTaxesContextInterface } from './StateTaxesComponents'
import { StateTaxesListContextual } from './StateTaxesComponents'
import { StateTaxesList } from './StateTaxesList/StateTaxesList'
import { StateTaxesForm } from './StateTaxesForm/StateTaxesForm'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface StateTaxesProps extends BaseComponentInterface<'Company.StateTaxes'> {
  companyId: string
}

export function StateTaxes({ companyId, onEvent, dictionary }: StateTaxesProps) {
  useComponentDictionary('Company.StateTaxes', dictionary)

  const manageStateTaxes = useMemo(
    () =>
      createMachine(
        'viewStateTaxes',
        stateTaxesStateMachine,
        (initialContext: StateTaxesContextInterface) => ({
          ...initialContext,
          component: StateTaxesListContextual,
          companyId,
        }),
      ),
    [companyId],
  )

  return <Flow machine={manageStateTaxes} onEvent={onEvent} />
}

StateTaxes.StateTaxesList = StateTaxesList
StateTaxes.StateTaxesForm = StateTaxesForm
