import type { DocumentSigned } from '@gusto/embedded-api-v-2025-11-15/models/components/documentsigned'
import { DocumentsList } from '../DocumentsList/DocumentsList'
import { SignatureForm } from '../SignatureForm/SignatureForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { componentEvents } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export type EventPayloads = {
  [componentEvents.CONTRACTOR_VIEW_DOCUMENT_TO_SIGN]: { uuid: string; title?: string }
  [componentEvents.CONTRACTOR_SIGN_DOCUMENT]: DocumentSigned
  [componentEvents.CONTRACTOR_DOCUMENTS_DONE]: undefined
  [componentEvents.CANCEL]: undefined
}

/** @internal */
export interface DocumentSignerContextInterface extends FlowContextInterface {
  contractorId: string
  documentUuid?: string
}

/** @internal */
export function DocumentsListContextual() {
  const { contractorId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return <DocumentsList contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}

/** @internal */
export function SignatureFormContextual() {
  const { contractorId, documentUuid, onEvent } = useFlow<DocumentSignerContextInterface>()

  return (
    <SignatureForm
      contractorId={ensureRequired(contractorId)}
      documentUuid={ensureRequired(documentUuid)}
      onEvent={onEvent}
    />
  )
}
