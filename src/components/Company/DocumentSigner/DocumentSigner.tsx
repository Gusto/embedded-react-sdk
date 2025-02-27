import { createMachine } from 'robot3'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'

import {
  documentSignerMachine,
  AssignSignatory,
  type DocumentSignerContextInterface,
} from './documentSignerStateMachine'

export interface DocumentSignerProps extends BaseComponentInterface {
  companyId: string
  signatoryId?: string
}

export const DocumentSigner = ({ companyId, signatoryId, onEvent }: DocumentSignerProps) => {
  const documentSigner = createMachine(
    'index',
    documentSignerMachine,
    (initialContext: DocumentSignerContextInterface) => ({
      ...initialContext,
      component: AssignSignatory,
      companyId,
      signatoryId,
    }),
  )
  return <Flow machine={documentSigner} onEvent={onEvent} />
}
