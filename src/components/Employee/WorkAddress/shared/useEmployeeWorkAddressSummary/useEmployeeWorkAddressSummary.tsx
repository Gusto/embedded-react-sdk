import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeAddressesGetWorkAddresses'
import type { EmployeeWorkAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeworkaddress'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

export interface UseEmployeeWorkAddressSummaryParams {
  employeeId: string
}

type UseEmployeeWorkAddressSummaryReady = BaseHookReady<
  { currentWorkAddress: EmployeeWorkAddress | undefined },
  { isFetching: boolean; isPending: boolean }
>

export type UseEmployeeWorkAddressSummaryResult =
  | HookLoadingResult
  | UseEmployeeWorkAddressSummaryReady

/**
 * Read-only data hook for the Work address management card. Wraps
 * `useEmployeeAddressesGetWorkAddresses` and selects the active row, returning
 * `BaseHookReady`-shaped data. Mutations live in the work-address forms hook.
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
