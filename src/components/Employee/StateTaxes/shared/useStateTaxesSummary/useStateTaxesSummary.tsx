import { useEmployeeTaxSetupGetStateTaxes } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeTaxSetupGetStateTaxes'
import type { EmployeeStateTaxesList } from '@gusto/embedded-api-v-2025-11-15/models/components/employeestatetaxeslist'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

export interface UseStateTaxesSummaryParams {
  employeeId: string
}

export type UseStateTaxesSummaryReady = BaseHookReady<
  { employeeStateTaxesList: EmployeeStateTaxesList[] },
  { isFetching: boolean; isPending: boolean }
>

export type UseStateTaxesSummaryResult = HookLoadingResult | UseStateTaxesSummaryReady

/**
 * Read-only data hook for the State taxes management card. Wraps
 * `useEmployeeTaxSetupGetStateTaxes` and returns the full list of
 * per-state tax records in `BaseHookReady` shape. Mutations live in
 * `useEmployeeStateTaxesForm` (the form-driven hook the edit form
 * consumes).
 */
export function useStateTaxesSummary({
  employeeId,
}: UseStateTaxesSummaryParams): UseStateTaxesSummaryResult {
  const stateTaxesQuery = useEmployeeTaxSetupGetStateTaxes(
    { employeeUuid: employeeId },
    { staleTime: Infinity },
  )

  const errorHandling = composeErrorHandler([stateTaxesQuery])

  const employeeStateTaxesList = stateTaxesQuery.data?.employeeStateTaxesList

  if (stateTaxesQuery.isLoading || !employeeStateTaxesList) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { employeeStateTaxesList },
    status: {
      isFetching: stateTaxesQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
