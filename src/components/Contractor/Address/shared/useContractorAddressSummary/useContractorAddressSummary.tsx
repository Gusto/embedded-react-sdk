import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsGetAddress } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import type { ContractorType } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorAddress } from '@gusto/embedded-api/models/components/contractoraddress'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Options for {@link useContractorAddressSummary}.
 *
 * @public
 */
export interface UseContractorAddressSummaryParams {
  /** The associated contractor identifier. */
  contractorId: string
}

type UseContractorAddressSummaryReady = BaseHookReady<
  {
    contractorAddress: ContractorAddress
    /** The contractor's type — drives whether the address is labelled "home" (Individual) or "business" (Business). */
    contractorType: ContractorType | undefined
  },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Return type of {@link useContractorAddressSummary}.
 *
 * @public
 */
export type UseContractorAddressSummaryResult = HookLoadingResult | UseContractorAddressSummaryReady

/**
 * Read-only data hook for the contractor Address management card.
 *
 * @remarks
 * Fetches the contractor's single address alongside the contractor entity, scoped to the
 * fields the read-view card displays. Pair with `useContractorAddressForm` to render an edit
 * form against the same record.
 *
 * @param input - See {@link UseContractorAddressSummaryParams}.
 * @returns A {@link HookLoadingResult} while loading, or the ready result with the loaded address once available.
 * @public
 *
 * @example
 * ```tsx
 * import { useContractorAddressSummary } from '@gusto/embedded-react-sdk'
 *
 * function AddressSummary({ contractorId }: { contractorId: string }) {
 *   const summary = useContractorAddressSummary({ contractorId })
 *
 *   if (summary.isLoading) return <div>Loading...</div>
 *
 *   const { contractorAddress } = summary.data
 *   return <p>{contractorAddress.city}, {contractorAddress.state}</p>
 * }
 * ```
 */
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
