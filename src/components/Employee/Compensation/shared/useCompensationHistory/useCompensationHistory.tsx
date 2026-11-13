import { useMemo } from 'react'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { GetV1EmployeesEmployeeIdJobsQueryParamInclude } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidjobs'
import { getCompensationHistory, type JobCompensationHistory } from '../getCompensationHistory'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Props for {@link useCompensationHistory}.
 *
 * @internal
 */
export interface UseCompensationHistoryProps {
  /** The associated employee identifier. */
  employeeId: string
}

/**
 * Ready state of {@link useCompensationHistory}.
 *
 * @internal
 * @interface
 */
export type UseCompensationHistoryReady = BaseHookReady<
  {
    /** One entry per job that has at least one effective-dated compensation. */
    jobs: JobCompensationHistory[]
  },
  { isFetching: boolean }
>

/**
 * Return type of {@link useCompensationHistory}.
 *
 * @internal
 */
export type UseCompensationHistoryResult = HookLoadingResult | UseCompensationHistoryReady

/**
 * Read-only data hook backing `EmployeeManagement.CompensationHistory`: an employee's
 * compensation history across all of their jobs — every past, current, and upcoming pay rate
 * with its effective date.
 *
 * @remarks
 * Fetches jobs with `include=all_compensations` so the full effective-dated
 * history is returned rather than only the current compensation, then tags each
 * record as `past`, `current`, or `upcoming` relative to today. Entries are
 * ordered newest effective date first. Shares its query with
 * `useCompensationManagement`, including `staleTime: Infinity`.
 *
 * @param props - See {@link UseCompensationHistoryProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseCompensationHistoryReady} once ready.
 * @internal
 */
export function useCompensationHistory({
  employeeId,
}: UseCompensationHistoryProps): UseCompensationHistoryResult {
  const jobsQuery = useJobsAndCompensationsGetJobs(
    { employeeId, include: GetV1EmployeesEmployeeIdJobsQueryParamInclude.AllCompensations },
    { staleTime: Infinity },
  )

  const jobs = useMemo(() => getCompensationHistory(jobsQuery.data?.jobs), [jobsQuery.data?.jobs])

  const errorHandling = composeErrorHandler([jobsQuery])

  if (jobsQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { jobs },
    status: {
      isFetching: jobsQuery.isFetching,
    },
    errorHandling,
  }
}
