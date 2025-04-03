import { reduce, state, state as final, transition } from 'robot3'
import { type Form } from '@gusto/embedded-api/models/components/form'
import { DocumentList } from './DocumentList/DocumentList'
import { SignatureForm } from './SignatureForm/SignatureForm'
import { useFlowParams, type UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import type { FlowContextInterface } from '@/components/Flow/Flow'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType } from '@/types/Helpers'

type EventPayloads = {
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

export const documentSignerMachine = {
  index: state(
    transition(
      componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN,
      'signatureForm',
      reduce(
        (
          ctx: DocumentSignerContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN>,
        ): DocumentSignerContextInterface => ({
          ...ctx,
          formId: ev.payload.uuid,
          component: SignatureFormContextual,
        }),
      ),
    ),
    transition(componentEvents.EMPLOYEE_FORMS_DONE, 'done'),
  ),
  signatureForm: state(
    transition(
      componentEvents.CANCEL,
      'index',
      reduce(
        (
          ctx: DocumentSignerContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CANCEL>,
        ): DocumentSignerContextInterface => ({
          ...ctx,
          formId: undefined,
          component: DocumentListContextual,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_SIGN_FORM,
      'index',
      reduce(
        (
          ctx: DocumentSignerContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_SIGN_FORM>,
        ): DocumentSignerContextInterface => ({
          ...ctx,
          formId: undefined,
          component: DocumentListContextual,
        }),
      ),
    ),
  ),
  done: final(),
}
