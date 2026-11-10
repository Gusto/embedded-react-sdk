import { usePaySchedulesGetAll } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesGetAssignments } from '@gusto/embedded-api/react-query/paySchedulesGetAssignments'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payschedulelistitem'
import type { PayScheduleAssignmentType } from '@gusto/embedded-api/models/components/payscheduleassignment'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Parameters accepted by {@link useCompanyPaySchedulesSummary}.
 *
 * @internal
 */
export interface UseCompanyPaySchedulesSummaryParams {
  /** UUID of the company whose pay schedules are being read. */
  companyId: string
}

type UseCompanyPaySchedulesSummaryReady = BaseHookReady<
  {
    schedules: PayScheduleShow[]
    assignmentType: PayScheduleAssignmentType | undefined
  },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Discriminated union returned by {@link useCompanyPaySchedulesSummary} — either the loading state or the ready state carrying the company's pay schedules and how they are assigned.
 *
 * @internal
 */
export type UseCompanyPaySchedulesSummaryResult =
  HookLoadingResult | UseCompanyPaySchedulesSummaryReady

/**
 * Read-only data hook for the company Pay schedules management card. Wraps
 * `usePaySchedulesGetAll` and `usePaySchedulesGetAssignments`, returning the
 * company's active schedules alongside the assignment mode that determines how
 * employees map onto them. Mutations live in `CompanyManagement.PaySchedule`.
 *
 * @remarks
 * Inactive schedules (those with no employees assigned) are left out, so the
 * list agrees with the assignment mode — a company switched back to a single
 * schedule can still have its former schedules on file. If none is active, every
 * schedule is returned rather than an empty list, matching the fallback in
 * `PayScheduleOverview`.
 *
 * Reports the assignment mode only, not the per-employee or per-department
 * mapping — resolving that needs the company's full roster or department list,
 * which is a heavier fetch than a summary card warrants.
 *
 * @param params - See {@link UseCompanyPaySchedulesSummaryParams}.
 * @returns See {@link UseCompanyPaySchedulesSummaryResult}.
 * @internal
 */
export function useCompanyPaySchedulesSummary({
  companyId,
}: UseCompanyPaySchedulesSummaryParams): UseCompanyPaySchedulesSummaryResult {
  const paySchedulesQuery = usePaySchedulesGetAll({ companyId }, { staleTime: Infinity })
  const assignmentsQuery = usePaySchedulesGetAssignments({ companyId }, { staleTime: Infinity })

  const errorHandling = composeErrorHandler([paySchedulesQuery, assignmentsQuery])

  if (paySchedulesQuery.isLoading || assignmentsQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  const allSchedules = paySchedulesQuery.data?.payScheduleShowResponse ?? []
  const activeSchedules = allSchedules.filter(schedule => schedule.active)

  return {
    isLoading: false,
    data: {
      schedules: activeSchedules.length > 0 ? activeSchedules : allSchedules,
      assignmentType: assignmentsQuery.data?.payScheduleAssignment?.type ?? undefined,
    },
    status: {
      isFetching: paySchedulesQuery.isFetching || assignmentsQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
