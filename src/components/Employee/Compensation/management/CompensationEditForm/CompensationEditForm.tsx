import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsGetJobs'
import { getPendingCompensationChanges } from '../../shared/getPendingCompensationChanges'
import { CompensationEditJobForm } from '../CompensationEditJobForm/CompensationEditJobForm'
import { CompensationEditPendingJobForm } from '../CompensationEditPendingJobForm/CompensationEditPendingJobForm'
import { BaseLayout, type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { type EventType } from '@/shared/constants'

export interface CompensationEditFormProps extends CommonComponentInterface<'Employee.Management.Compensation'> {
  employeeId: string
  /** The id of the job whose compensation is being edited. The form fetches the
   *  job (a cached query, deduped against any sibling consumer) and inspects its
   *  compensations to decide whether to edit the current comp or an already
   *  scheduled future-dated (pending) change. */
  jobId: string
  /** Fires `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED` (with the saved
   *  `Compensation`) on a successful save, and
   *  `EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_CANCELLED` when the user cancels. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Edits the compensation for a single job. Self-fetching thin router: it loads
 * the job by id (React Query dedupes against the card's own list query, so no
 * extra request) and forwards to the pending-change editor when the job already
 * has a scheduled future-dated compensation (so the user adjusts the queued
 * change rather than stacking a second one), and to the current-compensation
 * editor otherwise. Both branches resolve copy from
 * `Employee.Management.Compensation`; the optional `dictionary` is forwarded to
 * whichever editor renders.
 */
export function CompensationEditForm({
  employeeId,
  jobId,
  onEvent,
  dictionary,
}: CompensationEditFormProps) {
  const jobsQuery = useJobsAndCompensationsGetJobs({ employeeId }, { enabled: !!employeeId })

  if (jobsQuery.isLoading || !jobsQuery.data) {
    const errorHandling = composeErrorHandler([jobsQuery])
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  const job = jobsQuery.data.jobs?.find(j => j.uuid === jobId)

  // The API does not guarantee ordering of job.compensations, so rely on the
  // same sorted helper that drives the card display (ascending by effectiveDate)
  // to find the nearest pending change.
  const nearestPending = getPendingCompensationChanges(job ? [job] : [])[0]

  if (nearestPending) {
    return (
      <CompensationEditPendingJobForm
        employeeId={employeeId}
        jobId={jobId}
        compensationId={nearestPending.compensationUuid}
        isNewJob={nearestPending.isNewJob}
        isPrimaryJob={job?.primary ?? false}
        onEvent={onEvent}
        dictionary={dictionary}
      />
    )
  }

  return (
    <CompensationEditJobForm
      employeeId={employeeId}
      jobId={jobId}
      onEvent={onEvent}
      dictionary={dictionary}
    />
  )
}
