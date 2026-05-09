import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { useJobForm } from './useJobForm'
import type { UseJobFormProps, UseJobFormResult } from './useJobForm'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'

export type UseCurrentJobFormProps = Omit<UseJobFormProps, 'jobId'>

/**
 * Resolves the employee's primary job and threads its UUID into `useJobForm`.
 * When no primary job exists (e.g. employee has no jobs yet) the wrapped hook
 * lands in `create` mode.
 *
 * Mirrors `useCurrentHomeAddressForm` / `useCurrentWorkAddressForm` exactly:
 * the prop surface is `Omit<UseJobFormProps, 'jobId'>` and the wrapper takes
 * no additional parameters. Partners needing to edit a specific (e.g.
 * secondary) job should use the core `useJobForm` directly with `jobId`.
 */
export function useCurrentJobForm(props: UseCurrentJobFormProps): UseJobFormResult {
  const { employeeId } = props

  const jobsQuery = useJobsAndCompensationsGetJobs(
    { employeeId: employeeId ?? '' },
    { enabled: !!employeeId },
  )

  const jobs = jobsQuery.data?.jobs
  const primaryJob = jobs?.find(job => job.primary)

  const base = useJobForm({
    ...props,
    jobId: primaryJob?.uuid,
  })

  const listInitiallyBlocking = jobsQuery.isLoading && !jobsQuery.data

  if (listInitiallyBlocking) {
    return {
      isLoading: true as const,
      errorHandling: composeErrorHandler([jobsQuery]),
    }
  }

  if (base.isLoading) {
    return {
      ...base,
      errorHandling: composeErrorHandler([jobsQuery, { errorHandling: base.errorHandling }]),
    }
  }

  return {
    ...base,
    errorHandling: composeErrorHandler([jobsQuery, { errorHandling: base.errorHandling }]),
  }
}
