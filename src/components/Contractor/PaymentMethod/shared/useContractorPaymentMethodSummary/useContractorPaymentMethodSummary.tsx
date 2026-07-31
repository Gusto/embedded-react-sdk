import { useContractorPaymentMethodGet } from '@gusto/embedded-api/react-query/contractorPaymentMethodGet'
import { useContractorPaymentMethodGetBankAccounts } from '@gusto/embedded-api/react-query/contractorPaymentMethodGetBankAccounts'
import { useContractorPaymentMethodUpdateMutation } from '@gusto/embedded-api/react-query/contractorPaymentMethodUpdate'
import type { ContractorPaymentMethod } from '@gusto/embedded-api/models/components/contractorpaymentmethod'
import type { ContractorBankAccount } from '@gusto/embedded-api/models/components/contractorbankaccount'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult, HookSubmitResult } from '@/partner-hook-utils/types'
import { SDKInternalError } from '@/types/sdkError'
import { PAYMENT_METHODS } from '@/shared/constants'

/** @internal */
export interface UseContractorPaymentMethodSummaryParams {
  contractorId: string
}

interface UseContractorPaymentMethodSummaryReady extends BaseHookReady<
  {
    paymentMethod: ContractorPaymentMethod
    bankAccount: ContractorBankAccount | undefined
  },
  { isFetching: boolean; isPending: boolean }
> {
  actions: {
    /** Reverts the contractor's payment method to Check. */
    onRemoveBankAccount: () => Promise<HookSubmitResult<ContractorPaymentMethod> | undefined>
  }
}

/** @internal */
export type UseContractorPaymentMethodSummaryResult =
  HookLoadingResult | UseContractorPaymentMethodSummaryReady

/** @internal */
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

  const errorHandling = composeErrorHandler([paymentMethodQuery, bankAccountsQuery])

  const paymentMethod = paymentMethodQuery.data?.contractorPaymentMethod
  const bankAccount = bankAccountsQuery.data?.contractorBankAccountList?.[0]

  const onRemoveBankAccount = async (): Promise<
    HookSubmitResult<ContractorPaymentMethod> | undefined
  > => {
    if (!paymentMethod?.version) {
      throw new SDKInternalError('Cannot remove bank account before payment method is loaded')
    }
    const result = await removeMutation.mutateAsync({
      request: {
        contractorUuid: contractorId,
        requestBody: { type: PAYMENT_METHODS.check, version: paymentMethod.version },
      },
    })
    if (!result.contractorPaymentMethod) {
      throw new SDKInternalError('Payment method update failed')
    }
    return { mode: 'update', data: result.contractorPaymentMethod }
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
