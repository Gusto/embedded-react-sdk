import { state, transition, reduce } from 'robot3'
import type { ComponentType } from 'react'
import type { EventPayloads } from './documentSignerComponents'
import type { DocumentSignerContextInterface } from './useDocumentSigner'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { companyEvents } from '@/shared/constants'

/**
 * Builds the assign-signatory state, given the document list to advance to.
 *
 * @remarks
 * Takes the list as a parameter for the same reason the machine does: onboarding and management
 * differ only in that screen.
 *
 * `adoptsAssignedSignatory` decides whether whoever creates or updates the signatory here is
 * treated as that signatory, which unlocks signing for them. The management surface passes
 * `false`, so changing the signatory never grants the viewer signing rights.
 *
 * @param documentListContextual - The document list to advance to once a signatory exists.
 * @returns The assign-signatory state.
 * @internal
 */
export function createAssignSignatoryState(documentListContextual: ComponentType) {
  return state<MachineTransition>(
    transition(
      companyEvents.COMPANY_SIGNATORY_INVITED,
      'documentList',
      reduce((ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
        ...ctx,
        component: documentListContextual,
      })),
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
          signatoryId: ctx.adoptsAssignedSignatory ? ev.payload.uuid : ctx.signatoryId,
          component: documentListContextual,
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
          signatoryId: ctx.adoptsAssignedSignatory ? ev.payload.uuid : ctx.signatoryId,
          component: documentListContextual,
        }),
      ),
    ),
  )
}
