import { state, transition, reduce } from 'robot3'
import type { EventPayloads } from './documentSignerStateMachine'
import { SignatureForm, AssignSignatory, DocumentList } from './documentSignerStateMachine'
import { assignSignatoryState } from './assignSignatoryState'
import type { DocumentSignerContextInterface } from './useDocumentSignerFlow'
import type { MachineEventType } from '@/types/Helpers'
import { companyEvents } from '@/shared/constants'

export const documentSignerMachine = {
  index: assignSignatoryState,
  documentList: state(
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
  ),
  assignSignatory: assignSignatoryState,
  signatureForm: state(
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
}
