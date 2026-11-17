import { useContractorPaymentMethodGet } from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodGetBankAccounts } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodUpdate'
import type { ContractorPaymentMethod } from '@gusto/embedded-api/models/components/contractorpaymentmethod'
import type { ContractorBankAccount } from '@gusto/embedded-api/models/components/contractorbankaccount'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult, HookSubmitResult } from '@/partner-hook-utils/types'
import { SDKInternalError } from '@/types/sdkError'
import { PAYMENT_METHODS } from '@/shared/constants'

/**
 * Parameters for {@link useContractorPaymentMethodSummary}.
 *
 * @public
 */
export interface UseContractorPaymentMethodSummaryParams {
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Ready-state shape returned by {@link useContractorPaymentMethodSummary} once the payment method has loaded.
 *
 * @public
 */
export interface UseContractorPaymentMethodSummaryReady extends BaseHookReady<
  {
    paymentMethod: ContractorPaymentMethod
    bankAccount: ContractorBankAccount | undefined
  },
  { isFetching: boolean; isPending: boolean }
> {
  /** Actions available once the payment method has loaded. */
  actions: {
    /** Reverts the contractor's payment method to Check. */
    onRemoveBankAccount: () => Promise<HookSubmitResult<ContractorPaymentMethod> | undefined>
  }
}

/**
 * Result of {@link useContractorPaymentMethodSummary} — a discriminated union of loading and ready states.
 *
 * @public
 */
export type UseContractorPaymentMethodSummaryResult =
  HookLoadingResult | UseContractorPaymentMethodSummaryReady

/**
 * Standalone data hook for a contractor's payment method and its linked bank account.
 *
 * @remarks
 * Reads both the payment method and the contractor's bank accounts. A contractor has at most one
 * bank account, so `data.bankAccount` is the first entry, and it is `undefined` while the payment
 * method is Check — there is no account to show in that case.
 *
 * `actions.onRemoveBankAccount` switches the payment method back to Check, which is how a bank
 * account is detached; the API exposes no delete for a contractor bank account. It resolves to the
 * updated payment method, or `undefined` if the call failed, in which case the failure is on
 * `errorHandling.errors`.
 *
 * @param params - See {@link UseContractorPaymentMethodSummaryParams}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseContractorPaymentMethodSummaryReady} once the payment method has arrived.
 * @public
 *
 * @example
 * ```tsx
 * import { useContractorPaymentMethodSummary } from '@gusto/embedded-react-sdk'
 *
 * function PaymentMethodSummary({ contractorId }: { contractorId: string }) {
 *   const summary = useContractorPaymentMethodSummary({ contractorId })
 *
 *   if (summary.isLoading) return <div>Loading...</div>
 *
 *   return (
 *     <div>
 *       <p>{summary.data.paymentMethod.type}</p>
 *       {summary.data.bankAccount && (
 *         <button
 *           disabled={summary.status.isPending}
 *           onClick={() => summary.actions.onRemoveBankAccount()}
 *         >
 *           Remove {summary.data.bankAccount.name}
 *         </button>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useContractorPaymentMethodSummary({
  contractorId,
}: UseContractorPaymentMethodSummaryParams): UseContractorPaymentMethodSummaryResult {
  const paymentMethodQuery = useContractorPaymentMethodGet(
    { contractorUuid: contractorId },
    { staleTime: Infinity },
  )
  const bankAccountsQuery = useContractorPaymentMethodGetBankAccounts(
    { contractorUuid: contractorId },
    { staleTime: Infinity },
  )
  const removeMutation = useContractorPaymentMethodUpdateMutation()

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('Contractor.PaymentMethodSummary')

  const errorHandling = composeErrorHandler([paymentMethodQuery, bankAccountsQuery], {
    submitError,
    setSubmitError,
  })

  const paymentMethod = paymentMethodQuery.data?.contractorPaymentMethod
  const bankAccount = bankAccountsQuery.data?.contractorBankAccountList?.[0]

  const onRemoveBankAccount = async (): Promise<
    HookSubmitResult<ContractorPaymentMethod> | undefined
  > => {
    let submitResult: HookSubmitResult<ContractorPaymentMethod> | undefined

    await baseSubmitHandler(paymentMethod?.version, async version => {
      if (!version) {
        throw new SDKInternalError('Cannot remove bank account before payment method is loaded')
      }

      const result = await removeMutation.mutateAsync({
        request: {
          contractorUuid: contractorId,
          requestBody: { type: PAYMENT_METHODS.check, version },
        },
      })

      if (!result.contractorPaymentMethod) {
        throw new SDKInternalError('Payment method update failed')
      }

      submitResult = { mode: 'update', data: result.contractorPaymentMethod }
    })

    return submitResult
  }

  if (paymentMethodQuery.isLoading || bankAccountsQuery.isLoading || !paymentMethod) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { paymentMethod, bankAccount },
    status: {
      isFetching: paymentMethodQuery.isFetching || bankAccountsQuery.isFetching,
      isPending: removeMutation.isPending,
    },
    actions: { onRemoveBankAccount },
    errorHandling,
  }
}
