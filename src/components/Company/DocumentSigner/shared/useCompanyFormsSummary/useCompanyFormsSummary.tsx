import { useCompanyFormsGetAll } from '@gusto/embedded-api/react-query/companyFormsGetAll'
import type { Form } from '@gusto/embedded-api/models/components/form'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Parameters accepted by {@link useCompanyFormsSummary}.
 *
 * @internal
 */
export interface UseCompanyFormsSummaryParams {
  /** UUID of the company whose forms are being read. */
  companyId: string
}

type UseCompanyFormsSummaryReady = BaseHookReady<
  {
    /** Every form the company has, signed or not. */
    forms: Form[]
    /** The subset still waiting on the signatory. */
    formsAwaitingSignature: Form[]
  },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Discriminated union returned by {@link useCompanyFormsSummary} — either the loading state or the ready state carrying the company's forms.
 *
 * @internal
 */
export type UseCompanyFormsSummaryResult = HookLoadingResult | UseCompanyFormsSummaryReady

/**
 * Read-only data hook for the company forms management card. Wraps
 * `useCompanyFormsGetAll` and splits out the forms still awaiting signature.
 * Signing lives in `CompanyOnboarding.DocumentSigner`.
 *
 * @remarks
 * The endpoint neither filters nor sorts on `requires_signing`, and returns the
 * company's whole document set when no page is requested, so the split is made
 * client-side over every form rather than by asking for the unsigned ones. That
 * set grows with each year's tax filings, but only the authorization forms a
 * company signs once ever carry `requires_signing`.
 *
 * @param params - See {@link UseCompanyFormsSummaryParams}.
 * @returns See {@link UseCompanyFormsSummaryResult}.
 * @internal
 */
export function useCompanyFormsSummary({
  companyId,
}: UseCompanyFormsSummaryParams): UseCompanyFormsSummaryResult {
  const formsQuery = useCompanyFormsGetAll({ companyId }, { staleTime: Infinity })

  const errorHandling = composeErrorHandler([formsQuery])

  if (formsQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  const forms = formsQuery.data?.forms ?? []

  return {
    isLoading: false,
    data: {
      forms,
      formsAwaitingSignature: forms.filter(form => form.requiresSigning),
    },
    status: {
      isFetching: formsQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
