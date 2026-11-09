import { useMemo } from 'react'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { GetV1EmployeesEmployeeIdJobsQueryParamInclude } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidjobs'
import { getCompensationHistory, type JobCompensationHistory } from '../getCompensationHistory'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Props for {@link useCompensationHistory}.
 *
 * @alpha
 */
export interface UseCompensationHistoryProps {
  /** The associated employee identifier. */
  employeeId: string
}

/**
 * Ready state of {@link useCompensationHistory}.
 *
 * @alpha
 * @interface
 */
export type UseCompensationHistoryReady = BaseHookReady<
  {
    /** One entry per job that has at least one effective-dated compensation. */
    jobs: JobCompensationHistory[]
    /** Whether the employee has more than one job with compensation history. */
    hasMultipleJobs: boolean
  },
  { isFetching: boolean }
>

/**
 * Return type of {@link useCompensationHistory}.
 *
 * @alpha
 */
export type UseCompensationHistoryResult = HookLoadingResult | UseCompensationHistoryReady

/**
 * Read-only data hook exposing an employee's compensation history across all of
 * their jobs — every past, current, and upcoming pay rate with its effective date.
 *
 * @remarks
 * Fetches jobs with `include=all_compensations` so the full effective-dated
 * history is returned rather than only the current compensation, then tags each
 * record as `past`, `current`, or `upcoming` relative to today. Entries are
 * ordered newest effective date first.
 *
 * This hook performs no mutations. Editing compensation, scheduling a
 * future-dated change, or cancelling one is handled by `useCompensationForm`
 * and the Compensation management card.
 *
 * @param props - See {@link UseCompensationHistoryProps}.
 * @returns The loading state, or the ready state carrying the per-job history.
 * @alpha
 *
 * @example
 * ```tsx
 * function CompensationHistoryList({ employeeId }: { employeeId: string }) {
 *   const history = useCompensationHistory({ employeeId })
 *
 *   if (history.isLoading) return <Spinner />
 *
 *   return (
 *     <>
 *       {history.data.jobs.map(job => (
 *         <section key={job.jobId}>
 *           <h2>{job.jobTitle}</h2>
 *           <ul>
 *             {job.entries.map(entry => (
 *               <li key={entry.compensationId}>
 *                 {entry.effectiveDate}: {entry.rate} per {entry.paymentUnit} ({entry.status})
 *               </li>
 *             ))}
 *           </ul>
 *         </section>
 *       ))}
 *     </>
 *   )
 * }
 * ```
 */
export function useCompensationHistory({
  employeeId,
}: UseCompensationHistoryProps): UseCompensationHistoryResult {
  // staleTime: Infinity mirrors useCompensationManagement — the SDK QueryClient
  // invalidates every SDK query on any mutation success, so post-write freshness
  // is preserved without a background refetch on each subscriber re-mount.
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
    data: {
      jobs,
      hasMultipleJobs: jobs.length > 1,
    },
    status: {
      isFetching: jobsQuery.isFetching,
    },
    errorHandling,
  }
}
