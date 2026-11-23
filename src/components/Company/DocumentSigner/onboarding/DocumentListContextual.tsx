import { DocumentList as BlockDocumentList } from '../DocumentList'
import type { DocumentSignerContextInterface } from '../shared/useDocumentSigner'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * The onboarding document list.
 *
 * @remarks
 * Renders `DocumentList` with its default children, which include the Continue button that
 * advances the onboarding flow. The management list variant omits that button.
 *
 * @internal
 */
export function DocumentListContextual() {
  const { companyId, signatoryId, onEvent } = useFlow<DocumentSignerContextInterface>()
  return (
    <BlockDocumentList
      companyId={ensureRequired(companyId)}
      signatoryId={signatoryId}
      onEvent={onEvent}
    />
  )
}
