import type { Form } from '@gusto/embedded-api/models/components/form'
import type { Signatory } from '@gusto/embedded-api/models/components/signatory'
import { AssignSignatory as BlockAssignSignatory } from '../AssignSignatory'
import { DocumentList as BlockDocumentList } from './DocumentList'
import { SignatureForm as BlockSignatureForm } from './SignatureForm'
import type { DocumentSignerContextInterface } from './useDocumentSigner'
import type { companyEvents } from '@/shared/constants'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export type EventPayloads = {
  [companyEvents.COMPANY_VIEW_FORM_TO_SIGN]: Form
  [companyEvents.COMPANY_SIGNATORY_CREATED]: Signatory
  [companyEvents.COMPANY_SIGNATORY_UPDATED]: Signatory
}

/** @internal */
export function AssignSignatory() {
  const { companyId, signatoryId, onEvent } = useFlow<DocumentSignerContextInterface>()
  return (
    <BlockAssignSignatory
      companyId={ensureRequired(companyId)}
      signatoryId={signatoryId}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function DocumentList() {
  const { companyId, signatoryId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return (
    <BlockDocumentList
      companyId={ensureRequired(companyId)}
      signatoryId={signatoryId}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function SignatureForm() {
  const { companyId, formId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return (
    <BlockSignatureForm
      companyId={ensureRequired(companyId)}
      formId={ensureRequired(formId)}
      onEvent={onEvent}
    />
  )
}
