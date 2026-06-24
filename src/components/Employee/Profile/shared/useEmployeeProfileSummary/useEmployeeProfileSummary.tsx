import { useEmployeesGet } from '@gusto/embedded-api-v-2026-02-01/react-query/employeesGet'
import type { Employee } from '@gusto/embedded-api-v-2026-02-01/models/components/employee'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Options for {@link useEmployeeProfileSummary}.
 *
 * @public
 */
export interface UseEmployeeProfileSummaryParams {
  /** The associated employee identifier. */
  employeeId: string
}

type UseEmployeeProfileSummaryReady = BaseHookReady<
  { employee: Employee },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Return type of {@link useEmployeeProfileSummary}.
 *
 * @public
 */
export type UseEmployeeProfileSummaryResult = HookLoadingResult | UseEmployeeProfileSummaryReady

/**
 * Read-only data hook for the basic-details Profile card.
 *
 * @remarks
 * Fetches a single employee record scoped to the fields the
 * basic-details surface displays. Pair with {@link useEmployeeDetailsForm}
 * to render an edit form against the same record.
 *
 * @param input - See {@link UseEmployeeProfileSummaryParams}.
 * @returns A {@link HookLoadingResult} while loading, or the ready result with the loaded employee once available.
 * @public
 *
 * @example
 * ```tsx
 * import { useEmployeeProfileSummary } from '@gusto/embedded-react-sdk'
 *
 * function ProfileSummary({ employeeId }: { employeeId: string }) {
 *   const summary = useEmployeeProfileSummary({ employeeId })
 *
 *   if (summary.isLoading) return <div>Loading...</div>
 *
 *   const { employee } = summary.data
 *   return <h2>{employee.firstName} {employee.lastName}</h2>
 * }
 * ```
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
