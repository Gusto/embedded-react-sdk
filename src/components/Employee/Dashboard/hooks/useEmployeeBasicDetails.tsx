import { useMemo } from 'react'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeeAddressesGet } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady } from '@/partner-hook-utils/types'

export interface UseEmployeeBasicDetailsProps {
  employeeId: string
}

export type UseEmployeeBasicDetailsResult = BaseHookReady<
  {
    employee?: Employee
    currentHomeAddress?: EmployeeAddress
    currentWorkAddress?: EmployeeWorkAddress
  },
  {
    isPending: boolean
    isEmployeeLoading: boolean
    isHomeAddressLoading: boolean
    isWorkAddressLoading: boolean
  }
>

/**
 * Phase B: each query runs non-Suspense so the three cards (employee
 * info, home address, work address) can paint independently. The
 * consuming view branches on the per-query loading flags to render
 * skeletons inside the box bodies.
 */
export function useEmployeeBasicDetails({
  employeeId,
}: UseEmployeeBasicDetailsProps): UseEmployeeBasicDetailsResult {
  // staleTime: Infinity — see useEmployeeCompensation for rationale (SDK
  // QueryClient invalidates on any mutation success).
  const employeeQuery = useEmployeesGet(
    { employeeId, include: ['all_compensations'] },
    { staleTime: Infinity },
  )
  const addressesQuery = useEmployeeAddressesGet({ employeeId }, { staleTime: Infinity })
  const workAddressesQuery = useEmployeeAddressesGetWorkAddresses(
    { employeeId },
    { staleTime: Infinity },
  )

  const employee = employeeQuery.data?.employee
  const employeeAddressList = addressesQuery.data?.employeeAddressList
  const employeeWorkAddressesList = workAddressesQuery.data?.employeeWorkAddressesList

  const currentHomeAddress = useMemo(() => {
    return employeeAddressList?.find(address => address.active)
  }, [employeeAddressList])

  const currentWorkAddress = useMemo(() => {
    return employeeWorkAddressesList?.find(address => address.active)
  }, [employeeWorkAddressesList])

  return {
    isLoading: false,
    data: {
      employee,
      currentHomeAddress,
      currentWorkAddress,
    },
    status: {
      isPending:
        employeeQuery.isFetching || addressesQuery.isFetching || workAddressesQuery.isFetching,
      isEmployeeLoading: employeeQuery.isLoading,
      isHomeAddressLoading: addressesQuery.isLoading,
      isWorkAddressLoading: workAddressesQuery.isLoading,
    },
    errorHandling: composeErrorHandler([employeeQuery, addressesQuery, workAddressesQuery]),
  }
}
