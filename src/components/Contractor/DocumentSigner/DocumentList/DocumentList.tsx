import { useContractorDocumentsGetAllSuspense } from '@gusto/embedded-api/react-query/contractorDocumentsGetAll'
import type { Document } from '@gusto/embedded-api/models/components/document'
import { Head } from './Head'
import { List } from './List'
import { Actions } from './Actions'
import { DocumentListProvider } from './useDocumentList'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { Flex } from '@/components/Common'

interface DocumentListProps extends CommonComponentInterface {
  contractorId: string
}

export function DocumentList(props: DocumentListProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ contractorId, className, children }: DocumentListProps) {
  useI18n('Contractor.DocumentSigner')
  const { onEvent } = useBase()

  const { data, error: documentListError } = useContractorDocumentsGetAllSuspense({
    contractorUuid: contractorId,
  })
  const documents = data.documents ?? []

  const hasSignedAllDocuments = documents.every(doc => !doc.requiresSigning)

  const handleRequestDocumentToSign = (document: Document) => {
    onEvent(componentEvents.CONTRACTOR_VIEW_DOCUMENT_TO_SIGN, { uuid: document.uuid })
  }

  const handleContinue = () => {
    onEvent(componentEvents.CONTRACTOR_DOCUMENTS_DONE)
  }

  return (
    <section className={className}>
      <DocumentListProvider
        value={{
          documents,
          hasSignedAllDocuments,
          handleContinue,
          handleRequestDocumentToSign,
          documentListError,
        }}
      >
        {children ? (
          children
        ) : (
          <Flex flexDirection="column">
            <Head />
            <List />
            <Actions />
          </Flex>
        )}
      </DocumentListProvider>
    </section>
  )
}
