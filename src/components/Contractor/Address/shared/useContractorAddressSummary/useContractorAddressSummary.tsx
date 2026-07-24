import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsGetAddress } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import type { ContractorType } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorAddress } from '@gusto/embedded-api/models/components/contractoraddress'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/** @internal */
export interface UseContractorAddressSummaryParams {
  contractorId: string
}

type UseContractorAddressSummaryReady = BaseHookReady<
  {
    contractorAddress: ContractorAddress
    contractorType: ContractorType | undefined
  },
  { isFetching: boolean; isPending: boolean }
>

/** @internal */
export type UseContractorAddressSummaryResult = HookLoadingResult | UseContractorAddressSummaryReady

/** @internal */
export function useContractorAddressSummary({
  contractorId,
}: UseContractorAddressSummaryParams): UseContractorAddressSummaryResult {
  const contractorQuery = useContractorsGet(
    { contractorUuid: contractorId },
    { staleTime: Infinity },
  )
  const addressQuery = useContractorsGetAddress(
    { contractorUuid: contractorId },
    { staleTime: Infinity },
  )

  const errorHandling = composeErrorHandler([contractorQuery, addressQuery])

  const contractorAddress = addressQuery.data?.contractorAddress
  const contractorType = contractorQuery.data?.contractor?.type

  if (contractorQuery.isLoading || addressQuery.isLoading || !contractorAddress) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { contractorAddress, contractorType },
    status: {
      isFetching: contractorQuery.isFetching || addressQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
