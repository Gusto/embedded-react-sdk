import { type Form } from '@gusto/embedded-api/models/components/form'
import { DocumentList } from './DocumentList/DocumentList'
import { SignatureForm } from './SignatureForm/SignatureForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { componentEvents } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

export type EventPayloads = {
  [componentEvents.EMPLOYEE_SIGN_FORM]: Form
  [componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN]: { uuid: string }
  [componentEvents.CANCEL]: undefined
}

export interface DocumentSignerContextInterface extends FlowContextInterface {
  employeeId: string
  formId?: string
}

export function DocumentListContextual() {
  const { employeeId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return <DocumentList employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function SignatureFormContextual() {
  const { employeeId, formId, onEvent } = useFlow<DocumentSignerContextInterface>()

  return (
    <SignatureForm
      employeeId={ensureRequired(employeeId)}
      formId={ensureRequired(formId)}
      onEvent={onEvent}
    />
  )
}
