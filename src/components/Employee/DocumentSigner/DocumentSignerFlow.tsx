import { createMachine } from 'robot3'
import {
  DocumentListContextual,
  documentSignerMachine,
  type DocumentSignerContextInterface,
} from './documentSignerStateMachine'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'

export interface DocumentSignerFlowProps extends BaseComponentInterface {
  employeeId: string
}

export const DocumentSignerFlow = ({ employeeId, onEvent }: DocumentSignerFlowProps) => {
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
