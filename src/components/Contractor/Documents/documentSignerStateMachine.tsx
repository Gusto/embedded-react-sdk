import type { DocumentSigned } from '@gusto/embedded-api-v-2025-11-15/models/components/documentsigned'
import { DocumentsList } from './DocumentsList'
import { SignatureForm } from './SignatureForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { contractorEvents, componentEvents } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export type EventPayloads = {
  [contractorEvents.CONTRACTOR_VIEW_DOCUMENT_TO_SIGN]: { uuid: string; title?: string }
  [contractorEvents.CONTRACTOR_SIGN_DOCUMENT]: DocumentSigned
  [contractorEvents.CONTRACTOR_DOCUMENTS_DONE]: undefined
  [componentEvents.CANCEL]: undefined
}

/** @internal */
export interface ContractorDocumentSignerContextInterface extends FlowContextInterface {
  contractorId: string
  documentUuid?: string
}

/** @internal */
export function DocumentsListContextual() {
  const { contractorId, onEvent } = useFlow<ContractorDocumentSignerContextInterface>()

  return <DocumentsList contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}

/** @internal */
export function SignatureFormContextual() {
  const { contractorId, documentUuid, onEvent } =
    useFlow<ContractorDocumentSignerContextInterface>()

  return (
    <SignatureForm
      contractorId={ensureRequired(contractorId)}
      documentUuid={ensureRequired(documentUuid)}
      onEvent={onEvent}
    />
  )
}
