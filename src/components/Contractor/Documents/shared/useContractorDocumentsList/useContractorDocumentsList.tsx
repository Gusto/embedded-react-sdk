import { useContractorDocumentsGetAll } from '@gusto/embedded-api/react-query/contractorDocumentsGetAll'
import type { Document } from '@gusto/embedded-api/models/components/document'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Parameters for {@link useContractorDocumentsList}.
 *
 * @public
 */
export interface UseContractorDocumentsListParams {
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Ready-state shape returned by {@link useContractorDocumentsList} once the documents have loaded.
 *
 * @public
 * @interface
 */
export type UseContractorDocumentsListReady = BaseHookReady<
  { documents: Document[] },
  { isFetching: boolean }
>

/**
 * Result of {@link useContractorDocumentsList} — a discriminated union of loading and ready states.
 *
 * @public
 */
export type UseContractorDocumentsListResult = HookLoadingResult | UseContractorDocumentsListReady

/**
 * Standalone data hook for a contractor's documents.
 *
 * @remarks
 * Wraps the `contractorDocumentsGetAll` query in the standard
 * {@link BaseHookReady} shape. Read-only — viewing or signing a document is
 * handled by the screen the parent routes to, so this hook exposes no actions.
 *
 * @param params - See {@link UseContractorDocumentsListParams}.
 * @returns A {@link HookLoadingResult} while loading, or the ready state with `data.documents` once loaded.
 * @public
 *
 * @example
 * ```tsx
 * import { useContractorDocumentsList } from '@gusto/embedded-react-sdk'
 *
 * function ContractorDocuments({ contractorId }: { contractorId: string }) {
 *   const result = useContractorDocumentsList({ contractorId })
 *
 *   if (result.isLoading) return <div>Loading...</div>
 *
 *   return (
 *     <ul>
 *       {result.data.documents.map(doc => (
 *         <li key={doc.uuid}>{doc.title}</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useContractorDocumentsList({
  contractorId,
}: UseContractorDocumentsListParams): UseContractorDocumentsListResult {
  // staleTime: Infinity — the SDK QueryClient invalidates on any mutation
  // success, so a long stale time avoids redundant refetches on remount.
  const documentsQuery = useContractorDocumentsGetAll(
    { contractorUuid: contractorId },
    { staleTime: Infinity },
  )

  const errorHandling = composeErrorHandler([documentsQuery])

  if (documentsQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { documents: documentsQuery.data?.documents ?? [] },
    status: { isFetching: documentsQuery.isFetching },
    errorHandling,
  }
}
