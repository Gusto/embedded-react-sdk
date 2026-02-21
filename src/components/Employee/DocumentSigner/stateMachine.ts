import { state, transition, reduce, state as final } from 'robot3'
import type { DocumentSignerContextInterface, EventPayloads } from './documentSignerStateMachine'
import {
  SignatureFormContextual,
  DocumentListContextual,
  I9SignatureFormContextual,
} from './documentSignerStateMachine'
import { componentEvents, I9_FORM_NAME } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

export const documentSignerMachine = {
  employmentEligibility: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE,
      'index',
      reduce(
        (
          ctx: DocumentSignerContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE
          >,
        ): DocumentSignerContextInterface => ({
          ...ctx,
          component: DocumentListContextual,
        }),
      ),
    ),
  ),
  index: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN,
      'signatureForm',
      reduce(
        (
          ctx: DocumentSignerContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN>,
        ): DocumentSignerContextInterface => {
          const isI9Form = ev.payload.name === I9_FORM_NAME
          return {
            ...ctx,
            formId: ev.payload.uuid,
            isI9Form,
            component: isI9Form ? I9SignatureFormContextual : SignatureFormContextual,
          }
        },
      ),
    ),
    transition(componentEvents.EMPLOYEE_FORMS_DONE, 'done'),
  ),
  signatureForm: state<MachineTransition>(
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
          isI9Form: undefined,
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
          isI9Form: undefined,
          component: DocumentListContextual,
        }),
      ),
    ),
  ),
  done: final(),
}
