import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { DeductionsCardContextual, type DeductionsContextInterface } from './DeductionsComponents'
import { deductionsStateMachine } from './deductionsStateMachine'
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

export interface DeductionsProps extends CommonComponentInterface<'Employee.Management.Deductions'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

function DeductionsFlow({ employeeId, onEvent }: DeductionsProps) {
  useI18n('Employee.Management.Deductions')

  const machine = useMemo(
    () =>
      createMachine('card', deductionsStateMachine, (ctx: DeductionsContextInterface) => ({
        ...ctx,
        component: DeductionsCardContextual,
        employeeId,
        successAlert: null,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

export function Deductions({
  dictionary,
  FallbackComponent,
  ...props
}: DeductionsProps & BaseComponentInterface<'Employee.Management.Deductions'>) {
  useComponentDictionary('Employee.Management.Deductions', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.Deductions"
      FallbackComponent={FallbackComponent}
    >
      <DeductionsFlow {...props} />
    </BaseBoundaries>
  )
}
