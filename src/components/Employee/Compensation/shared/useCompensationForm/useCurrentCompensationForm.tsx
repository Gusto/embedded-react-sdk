import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { useCompensationForm } from './useCompensationForm'
import type { UseCompensationFormProps, UseCompensationFormResult } from './useCompensationForm'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'

export type UseCurrentCompensationFormProps = Omit<
  UseCompensationFormProps,
  'jobId' | 'compensationId'
>

/**
 * Resolves the employee's primary job and threads its `currentCompensationUuid`
 * into `useCompensationForm`. When no primary job exists the wrapped hook lands
 * in `create` mode (and the partner must thread `jobId` via submit options
 * after the parent job is created).
 *
 * Mirrors `useCurrentHomeAddressForm` exactly: the prop surface is
 * `Omit<UseCompensationFormProps, 'jobId' | 'compensationId'>` and the wrapper
 * takes no additional parameters. Partners needing to edit a specific
 * compensation (e.g. on a secondary job, or a pending future compensation)
 * should use the core `useCompensationForm` directly.
 */
export function useCurrentCompensationForm(
  props: UseCurrentCompensationFormProps,
): UseCompensationFormResult {
  const { employeeId } = props

  const jobsQuery = useJobsAndCompensationsGetJobs(
    { employeeId: employeeId ?? '' },
    { enabled: !!employeeId },
  )

  const jobs = jobsQuery.data?.jobs
  const primaryJob = jobs?.find(job => job.primary)

  const base = useCompensationForm({
    ...props,
    jobId: primaryJob?.uuid,
    compensationId: primaryJob?.currentCompensationUuid,
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
