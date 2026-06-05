import { createMachine } from 'robot3'
import { useMemo } from 'react'
import {
  CompensationCardContextual,
  type CompensationContextInterface,
} from './CompensationComponents'
import { compensationStateMachine } from './compensationStateMachine'
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

export interface CompensationProps extends CommonComponentInterface<'Employee.Management.Compensation'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

function CompensationFlow({ employeeId, onEvent }: CompensationProps) {
  useI18n('Employee.Management.Compensation')

  const machine = useMemo(
    () =>
      createMachine('card', compensationStateMachine, (ctx: CompensationContextInterface) => ({
        ...ctx,
        component: CompensationCardContextual,
        employeeId,
        successAlert: null,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

export function Compensation({
  dictionary,
  FallbackComponent,
  ...props
}: CompensationProps & BaseComponentInterface<'Employee.Management.Compensation'>) {
  useComponentDictionary('Employee.Management.Compensation', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.Compensation"
      FallbackComponent={FallbackComponent}
    >
      <CompensationFlow {...props} />
    </BaseBoundaries>
  )
}
