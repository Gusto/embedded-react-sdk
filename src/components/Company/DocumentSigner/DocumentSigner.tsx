import { createMachine } from 'robot3'
import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
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

interface DocumentSignerFlowProps extends DocumentSignerProps {
  adoptsAssignedSignatory: boolean
}

function DocumentSignerFlow({
  companyId,
  signatoryId,
  adoptsAssignedSignatory,
  onEvent,
  dictionary,
}: DocumentSignerFlowProps) {
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
          adoptsAssignedSignatory,
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
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/forms/view` | Fired when a user selects a form to sign from the document list | {@link APIModels.Form} |
 * | `company/forms/editSignatory` | Fired when the user requests to change the document signatory | The current signatory entity |
 * | `company/forms/done` | Fired when the user completes the document signing process | — |
 * | `company/forms/sign/signForm` | Fired when a form is successfully signed | {@link APIModels.Form} |
 * | `company/forms/sign/done` | Fired when the form signing process is complete | — |
 * | `company/forms/sign/back` | Fired when the user navigates back from the signature form | — |
 * | `company/signatory/assignSignatory/modeUpdated` | Fired when the signatory assignment mode changes | `'createSignatory'` or `'inviteSignatory'` |
 * | `company/signatory/assignSignatory/done` | Fired when the signatory assignment process is complete | — |
 * | `company/signatory/created` | Fired when a new signatory is created successfully | {@link APIModels.Signatory} |
 * | `company/signatory/updated` | Fired when an existing signatory is updated successfully | {@link APIModels.Signatory} |
 * | `company/signatory/invited` | Fired when a signatory is successfully invited to the company | {@link APIModels.Signatory} |
 *
 * @param props - See {@link DocumentSignerProps}.
 * @returns The document signer flow.
 * @public
 */
export function DocumentSigner(props: DocumentSignerProps) {
  return (
    <BaseComponent {...props}>
      <DocumentSignerFlow {...props} adoptsAssignedSignatory />
    </BaseComponent>
  )
}

/**
 * {@link DocumentSigner} with signing rights bound to the `signatoryId` the host supplies.
 *
 * @remarks
 * `DocumentSigner` treats whoever creates or updates the signatory from its assign screen as that
 * signatory, which unlocks signing for them. This variant keeps the host's `signatoryId` instead,
 * so changing the signatory never grants the viewer signing rights. Used by
 * `CompanyManagement.DashboardFlow`, where the viewer's identity is a claim only the host can make.
 *
 * @param props - See {@link DocumentSignerProps}.
 * @returns The document signer flow.
 * @internal
 */
export function ViewerBoundDocumentSigner(props: DocumentSignerProps) {
  return (
    <BaseComponent {...props}>
      <DocumentSignerFlow {...props} adoptsAssignedSignatory={false} />
    </BaseComponent>
  )
}
