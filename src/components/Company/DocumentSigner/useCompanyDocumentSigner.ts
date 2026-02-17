import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
import { AssignSignatory, DocumentList } from './documentSignerStateMachine'
import { documentSignerMachine } from './stateMachine'
import type { DocumentSignerContextInterface } from './useDocumentSigner'

interface UseCompanyDocumentSignerProps {
  companyId: string
  signatoryId?: string
}

export function useCompanyDocumentSigner({
  companyId,
  signatoryId,
}: UseCompanyDocumentSignerProps) {
  const {
    data: { signatoryList },
  } = useSignatoriesListSuspense({
    companyUuid: companyId,
  })
  const signatories = signatoryList!
  const doesSignatoryExist = signatories.length > 0

  const machine = useMemo(
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

    [companyId], // Only companyId - prevents recreation when signatoryId/doesSignatoryExist change
  )

  return {
    data: {
      signatories,
      doesSignatoryExist,
    },
    actions: {},
    meta: {
      machine,
    },
  }
}
