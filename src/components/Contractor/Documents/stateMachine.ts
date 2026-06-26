import { state, transition, reduce, state as final } from 'robot3'
import type {
  ContractorDocumentSignerContextInterface,
  EventPayloads,
} from './documentSignerStateMachine'
import { DocumentsListContextual, SignatureFormContextual } from './documentSignerStateMachine'
import { contractorEvents, componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

/** @internal */
export const contractorDocumentSignerMachine = {
  list: state<MachineTransition>(
    transition(
      contractorEvents.CONTRACTOR_VIEW_DOCUMENT_TO_SIGN,
      'signatureForm',
      reduce(
        (
          ctx: ContractorDocumentSignerContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof contractorEvents.CONTRACTOR_VIEW_DOCUMENT_TO_SIGN
          >,
        ): ContractorDocumentSignerContextInterface => ({
          ...ctx,
          documentUuid: ev.payload.uuid,
          component: SignatureFormContextual,
        }),
      ),
    ),
    transition(contractorEvents.CONTRACTOR_DOCUMENTS_DONE, 'done'),
  ),
  signatureForm: state<MachineTransition>(
    transition(
      contractorEvents.CONTRACTOR_SIGN_DOCUMENT,
      'list',
      reduce(
        (
          ctx: ContractorDocumentSignerContextInterface,
        ): ContractorDocumentSignerContextInterface => ({
          ...ctx,
          documentUuid: undefined,
          component: DocumentsListContextual,
        }),
      ),
    ),
    transition(
      componentEvents.CANCEL,
      'list',
      reduce(
        (
          ctx: ContractorDocumentSignerContextInterface,
        ): ContractorDocumentSignerContextInterface => ({
          ...ctx,
          documentUuid: undefined,
          component: DocumentsListContextual,
        }),
      ),
    ),
  ),
  done: final(),
}
