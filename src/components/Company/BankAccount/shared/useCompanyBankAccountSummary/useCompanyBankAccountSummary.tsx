import { useBankAccountsGet } from '@gusto/embedded-api/react-query/bankAccountsGet'
import type { CompanyBankAccount } from '@gusto/embedded-api/models/components/companybankaccount'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Parameters accepted by {@link useCompanyBankAccountSummary}.
 *
 * @internal
 */
export interface UseCompanyBankAccountSummaryParams {
  /** UUID of the company whose bank account is being read. */
  companyId: string
}

type UseCompanyBankAccountSummaryReady = BaseHookReady<
  { bankAccount: CompanyBankAccount | undefined },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Discriminated union returned by {@link useCompanyBankAccountSummary} — either the loading state or the ready state carrying the company's bank account.
 *
 * @internal
 */
export type UseCompanyBankAccountSummaryResult =
  HookLoadingResult | UseCompanyBankAccountSummaryReady

/**
 * Read-only data hook for the company Bank account management card. Wraps
 * `useBankAccountsGet` and returns the company's default bank account, or
 * `undefined` when none is on file. Gusto supports a single default company
 * bank account, so the first entry is the one reported. Mutations live in
 * `CompanyOnboarding.BankAccount`.
 *
 * @param params - See {@link UseCompanyBankAccountSummaryParams}.
 * @returns See {@link UseCompanyBankAccountSummaryResult}.
 * @internal
 */
export function useCompanyBankAccountSummary({
  companyId,
}: UseCompanyBankAccountSummaryParams): UseCompanyBankAccountSummaryResult {
  const bankAccountsQuery = useBankAccountsGet({ companyId }, { staleTime: Infinity })

  const errorHandling = composeErrorHandler([bankAccountsQuery])

  if (bankAccountsQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { bankAccount: bankAccountsQuery.data?.companyBankAccounts?.[0] },
    status: {
      isFetching: bankAccountsQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
