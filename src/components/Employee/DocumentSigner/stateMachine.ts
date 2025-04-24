import { state, transition, reduce, state as final } from 'robot3'
import type { DocumentSignerContextInterface, EventPayloads } from './documentSignerStateMachine'
import { SignatureFormContextual, DocumentListContextual } from './documentSignerStateMachine'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType } from '@/types/Helpers'

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
