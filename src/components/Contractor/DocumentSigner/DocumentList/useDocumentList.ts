import type { Document } from '@gusto/embedded-api/models/components/document'
import { createCompoundContext } from '@/components/Base'

type DocumentListContextType = {
  documents: Document[]
  hasSignedAllDocuments: boolean
  handleContinue: () => void
  handleRequestDocumentToSign: (document: Document) => void
  documentListError: Error | null
}

const [useDocumentList, DocumentListProvider] = createCompoundContext<DocumentListContextType>(
  'ContractorDocumentListContext',
)
export { useDocumentList, DocumentListProvider }
