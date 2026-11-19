import { useContractorFormsList } from '@gusto/embedded-api/react-query/contractorFormsList'
import type { Form1099 } from '@gusto/embedded-api/models/components/form1099'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'
import { isMissingOAuthScopesError } from '@/helpers/missingOAuthScopes'

/**
 * Parameters for {@link useContractorTaxForms}.
 *
 * @public
 */
export interface UseContractorTaxFormsParams {
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Ready-state shape returned by {@link useContractorTaxForms} once the forms have loaded.
 *
 * @public
 * @interface
 */
export type UseContractorTaxFormsReady = BaseHookReady<
  { forms: Form1099[] },
  { isFetching: boolean }
>

/**
 * Result of {@link useContractorTaxForms} — a discriminated union of loading and ready states.
 *
 * @public
 */
export type UseContractorTaxFormsResult = HookLoadingResult | UseContractorTaxFormsReady

/**
 * Standalone data hook for a contractor's tax forms (1099s).
 *
 * @remarks
 * Wraps the `contractorFormsList` query in the standard {@link BaseHookReady}
 * shape. Separate from `useContractorDocumentsList` because forms and documents
 * are distinct API resources: the documents endpoint serves only the W-9, while
 * 1099s come from `GET /v1/contractors/{uuid}/forms`.
 *
 * Read-only. Contractor forms cannot be signed through the API at all, so this
 * hook exposes no actions.
 *
 * A token without the `contractor_forms:read` scope resolves to an empty list
 * rather than an error, so a surface that also renders documents can still show
 * them.
 *
 * Any other failure is re-thrown during render rather than placed on
 * `errorHandling.errors`, so render this hook inside an error boundary. This is
 * the one place it departs from the other contractor data hooks, which report
 * query failures through `errorHandling`.
 *
 * @param params - See {@link UseContractorTaxFormsParams}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseContractorTaxFormsReady} once the forms have arrived.
 * @public
 *
 * @example
 * ```tsx
 * import { useContractorTaxForms } from '@gusto/embedded-react-sdk'
 *
 * function TaxForms({ contractorId }: { contractorId: string }) {
 *   const taxForms = useContractorTaxForms({ contractorId })
 *
 *   if (taxForms.isLoading) return <div>Loading...</div>
 *
 *   if (taxForms.data.forms.length === 0) return <p>No 1099s yet.</p>
 *
 *   return (
 *     <ul>
 *       {taxForms.data.forms.map(form => (
 *         <li key={form.uuid}>{form.title}</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useContractorTaxForms({
  contractorId,
}: UseContractorTaxFormsParams): UseContractorTaxFormsResult {
  // staleTime: Infinity — the SDK QueryClient invalidates on any mutation
  // success, so a long stale time avoids redundant refetches on remount.
  const formsQuery = useContractorFormsList(
    { contractorUuid: contractorId },
    {
      staleTime: Infinity,
      throwOnError: (error: Error) => !isMissingOAuthScopesError(error),
    },
  )

  const isScopeDenied = isMissingOAuthScopesError(formsQuery.error)
  const errorHandling = composeErrorHandler(isScopeDenied ? [] : [formsQuery])

  if (formsQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { forms: formsQuery.data?.form1099s ?? [] },
    status: { isFetching: formsQuery.isFetching },
    errorHandling,
  }
}
