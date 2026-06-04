import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { StateTaxesCardContextual, type StateTaxesContextInterface } from './StateTaxesComponents'
import { stateTaxesStateMachine } from './stateTaxesStateMachine'
import { Flow } from '@/components/Flow/Flow'
import {
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { type EventType } from '@/shared/constants'
import { useComponentDictionary } from '@/i18n/I18n'
import { useI18n } from '@/i18n'
import type { OnEventType } from '@/components/Base/useBase'

export interface StateTaxesProps extends CommonComponentInterface<'Employee.Management.StateTaxes'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

function StateTaxesFlow({ employeeId, onEvent }: StateTaxesProps) {
  useI18n('Employee.Management.StateTaxes')

  const machine = useMemo(
    () =>
      createMachine('card', stateTaxesStateMachine, (ctx: StateTaxesContextInterface) => ({
        ...ctx,
        component: StateTaxesCardContextual,
        employeeId,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

export function StateTaxes({
  dictionary,
  FallbackComponent,
  ...props
}: StateTaxesProps & BaseComponentInterface<'Employee.Management.StateTaxes'>) {
  useComponentDictionary('Employee.Management.StateTaxes', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.StateTaxes"
      FallbackComponent={FallbackComponent}
    >
      <StateTaxesFlow {...props} />
    </BaseBoundaries>
  )
}
