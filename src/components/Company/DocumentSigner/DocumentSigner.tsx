import { createMachine } from 'robot3'
import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
import { useMemo } from 'react'
import { AssignSignatory, DocumentList } from './documentSignerStateMachine'
import { documentSignerMachine } from './stateMachine'
import type { DocumentSignerContextInterface } from './useDocumentSigner'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface DocumentSignerProps extends BaseComponentInterface<'Company.DocumentList'> {
  companyId: string
  signatoryId?: string
}

function DocumentSignerFlow({ companyId, signatoryId, onEvent, dictionary }: DocumentSignerProps) {
  useComponentDictionary('Company.DocumentList', dictionary)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [companyId], // Only companyId - prevents recreation when signatoryId/doesSignatoryExist change
  )
  return <Flow machine={documentSigner} onEvent={onEvent} />
}

export function DocumentSigner(props: DocumentSignerProps) {
  return (
    <BaseComponent {...props}>
      <DocumentSignerFlow {...props} />
    </BaseComponent>
  )
}
