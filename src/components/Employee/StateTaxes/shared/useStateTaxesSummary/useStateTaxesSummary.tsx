import { useEmployeeTaxSetupGetStateTaxes } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeTaxSetupGetStateTaxes'
import type { EmployeeStateTaxesList } from '@gusto/embedded-api-v-2026-02-01/models/components/employeestatetaxeslist'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/** @internal */
export interface UseStateTaxesSummaryParams {
  employeeId: string
}

type UseStateTaxesSummaryReady = BaseHookReady<
  { employeeStateTaxesList: EmployeeStateTaxesList[] },
  { isFetching: boolean; isPending: boolean }
>

/** @internal */
export type UseStateTaxesSummaryResult = HookLoadingResult | UseStateTaxesSummaryReady

/** @internal */
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
