import { createMachine } from 'robot3'
import { useMemo } from 'react'
import {
  DocumentListContextual,
  type DocumentSignerContextInterface,
} from './documentSignerStateMachine'
import { documentSignerMachine } from './stateMachine'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface DocumentSignerProps extends BaseComponentInterface<'Employee.DocumentSigner'> {
  employeeId: string
}

export const DocumentSigner = ({ employeeId, onEvent, dictionary }: DocumentSignerProps) => {
  useComponentDictionary('Employee.DocumentSigner', dictionary)

  const documentSigner = useMemo(
    () =>
      createMachine(
        'index',
        documentSignerMachine,
        (initialContext: DocumentSignerContextInterface) => ({
          ...initialContext,
          component: DocumentListContextual,
          employeeId,
        }),
      ),
    [employeeId],
  )
  return <Flow machine={documentSigner} onEvent={onEvent} />
}
