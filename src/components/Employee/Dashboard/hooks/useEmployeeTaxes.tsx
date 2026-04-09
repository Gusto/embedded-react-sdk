import { useEmployeeTaxSetupGetFederalTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetFederalTaxes'
import { useEmployeeTaxSetupGetStateTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetStateTaxes'
import type { GetV1EmployeesEmployeeIdFederalTaxesResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidfederaltaxes'
import type { GetV1EmployeesEmployeeIdStateTaxesResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidstatetaxes'
import { buildQueryErrorHandling } from '@/helpers/buildQueryErrorHandling'
import type { HookLoadingResult, BaseHookReady } from '@/types/sdkHooks'

// Derive types from operations responses
type EmployeeFederalTax = NonNullable<
  GetV1EmployeesEmployeeIdFederalTaxesResponse['employeeFederalTax']
>
type EmployeeStateTax = NonNullable<
  GetV1EmployeesEmployeeIdStateTaxesResponse['employeeStateTaxesList']
>[number]

export interface UseEmployeeTaxesProps {
  employeeId: string
}

interface UseEmployeeTaxesReady extends Omit<BaseHookReady, 'data' | 'status'> {
  data: {
    employeeFederalTax?: EmployeeFederalTax
    employeeStateTaxesList: EmployeeStateTax[]
  }
  status: {
    isPending: boolean
  }
}

export type UseEmployeeTaxesResult = HookLoadingResult | UseEmployeeTaxesReady

export function useEmployeeTaxes({ employeeId }: UseEmployeeTaxesProps): UseEmployeeTaxesResult {
  const federalTaxesQuery = useEmployeeTaxSetupGetFederalTaxesSuspense({ employeeUuid: employeeId })
  const stateTaxesQuery = useEmployeeTaxSetupGetStateTaxesSuspense({ employeeUuid: employeeId })

  const employeeFederalTax = federalTaxesQuery.data.employeeFederalTax
  const employeeStateTaxesList = stateTaxesQuery.data.employeeStateTaxesList

  const isPending = federalTaxesQuery.isFetching || stateTaxesQuery.isFetching
  const isLoading = !employeeFederalTax && isPending

  const errorHandling = buildQueryErrorHandling([federalTaxesQuery, stateTaxesQuery])

  if (isLoading) {
    return {
      isLoading: true,
      errorHandling,
    }
  }

  return {
    isLoading: false,
    data: {
      employeeFederalTax,
      employeeStateTaxesList: employeeStateTaxesList || [],
    },
    status: {
      isPending,
    },
    errorHandling,
  }
}
