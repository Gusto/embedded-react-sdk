import { type Form } from '@gusto/embedded-api/models/components/form'
import { DocumentList } from './DocumentList/DocumentList'
import { SignatureForm } from './SignatureForm/SignatureForm'
import { useFlowParams, type UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { componentEvents } from '@/shared/constants'

export type EventPayloads = {
  [componentEvents.EMPLOYEE_SIGN_FORM]: Form
  [componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN]: { uuid: string }
  [componentEvents.CANCEL]: undefined
}

export interface DocumentSignerContextInterface extends FlowContextInterface {
  employeeId: string
  formId?: string
}

function useDocumentSignerFlowParams(props: UseFlowParamsProps<DocumentSignerContextInterface>) {
  return useFlowParams(props)
}

export function DocumentListContextual() {
  const { employeeId, onEvent } = useDocumentSignerFlowParams({
    component: 'DocumentList',
    requiredParams: ['employeeId'],
  })

  return <DocumentList employeeId={employeeId} onEvent={onEvent} />
}

export function SignatureFormContextual() {
  const { employeeId, formId, onEvent } = useDocumentSignerFlowParams({
    component: 'SignatureForm',
    requiredParams: ['employeeId', 'formId'],
  })

  return <SignatureForm employeeId={employeeId} formId={formId} onEvent={onEvent} />
}
