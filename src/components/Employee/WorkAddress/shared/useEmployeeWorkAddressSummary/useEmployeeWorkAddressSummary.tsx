import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Params for {@link useEmployeeWorkAddressSummary}.
 *
 * @public
 */
export interface UseEmployeeWorkAddressSummaryParams {
  /** The associated employee identifier. */
  employeeId: string
}

type UseEmployeeWorkAddressSummaryReady = BaseHookReady<
  { currentWorkAddress: EmployeeWorkAddress | undefined },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Return type of {@link useEmployeeWorkAddressSummary}.
 *
 * @public
 */
export type UseEmployeeWorkAddressSummaryResult =
  HookLoadingResult | UseEmployeeWorkAddressSummaryReady

/**
 * Read-only data hook for the employee work address summary card.
 *
 * @remarks
 * Fetches the employee's work addresses and selects the active row.
 *
 * @param params - {@link UseEmployeeWorkAddressSummaryParams}
 * @returns A {@link HookLoadingResult} while loading, or the ready state with `currentWorkAddress` once data is available.
 * @public
 */
export function useEmployeeWorkAddressSummary({
  employeeId,
}: UseEmployeeWorkAddressSummaryParams): UseEmployeeWorkAddressSummaryResult {
  const workAddressesQuery = useEmployeeAddressesGetWorkAddresses(
    { employeeId },
    { staleTime: Infinity },
  )

  const errorHandling = composeErrorHandler([workAddressesQuery])

  const workAddressesList = workAddressesQuery.data?.employeeWorkAddressesList

  if (workAddressesQuery.isLoading || !workAddressesList) {
    return { isLoading: true, errorHandling }
  }

  const currentWorkAddress = workAddressesList.find(address => address.active)

  return {
    isLoading: false,
    data: { currentWorkAddress },
    status: {
      isFetching: workAddressesQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
