import { state, transition, reduce } from 'robot3'
import type { EventPayloads } from './documentSignerStateMachine'
import { DocumentList } from './documentSignerStateMachine'
import type { DocumentSignerContextInterface } from './useDocumentSignerFlow'
import type { MachineEventType } from '@/types/Helpers'
import { companyEvents } from '@/shared/constants'

export const assignSignatoryState = state(
  transition(
    companyEvents.COMPANY_SIGNATORY_INVITED,
    'documentList',
    reduce(
      (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
        ...ctx,
        component: DocumentList,
      }),
    ),
  ),
  transition(
    companyEvents.COMPANY_SIGNATORY_CREATED,
    'documentList',
    reduce(
      (
        ctx: DocumentSignerContextInterface,
        ev: MachineEventType<EventPayloads, typeof companyEvents.COMPANY_SIGNATORY_CREATED>,
      ): DocumentSignerContextInterface => ({
        ...ctx,
        signatoryId: ev.payload.uuid,
        component: DocumentList,
      }),
    ),
  ),
  transition(
    companyEvents.COMPANY_SIGNATORY_UPDATED,
    'documentList',
    reduce(
      (
        ctx: DocumentSignerContextInterface,
        ev: MachineEventType<EventPayloads, typeof companyEvents.COMPANY_SIGNATORY_UPDATED>,
      ): DocumentSignerContextInterface => ({
        ...ctx,
        signatoryId: ev.payload.uuid,
        component: DocumentList,
      }),
    ),
  ),
)
