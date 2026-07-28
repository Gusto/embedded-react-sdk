import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/** @internal */
export interface UseContractorCompensationSummaryParams {
  contractorId: string
}

type UseContractorCompensationSummaryReady = BaseHookReady<
  { contractor: Contractor },
  { isFetching: boolean; isPending: boolean }
>

/** @internal */
export type UseContractorCompensationSummaryResult =
  HookLoadingResult | UseContractorCompensationSummaryReady

/** @internal */
export function useContractorCompensationSummary({
  contractorId,
}: UseContractorCompensationSummaryParams): UseContractorCompensationSummaryResult {
  const contractorQuery = useContractorsGet(
    { contractorUuid: contractorId },
    { staleTime: Infinity },
  )

  const errorHandling = composeErrorHandler([contractorQuery])

  const contractor = contractorQuery.data?.contractor

  if (contractorQuery.isLoading || !contractor) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { contractor },
    status: {
      isFetching: contractorQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
