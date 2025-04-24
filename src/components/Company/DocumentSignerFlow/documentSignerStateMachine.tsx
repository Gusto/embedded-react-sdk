import type { Form } from '@gusto/embedded-api/models/components/form'
import type { Signatory } from '@gusto/embedded-api/models/components/signatory'
import { AssignSignatory as BlockAssignSignatory } from '../AssignSignatory'
import { DocumentList as BlockDocumentList } from './DocumentList'
import { SignatureForm as BlockSignatureForm } from './SignatureForm'
import { useDocumentSignerFlowParams } from './useDocumentSignerFlow'
import type { companyEvents } from '@/shared/constants'

export type EventPayloads = {
  [companyEvents.COMPANY_VIEW_FORM_TO_SIGN]: Form
  [companyEvents.COMPANY_SIGNATORY_CREATED]: Signatory
  [companyEvents.COMPANY_SIGNATORY_UPDATED]: Signatory
}

export function AssignSignatory() {
  const { companyId, signatoryId, onEvent } = useDocumentSignerFlowParams({
    component: 'AssignSignatory',
    requiredParams: ['companyId'],
  })
  return <BlockAssignSignatory companyId={companyId} signatoryId={signatoryId} onEvent={onEvent} />
}

export function DocumentList() {
  const { companyId, signatoryId, onEvent } = useDocumentSignerFlowParams({
    component: 'DocumentList',
    requiredParams: ['companyId'],
  })

  return <BlockDocumentList companyId={companyId} signatoryId={signatoryId} onEvent={onEvent} />
}

export function SignatureForm() {
  const { companyId, formId, onEvent } = useDocumentSignerFlowParams({
    component: 'SignatureForm',
    requiredParams: ['companyId', 'formId'],
  })

  return <BlockSignatureForm companyId={companyId} formId={formId} onEvent={onEvent} />
}
