import { useContractorDocumentsGetAllSuspense } from '@gusto/embedded-api/react-query/contractorDocumentsGetAll'
import { isW9Document } from '@/components/Contractor/Documents/SignatureForm/useContractorSignatureForm'

/**
 * Returns `true` when the contractor has a W-9 with a `signedAt` timestamp on
 * file. Fetches via Suspense — must be rendered inside a Suspense boundary
 * (SDK `BaseBoundaries` supplies one).
 *
 * @internal
 */
export function useContractorHasSignedW9(contractorId: string): boolean {
  const { data } = useContractorDocumentsGetAllSuspense({ contractorUuid: contractorId })
  return (data.documents ?? []).some(doc => isW9Document(doc) && !!doc.signedAt)
}
