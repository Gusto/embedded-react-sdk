import type { DocumentSignerContextInterface, EventPayloads } from './documentSignerStateMachine'
import {
  SignatureFormContextual,
  DocumentListContextual,
  I9SignatureFormContextual,
  EmploymentEligibilityContextual,
} from './documentSignerStateMachine'
import { state, transition, reduce } from '@/lib/state-machine'
import { componentEvents, I9_FORM_NAME } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

/**
 * `EMPLOYEE_FORMS_DONE` deliberately has no transition out of `index`. `Flow` re-emits every
 * event to the upstream `onEvent` regardless of whether the local machine has a matching
 * transition, so the parent flow still advances/unmounts this component on that signal. Modeling
 * completion as a final state instead left `component` pointing at a step whose controls
 * could never fire another transition — if a host doesn't unmount immediately, the screen would
 * look interactive but be permanently dead (see SDK-1169, the same bug in
 * `Compensation`'s onboarding machine). Staying in `index` means a host that keeps this
 * component mounted past completion keeps a fully working document list instead.
 *
 * @internal
 */
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
    transition(
      componentEvents.EMPLOYEE_CHANGE_ELIGIBILITY_STATUS,
      'employmentEligibility',
      reduce(
        (
          ctx: DocumentSignerContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.EMPLOYEE_CHANGE_ELIGIBILITY_STATUS
          >,
        ): DocumentSignerContextInterface => ({
          ...ctx,
          formId: undefined,
          isI9Form: undefined,
          component: EmploymentEligibilityContextual,
        }),
      ),
    ),
  ),
}
