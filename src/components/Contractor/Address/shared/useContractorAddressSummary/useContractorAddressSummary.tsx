import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsGetAddress } from '@gusto/embedded-api/react-query/contractorsGetAddress'
import type { ContractorType } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorAddress } from '@gusto/embedded-api/models/components/contractoraddress'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Parameters for {@link useContractorAddressSummary}.
 *
 * @public
 */
export interface UseContractorAddressSummaryParams {
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Ready-state shape returned by {@link useContractorAddressSummary} once the address has loaded.
 *
 * @public
 * @interface
 */
export type UseContractorAddressSummaryReady = BaseHookReady<
  {
    contractorAddress: ContractorAddress
    contractorType: ContractorType | undefined
  },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Result of {@link useContractorAddressSummary} — a discriminated union of loading and ready states.
 *
 * @public
 */
export type UseContractorAddressSummaryResult = HookLoadingResult | UseContractorAddressSummaryReady

/**
 * Standalone data hook for a contractor's address.
 *
 * @remarks
 * Read-only. Editing an address goes through `useContractorAddressForm`, so this hook exposes no
 * actions.
 *
 * `data.contractorType` comes from a second request for the contractor itself, and is supplied
 * because the same address means different things by type: an individual's address is a home
 * address, a business's is a business address. It is `undefined` if the contractor resolved
 * without a `type`.
 *
 * `status.isPending` is always `false` — it is present so the status shape matches the other
 * contractor summary hooks, one of which does run a mutation.
 *
 * @param params - See {@link UseContractorAddressSummaryParams}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseContractorAddressSummaryReady} once the address has arrived.
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
 *   const { contractorAddress, contractorType } = summary.data
 *
 *   return (
 *     <section>
 *       <h2>{contractorType === 'Business' ? 'Business address' : 'Home address'}</h2>
 *       <p>{contractorAddress.street1}</p>
 *       <p>
 *         {contractorAddress.city}, {contractorAddress.state} {contractorAddress.zip}
 *       </p>
 *     </section>
 *   )
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
  const contractorType = contractorQuery.data?.contractorShow?.type

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
