import { state, transition, reduce } from 'robot3'
import type { ComponentType } from 'react'
import type { EventPayloads } from './documentSignerComponents'
import { SignatureForm, AssignSignatory } from './documentSignerComponents'
import { createAssignSignatoryState } from './assignSignatoryState'
import type { DocumentSignerContextInterface } from './useDocumentSigner'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { companyEvents } from '@/shared/constants'

/**
 * Builds the document-signing machine, given the document list to open and return to.
 *
 * @remarks
 * Onboarding and management differ only in that screen — onboarding's carries a Continue button
 * that advances the setup flow and management's does not — so taking it as the single parameter
 * lets both surfaces share these transitions. The list is referenced from five transitions
 * across this machine and the assign-signatory state.
 *
 * Same shape as `createLocationsMachine`, `createBankAccountMachine` and
 * `createStateTaxesMachine`.
 *
 * `COMPANY_SIGN_FORM` is deliberately absent: a company signs its forms one at a time, so a
 * signature keeps the signature form open rather than moving anywhere.
 *
 * @param documentListContextual - The document list this flow opens on and returns to.
 * @returns The machine states, keyed by state name.
 * @internal
 */
export function createDocumentSignerMachine(documentListContextual: ComponentType) {
  const returnToList = reduce(
    (ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
      ...ctx,
      component: documentListContextual,
    }),
  )

  return {
    index: createAssignSignatoryState(documentListContextual),
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
            component: SignatureForm as ComponentType,
          }),
        ),
      ),
      transition(
        companyEvents.COMPANY_FORM_EDIT_SIGNATORY,
        'assignSignatory',
        reduce((ctx: DocumentSignerContextInterface): DocumentSignerContextInterface => ({
          ...ctx,
          component: AssignSignatory as ComponentType,
        })),
      ),
    ),
    assignSignatory: createAssignSignatoryState(documentListContextual),
    signatureForm: state<MachineTransition>(
      transition(companyEvents.COMPANY_SIGN_FORM_DONE, 'documentList', returnToList),
      transition(companyEvents.COMPANY_SIGN_FORM_BACK, 'documentList', returnToList),
    ),
  }
}
