import { createMachine } from 'robot3'
import { useSignatoriesListSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/signatoriesList'
import { useMemo } from 'react'
import { AssignSignatory, DocumentList } from './documentSignerStateMachine'
import { documentSignerMachine } from './stateMachine'
import type { DocumentSignerContextInterface } from './useDocumentSigner'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

/**
 * Props for {@link DocumentSigner}.
 *
 * @public
 */
export interface DocumentSignerProps extends BaseComponentInterface<'Company.DocumentList'> {
  /** The associated company identifier. */
  companyId: string
  /**
   * ID of the signatory. When set and matching the current signatory, the user is treated as the
   * signatory and is allowed to sign documents — the signature form is pre-populated with their
   * information.
   */
  signatoryId?: string
}

function DocumentSignerFlow({ companyId, signatoryId, onEvent, dictionary }: DocumentSignerProps) {
  useComponentDictionary('Company.DocumentList', dictionary)
  const {
    data: { signatories: signatoryList },
  } = useSignatoriesListSuspense({
    companyUuid: companyId,
  })
  const signatories = signatoryList!
  const doesSignatoryExist = signatories.length > 0

  const documentSigner = useMemo(
    () =>
      createMachine(
        doesSignatoryExist ? 'documentList' : 'index',
        documentSignerMachine,
        (initialContext: DocumentSignerContextInterface) => ({
          ...initialContext,
          component: doesSignatoryExist ? DocumentList : AssignSignatory,
          companyId,
          signatoryId,
        }),
      ),

    [companyId], // Only companyId - prevents recreation when signatoryId/doesSignatoryExist change
  )
  return <Flow machine={documentSigner} onEvent={onEvent} />
}

/**
 * Company onboarding step for reading and signing required company documents.
 *
 * @remarks
 * Handles document listing, signatory management, and the signing workflow. If no signatory has
 * been assigned for the company yet, the flow starts on the assign-signatory step before
 * presenting the document list.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/forms/view` | Fired when a user selects a form to sign from the document list | {@link Form} |
 * | `company/forms/editSignatory` | Fired when the user requests to change the document signatory | The current signatory entity |
 * | `company/forms/done` | Fired when the user completes the document signing process | — |
 * | `company/forms/sign/signForm` | Fired when a form is successfully signed | {@link Form} |
 * | `company/forms/sign/done` | Fired when the form signing process is complete | — |
 * | `company/forms/sign/back` | Fired when the user navigates back from the signature form | — |
 * | `company/signatory/assignSignatory/modeUpdated` | Fired when the signatory assignment mode changes | `'createSignatory'` or `'inviteSignatory'` |
 * | `company/signatory/assignSignatory/done` | Fired when the signatory assignment process is complete | — |
 * | `company/signatory/created` | Fired when a new signatory is created successfully | {@link Signatory} |
 * | `company/signatory/updated` | Fired when an existing signatory is updated successfully | {@link Signatory} |
 * | `company/signatory/invited` | Fired when a signatory is successfully invited to the company | {@link Signatory} |
 *
 * @param props - See {@link DocumentSignerProps}.
 * @returns The document signer flow.
 * @public
 */
export function DocumentSigner(props: DocumentSignerProps) {
  return (
    <BaseComponent {...props}>
      <DocumentSignerFlow {...props} />
    </BaseComponent>
  )
}
