import { useEmployeeAddressesGet } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeAddressesGet'
import type { EmployeeAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeaddress'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

export interface UseHomeAddressSummaryParams {
  employeeId: string
}

export type UseHomeAddressSummaryReady = BaseHookReady<
  {
    currentHomeAddress: EmployeeAddress | undefined
    employeeAddressList: EmployeeAddress[]
  },
  { isFetching: boolean; isPending: boolean }
>

export type UseHomeAddressSummaryResult = HookLoadingResult | UseHomeAddressSummaryReady

/**
 * Read-only data hook for the Home address management card. Wraps
 * `useEmployeeAddressesGet` and surfaces the active row plus the full
 * list (the latter lets partners build their own history/pending UI).
 * Mutations live in `useHomeAddressManagement` (the form-driven hook
 * the edit form consumes).
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
