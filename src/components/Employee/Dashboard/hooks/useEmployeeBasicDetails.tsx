import { useMemo } from 'react'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeeAddressesGetSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeeAddressesGetWorkAddressesSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { buildQueryErrorHandling } from '@/helpers/buildQueryErrorHandling'
import type { HookLoadingResult, BaseHookReady } from '@/types/sdkHooks'

export interface UseEmployeeBasicDetailsProps {
  employeeId: string
}

interface UseEmployeeBasicDetailsReady extends Omit<BaseHookReady, 'data' | 'status'> {
  data: {
    employee: Employee
    currentHomeAddress?: EmployeeAddress
    currentWorkAddress?: EmployeeWorkAddress
  }
  status: {
    isPending: boolean
  }
}

export type UseEmployeeBasicDetailsResult = HookLoadingResult | UseEmployeeBasicDetailsReady

export function useEmployeeBasicDetails({
  employeeId,
}: UseEmployeeBasicDetailsProps): UseEmployeeBasicDetailsResult {
  const employeeQuery = useEmployeesGetSuspense({ employeeId })
  const addressesQuery = useEmployeeAddressesGetSuspense({ employeeId })
  const workAddressesQuery = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })

  const employee = employeeQuery.data.employee
  const employeeAddressList = addressesQuery.data.employeeAddressList
  const employeeWorkAddressesList = workAddressesQuery.data.employeeWorkAddressesList

  // Derive current addresses
  const currentHomeAddress = useMemo(() => {
    return employeeAddressList?.find(address => address.active)
  }, [employeeAddressList])

  const currentWorkAddress = useMemo(() => {
    return employeeWorkAddressesList?.find(address => address.active)
  }, [employeeWorkAddressesList])

  const isPending =
    employeeQuery.isFetching || addressesQuery.isFetching || workAddressesQuery.isFetching
  const isLoading = !employee && isPending

  const errorHandling = buildQueryErrorHandling([
    employeeQuery,
    addressesQuery,
    workAddressesQuery,
  ])

  if (isLoading) {
    return {
      isLoading: true,
      errorHandling,
    }
  }

  return {
    isLoading: false,
    data: {
      employee: employee!,
      currentHomeAddress,
      currentWorkAddress,
    },
    status: {
      isPending,
    },
    errorHandling,
  }
}
