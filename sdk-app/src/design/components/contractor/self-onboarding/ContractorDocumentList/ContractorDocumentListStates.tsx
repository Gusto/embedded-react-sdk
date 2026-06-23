import type { Document } from '@gusto/embedded-api-v-2026-02-01/models/components/document'
import { ContractorDocumentList } from './ContractorDocumentList'

export interface ContractorDocumentListDemoProps {
  documents: Document[]
}

/**
 * Renders ContractorDocumentList for state demos. Callbacks are no-ops —
 * clicking Sign or Continue does nothing in the demo.
 */
export function ContractorDocumentListDemo({ documents }: ContractorDocumentListDemoProps) {
  return (
    <ContractorDocumentList documents={documents} onRequestSign={() => {}} onContinue={() => {}} />
  )
}
