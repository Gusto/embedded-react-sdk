import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { useSignatoriesListSuspense } from '@gusto/embedded-api/react-query/signatoriesList'
import { AssignSignatory } from '../shared/documentSignerComponents'
import { createDocumentSignerMachine } from '../shared/documentSignerMachine'
import type { DocumentSignerContextInterface } from '../shared/useDocumentSigner'
import { CompanyFormsManagementListContextual } from './CompanyFormsManagementComponents'
import { translateEvents } from '@/components/Company/shared/translateEvents'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

/**
 * Props for {@link CompanyFormsEditScreen}.
 *
 * @internal
 */
export interface CompanyFormsEditScreenProps extends BaseComponentInterface<'Company.DocumentList'> {
  /** The associated company identifier. */
  companyId: string
  /**
   * Identifier of the signatory using this surface. Signing is offered only for this person;
   * leaving it unset makes the screen review-only.
   */
  signatoryId?: string
}

function CompanyFormsEditFlow({ companyId, signatoryId, onEvent }: CompanyFormsEditScreenProps) {
  const {
    data: { signatories },
  } = useSignatoriesListSuspense({ companyUuid: companyId })
  const doesSignatoryExist = (signatories ?? []).length > 0

  const machine = useMemo(
    () =>
      createMachine(
        doesSignatoryExist ? 'documentList' : 'index',
        createDocumentSignerMachine(CompanyFormsManagementListContextual),
        (initialContext: DocumentSignerContextInterface) => ({
          ...initialContext,
          component: doesSignatoryExist ? CompanyFormsManagementListContextual : AssignSignatory,
          companyId,
          signatoryId,
          // Signing stays bound to the host's claim about who is viewing, so changing the
          // signatory from the document list never grants the viewer signing rights.
          adoptsAssignedSignatory: false,
        }),
      ),
    // Only companyId: prevents recreation when signatoryId or doesSignatoryExist change,
    // which would reset the flow to its first screen mid-visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [companyId],
  )

  return (
    <Flow
      machine={machine}
      onEvent={translateEvents(onEvent, {
        [componentEvents.COMPANY_SIGN_FORM]:
          componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_UPDATED,
      })}
    />
  )
}

/**
 * The document list, signing and assign-signatory screens as a single management surface.
 *
 * @remarks
 * Mounted by both management orchestrators — the `CompanyForms` block and
 * `CompanyManagement.DashboardFlow` — so the translation to
 * `company/management/companyForms/updated` lives in one place that both reach.
 *
 * Opens on the assign-signatory screen when the company has no signatory, since nothing can be
 * signed without one, and on the document list when it does. Omitting the onboarding Continue is
 * what makes `company/forms/done` unnecessary here.
 *
 * A company signs its forms one at a time, so each signature maps to the management event and
 * the hosting machine treats it as "stay" rather than "leave".
 *
 * Signing rights stay bound to the `signatoryId` the host supplies: this surface never adopts
 * whoever changes the signatory from the document list as that signatory. Treating anyone who
 * opens the dashboard as the signatory would let them sign the company's federal tax forms.
 *
 * @param props - See {@link CompanyFormsEditScreenProps}.
 * @returns The document-signing sub-flow wired for a management surface.
 * @internal
 */
export function CompanyFormsEditScreen(props: CompanyFormsEditScreenProps) {
  return (
    <BaseComponent {...props}>
      <CompanyFormsEditFlow {...props} />
    </BaseComponent>
  )
}
