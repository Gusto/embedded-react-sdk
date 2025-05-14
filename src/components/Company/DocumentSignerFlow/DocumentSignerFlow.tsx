import { createMachine } from 'robot3'
import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
import { useMemo } from 'react'
import { AssignSignatory, DocumentList } from './documentSignerStateMachine'
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
  const {
    data: { signatoryList },
  } = useSignatoriesListSuspense({
    companyUuid: companyId,
  })
  const signatories = signatoryList!
  const doesSignatoryExist = signatories.length > 0

  const documentSigner = useMemo(
    () =>
      createMachine(
        doesSignatoryExist ? 'documentList' : 'index',
        documentSignerMachine,
        (initialContext: DocumentSignerContextInterface) => ({
          ...initialContext,
          component: doesSignatoryExist ? DocumentList : AssignSignatory,
          companyId,
          signatoryId,
        }),
      ),
    [companyId, signatoryId, doesSignatoryExist],
  )
  return <Flow machine={documentSigner} onEvent={onEvent} />
}
