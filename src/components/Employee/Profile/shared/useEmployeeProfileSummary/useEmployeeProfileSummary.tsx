import { useEmployeesGet } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesGet'
import type { Employee } from '@gusto/embedded-api-v-2025-11-15/models/components/employee'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

export interface UseEmployeeProfileSummaryParams {
  employeeId: string
}

type UseEmployeeProfileSummaryReady = BaseHookReady<
  { employee: Employee },
  { isFetching: boolean; isPending: boolean }
>

export type UseEmployeeProfileSummaryResult = HookLoadingResult | UseEmployeeProfileSummaryReady

/**
 * Read-only data hook for the Profile management card. Wraps `useEmployeesGet`
 * without `?include=all_compensations` so the basic-details surface fetches
 * only the fields it displays. Mutations live in `useEmployeeDetailsForm`.
 */
export function useEmployeeProfileSummary({
  employeeId,
}: UseEmployeeProfileSummaryParams): UseEmployeeProfileSummaryResult {
  const employeeQuery = useEmployeesGet({ employeeId }, { staleTime: Infinity })

  const errorHandling = composeErrorHandler([employeeQuery])

  const employee = employeeQuery.data?.employee

  if (employeeQuery.isLoading || !employee) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { employee },
    status: {
      isFetching: employeeQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
