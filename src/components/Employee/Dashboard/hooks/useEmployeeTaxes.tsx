import { useEmployeeTaxSetupGetFederalTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetFederalTaxes'
import { useEmployeeTaxSetupGetStateTaxesSuspense } from '@gusto/embedded-api/react-query/employeeTaxSetupGetStateTaxes'
import type { GetV1EmployeesEmployeeIdFederalTaxesResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidfederaltaxes'
import type { GetV1EmployeesEmployeeIdStateTaxesResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidstatetaxes'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { HookLoadingResult, BaseHookReady } from '@/partner-hook-utils/types'

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

type UseEmployeeTaxesReady = BaseHookReady<
  {
    employeeFederalTax?: EmployeeFederalTax
    employeeStateTaxesList: EmployeeStateTax[]
  },
  { isPending: boolean }
>

export type UseEmployeeTaxesResult = HookLoadingResult | UseEmployeeTaxesReady

export function useEmployeeTaxes({ employeeId }: UseEmployeeTaxesProps): UseEmployeeTaxesResult {
  const federalTaxesQuery = useEmployeeTaxSetupGetFederalTaxesSuspense({ employeeUuid: employeeId })
  const stateTaxesQuery = useEmployeeTaxSetupGetStateTaxesSuspense({ employeeUuid: employeeId })

  const employeeFederalTax = federalTaxesQuery.data.employeeFederalTax
  const employeeStateTaxesList = stateTaxesQuery.data.employeeStateTaxesList

  const isPending = federalTaxesQuery.isFetching || stateTaxesQuery.isFetching
  const isLoading = !employeeFederalTax && isPending

  const errorHandling = composeErrorHandler([federalTaxesQuery, stateTaxesQuery])

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
