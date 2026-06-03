import { useMemo } from 'react'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeAddressesGetWorkAddresses'
import type { EmployeeWorkAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeworkaddress'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady } from '@/partner-hook-utils/types'

export interface UseEmployeeBasicDetailsProps {
  employeeId: string
}

export type UseEmployeeBasicDetailsResult = BaseHookReady<
  {
    currentWorkAddress?: EmployeeWorkAddress
  },
  {
    isPending: boolean
    isWorkAddressLoading: boolean
  }
>

/**
 * Tab-mounted hook for the Basic details tab. After the Profile and
 * Home address cards moved to standalone self-fetching surfaces, this
 * hook only feeds the inline Work address card. It will be deleted
 * once the Work address card migrates to its own self-fetching block.
 */
export function useEmployeeBasicDetails({
  employeeId,
}: UseEmployeeBasicDetailsProps): UseEmployeeBasicDetailsResult {
  // staleTime: Infinity — the SDK QueryClient invalidates on any mutation
  // success, so individual hooks don't need their own refetch policy.
  const workAddressesQuery = useEmployeeAddressesGetWorkAddresses(
    { employeeId },
    { staleTime: Infinity },
  )

  const employeeWorkAddressesList = workAddressesQuery.data?.employeeWorkAddressesList

  const currentWorkAddress = useMemo(() => {
    return employeeWorkAddressesList?.find(address => address.active)
  }, [employeeWorkAddressesList])

  return {
    isLoading: false,
    data: {
      currentWorkAddress,
    },
    status: {
      isPending: workAddressesQuery.isFetching,
      isWorkAddressLoading: workAddressesQuery.isLoading,
    },
    errorHandling: composeErrorHandler([workAddressesQuery]),
  }
}
