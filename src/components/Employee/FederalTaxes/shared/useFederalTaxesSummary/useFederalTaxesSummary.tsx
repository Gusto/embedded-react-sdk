import { useEmployeeTaxSetupGetFederalTaxes } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeTaxSetupGetFederalTaxes'
import type { GetV1EmployeesEmployeeIdFederalTaxesResponse } from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1employeesemployeeidfederaltaxes'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

type EmployeeFederalTax = NonNullable<
  GetV1EmployeesEmployeeIdFederalTaxesResponse['employeeFederalTax']
>

export interface UseFederalTaxesSummaryParams {
  employeeId: string
}

export type UseFederalTaxesSummaryReady = BaseHookReady<
  { employeeFederalTax: EmployeeFederalTax | undefined },
  { isFetching: boolean; isPending: boolean }
>

export type UseFederalTaxesSummaryResult = HookLoadingResult | UseFederalTaxesSummaryReady

/**
 * Read-only data hook for the Federal Taxes management card. Wraps
 * `useEmployeeTaxSetupGetFederalTaxes` and returns the loaded federal-tax
 * record. Mutations live in `useFederalTaxesForm`.
 */
export function useFederalTaxesSummary({
  employeeId,
}: UseFederalTaxesSummaryParams): UseFederalTaxesSummaryResult {
  const federalTaxesQuery = useEmployeeTaxSetupGetFederalTaxes(
    { employeeUuid: employeeId },
    { staleTime: Infinity },
  )

  const errorHandling = composeErrorHandler([federalTaxesQuery])

  if (federalTaxesQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { employeeFederalTax: federalTaxesQuery.data?.employeeFederalTax },
    status: {
      isFetching: federalTaxesQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
