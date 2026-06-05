import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { DocumentsCardContextual, type DocumentsContextInterface } from './DocumentsComponents'
import { documentsStateMachine } from './documentsStateMachine'
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

export interface DocumentsProps extends CommonComponentInterface<'Employee.Management.Documents'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

function DocumentsFlow({ employeeId, onEvent }: DocumentsProps) {
  useI18n('Employee.Management.Documents')

  const machine = useMemo(
    () =>
      createMachine('card', documentsStateMachine, (ctx: DocumentsContextInterface) => ({
        ...ctx,
        component: DocumentsCardContextual,
        employeeId,
      })),
    [employeeId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}

export function Documents({
  dictionary,
  FallbackComponent,
  ...props
}: DocumentsProps & BaseComponentInterface<'Employee.Management.Documents'>) {
  useComponentDictionary('Employee.Management.Documents', dictionary)
  return (
    <BaseBoundaries
      componentName="Employee.Management.Documents"
      FallbackComponent={FallbackComponent}
    >
      <DocumentsFlow {...props} />
    </BaseBoundaries>
  )
}
