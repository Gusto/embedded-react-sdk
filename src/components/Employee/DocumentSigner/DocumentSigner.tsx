import { createMachine } from 'robot3'
import {
  DocumentListContextual,
  type DocumentSignerContextInterface,
} from './documentSignerStateMachine'
import { documentSignerMachine } from './stateMachine'
import { DocumentList } from './DocumentList/DocumentList'
import { SignatureForm } from './SignatureForm/SignatureForm'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface DocumentSignerProps extends BaseComponentInterface<'Employee.DocumentSigner'> {
  employeeId: string
}

export const DocumentSigner = ({ employeeId, onEvent, dictionary }: DocumentSignerProps) => {
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

DocumentSigner.DocumentList = DocumentList
DocumentSigner.SignatureForm = SignatureForm
