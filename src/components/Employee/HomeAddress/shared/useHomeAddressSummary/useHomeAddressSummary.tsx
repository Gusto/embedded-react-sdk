import { useEmployeeAddressesGet } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeAddressesGet'
import type { EmployeeAddress } from '@gusto/embedded-api-v-2026-02-01/models/components/employeeaddress'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Params for {@link useHomeAddressSummary}.
 *
 * @public
 */
export interface UseHomeAddressSummaryParams {
  /** The associated employee identifier. */
  employeeId: string
}

type UseHomeAddressSummaryReady = BaseHookReady<
  {
    currentHomeAddress: EmployeeAddress | undefined
    employeeAddressList: EmployeeAddress[]
  },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Return type of {@link useHomeAddressSummary}.
 *
 * @public
 */
export type UseHomeAddressSummaryResult = HookLoadingResult | UseHomeAddressSummaryReady

/**
 * Read-only headless hook returning the employee's active home address and full address list.
 *
 * @remarks
 * Use {@link useHomeAddressManagement} when you need create, update, or delete actions.
 *
 * @param params - {@link UseHomeAddressSummaryParams}
 * @returns A {@link HookLoadingResult} while loading, or the ready state with `currentHomeAddress` and `employeeAddressList`.
 * @public
 */
export function useHomeAddressSummary({
  employeeId,
}: UseHomeAddressSummaryParams): UseHomeAddressSummaryResult {
  const addressesQuery = useEmployeeAddressesGet({ employeeId }, { staleTime: Infinity })

  const errorHandling = composeErrorHandler([addressesQuery])

  if (addressesQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  const employeeAddressList = addressesQuery.data?.employeeAddressList ?? []
  const currentHomeAddress = employeeAddressList.find(address => address.active)

  return {
    isLoading: false,
    data: { currentHomeAddress, employeeAddressList },
    status: {
      isFetching: addressesQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
