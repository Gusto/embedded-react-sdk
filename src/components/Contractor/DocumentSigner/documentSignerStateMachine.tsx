import type { Document } from '@gusto/embedded-api/models/components/document'
import { DocumentList } from './DocumentList/DocumentList'
import { SignatureForm } from './SignatureForm/SignatureForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { componentEvents } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

export type EventPayloads = {
  [componentEvents.CONTRACTOR_SIGN_DOCUMENT]: Document
  [componentEvents.CONTRACTOR_VIEW_DOCUMENT_TO_SIGN]: { uuid: string }
  [componentEvents.CANCEL]: undefined
}

export interface DocumentSignerContextInterface extends FlowContextInterface {
  contractorId: string
  documentId?: string
}

export function DocumentListContextual() {
  const { contractorId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return <DocumentList contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}

export function SignatureFormContextual() {
  const { contractorId, documentId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return (
    <SignatureForm
      contractorId={ensureRequired(contractorId)}
      documentId={ensureRequired(documentId)}
      onEvent={onEvent}
    />
  )
}
