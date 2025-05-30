import { createMachine } from 'robot3'
import {
  DocumentListContextual,
  type DocumentSignerContextInterface,
} from './documentSignerStateMachine'
import { documentSignerMachine } from './stateMachine'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface DocumentSignerFlowProps extends BaseComponentInterface<'Employee.DocumentSigner'> {
  employeeId: string
}

export const DocumentSignerFlow = ({
  employeeId,
  onEvent,
  dictionary,
}: DocumentSignerFlowProps) => {
  useComponentDictionary('Employee.DocumentSigner', dictionary)

  const documentSigner = createMachine(
    'index',
    documentSignerMachine,
    (initialContext: DocumentSignerContextInterface) => ({
      ...initialContext,
      component: DocumentListContextual,
      employeeId,
    }),
  )
  return <Flow machine={documentSigner} onEvent={onEvent} />
}
