import { state, transition, reduce, state as final } from 'robot3'
import type { DocumentSignerContextInterface, EventPayloads } from './documentSignerStateMachine'
import { SignatureFormContextual, DocumentListContextual } from './documentSignerStateMachine'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

export const documentSignerMachine = {
  index: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_VIEW_DOCUMENT_TO_SIGN,
      'signatureForm',
      reduce(
        (
          ctx: DocumentSignerContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.CONTRACTOR_VIEW_DOCUMENT_TO_SIGN
          >,
        ): DocumentSignerContextInterface => ({
          ...ctx,
          documentId: ev.payload.uuid,
          component: SignatureFormContextual,
        }),
      ),
    ),
    transition(componentEvents.CONTRACTOR_DOCUMENTS_DONE, 'done'),
  ),
  signatureForm: state<MachineTransition>(
    transition(
      componentEvents.CANCEL,
      'index',
      reduce(
        (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
          ...ctx,
          documentId: undefined,
          component: DocumentListContextual,
        }),
      ),
    ),
    transition(
      componentEvents.CONTRACTOR_SIGN_DOCUMENT,
      'index',
      reduce(
        (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
          ...ctx,
          documentId: undefined,
          component: DocumentListContextual,
        }),
      ),
    ),
  ),
  done: final(),
}
