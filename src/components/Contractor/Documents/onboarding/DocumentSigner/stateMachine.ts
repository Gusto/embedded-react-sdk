import type { DocumentSignerContextInterface, EventPayloads } from './documentSignerStateMachine'
import { SignatureFormContextual, DocumentsListContextual } from './documentSignerStateMachine'
import { state, transition, reduce } from '@/lib/state-machine'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

/** @internal */
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
          documentUuid: ev.payload.uuid,
          component: SignatureFormContextual,
        }),
      ),
    ),
  ),
  signatureForm: state<MachineTransition>(
    transition(
      componentEvents.CANCEL,
      'index',
      reduce((ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
        ...ctx,
        documentUuid: undefined,
        component: DocumentsListContextual,
      })),
    ),
    transition(
      componentEvents.CONTRACTOR_SIGN_DOCUMENT,
      'index',
      reduce((ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
        ...ctx,
        documentUuid: undefined,
        component: DocumentsListContextual,
      })),
    ),
  ),
}
