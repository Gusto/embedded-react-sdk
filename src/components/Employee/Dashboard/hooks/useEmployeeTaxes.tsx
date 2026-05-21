import { useEmployeeTaxSetupGetFederalTaxes } from '@gusto/embedded-api/react-query/employeeTaxSetupGetFederalTaxes'
import { useEmployeeTaxSetupGetStateTaxes } from '@gusto/embedded-api/react-query/employeeTaxSetupGetStateTaxes'
import type { GetV1EmployeesEmployeeIdFederalTaxesResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidfederaltaxes'
import type { GetV1EmployeesEmployeeIdStateTaxesResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidstatetaxes'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { HookErrorHandling } from '@/partner-hook-utils/types'

type EmployeeFederalTax = NonNullable<
  GetV1EmployeesEmployeeIdFederalTaxesResponse['employeeFederalTax']
>
type EmployeeStateTax = NonNullable<
  GetV1EmployeesEmployeeIdStateTaxesResponse['employeeStateTaxesList']
>[number]

export interface UseEmployeeTaxesProps {
  employeeId: string
}

export interface UseEmployeeTaxesResult {
  data: {
    employeeFederalTax?: EmployeeFederalTax
    employeeStateTaxesList: EmployeeStateTax[]
  }
  status: {
    isPending: boolean
    isFederalTaxesLoading: boolean
    isStateTaxesLoading: boolean
  }
  errorHandling: HookErrorHandling
}

/**
 * Phase B: non-Suspense queries so the federal and state tax cards
 * paint independently. `isFederalTaxesLoading` and `isStateTaxesLoading`
 * let TaxesView render a per-card skeleton while the box header stays
 * visible.
 */
export function useEmployeeTaxes({ employeeId }: UseEmployeeTaxesProps): UseEmployeeTaxesResult {
  // staleTime: Infinity — see useEmployeeCompensation for rationale (SDK
  // QueryClient invalidates on any mutation success).
  const federalTaxesQuery = useEmployeeTaxSetupGetFederalTaxes(
    { employeeUuid: employeeId },
    { staleTime: Infinity },
  )
  const stateTaxesQuery = useEmployeeTaxSetupGetStateTaxes(
    { employeeUuid: employeeId },
    { staleTime: Infinity },
  )

  return {
    data: {
      employeeFederalTax: federalTaxesQuery.data?.employeeFederalTax,
      employeeStateTaxesList: stateTaxesQuery.data?.employeeStateTaxesList ?? [],
    },
    status: {
      isPending: federalTaxesQuery.isFetching || stateTaxesQuery.isFetching,
      isFederalTaxesLoading: federalTaxesQuery.isLoading,
      isStateTaxesLoading: stateTaxesQuery.isLoading,
    },
    errorHandling: composeErrorHandler([federalTaxesQuery, stateTaxesQuery]),
  }
}
