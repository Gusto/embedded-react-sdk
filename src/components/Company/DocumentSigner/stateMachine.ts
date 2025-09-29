import { state, transition, reduce } from 'robot3'
import type { EventPayloads } from './documentSignerStateMachine'
import { SignatureForm, AssignSignatory, DocumentList } from './documentSignerStateMachine'
import { assignSignatoryState } from './assignSignatoryState'
import type { DocumentSignerContextInterface } from './useDocumentSigner'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { companyEvents } from '@/shared/constants'

export const documentSignerMachine = {
  index: assignSignatoryState,
  documentList: state<MachineTransition>(
    transition(
      companyEvents.COMPANY_VIEW_FORM_TO_SIGN,
      'signatureForm',
      reduce(
        (
          ctx: DocumentSignerContextInterface,
          ev: MachineEventType<EventPayloads, typeof companyEvents.COMPANY_VIEW_FORM_TO_SIGN>,
        ): DocumentSignerContextInterface => ({
          ...ctx,
          formId: ev.payload.uuid,
          component: SignatureForm,
        }),
      ),
    ),
    transition(
      companyEvents.COMPANY_FORM_EDIT_SIGNATORY,
      'assignSignatory',
      reduce(
        (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
          ...ctx,
          component: AssignSignatory,
        }),
      ),
    ),
    transition(companyEvents.COMPANY_FORMS_DONE, 'final'),
  ),
  assignSignatory: assignSignatoryState,
  signatureForm: state<MachineTransition>(
    transition(
      companyEvents.COMPANY_SIGN_FORM_DONE,
      'documentList',
      reduce(
        (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
          ...ctx,
          component: DocumentList,
        }),
      ),
    ),
    transition(
      companyEvents.COMPANY_SIGN_FORM_BACK,
      'documentList',
      reduce(
        (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
          ...ctx,
          component: DocumentList,
        }),
      ),
    ),
  ),
  final: state<MachineTransition>(),
}
