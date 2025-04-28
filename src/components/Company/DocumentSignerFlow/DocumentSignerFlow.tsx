import { createMachine } from 'robot3'
import { AssignSignatory } from './documentSignerStateMachine'
import { documentSignerMachine } from './stateMachine'
import type { DocumentSignerContextInterface } from './useDocumentSignerFlow'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'

export interface DocumentSignerFlowProps extends BaseComponentInterface {
  companyId: string
  signatoryId?: string
}

export const DocumentSignerFlow = ({
  companyId,
  signatoryId,
  onEvent,
}: DocumentSignerFlowProps) => {
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
