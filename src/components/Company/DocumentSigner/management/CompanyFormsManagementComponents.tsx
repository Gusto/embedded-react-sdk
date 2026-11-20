import { DocumentList as BlockDocumentList } from '../DocumentList'
import { Head } from '../DocumentList/Head'
import { List } from '../DocumentList/List'
import { ManageSignatories } from '../DocumentList/ManageSignatories'
import type { DocumentSignerContextInterface } from '../shared/useDocumentSigner'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * The steady-state document list.
 *
 * @remarks
 * Composes `DocumentList` with its heading, signatory row and table. The onboarding list's
 * only footer action is a Continue that advances the setup flow, so the management variant
 * supplies no actions at all — the block's back header is the way out.
 *
 * Signing is unaffected: each row's Sign action lives in `List`, gated on the viewer being the
 * signatory, and is rendered by both surfaces.
 *
 * @internal
 */
export function CompanyFormsManagementListContextual() {
  const { companyId, signatoryId, onEvent } = useFlow<DocumentSignerContextInterface>()
  return (
    <BlockDocumentList
      companyId={ensureRequired(companyId)}
      signatoryId={signatoryId}
      onEvent={onEvent}
    >
      <Head />
      <ManageSignatories />
      <List />
    </BlockDocumentList>
  )
}
