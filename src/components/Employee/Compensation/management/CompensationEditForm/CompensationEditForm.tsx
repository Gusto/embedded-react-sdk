import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api-v-2026-02-01/react-query/jobsAndCompensationsGetJobs'
import { getPendingCompensationChanges } from '../../shared/getPendingCompensationChanges'
import { CompensationEditJobForm } from '../CompensationEditJobForm/CompensationEditJobForm'
import { CompensationEditPendingJobForm } from '../CompensationEditPendingJobForm/CompensationEditPendingJobForm'
import { BaseLayout, type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { type EventType } from '@/shared/constants'

/**
 * Props for {@link CompensationEditForm}.
 *
 * @public
 */
export interface CompensationEditFormProps extends CommonComponentInterface<'Employee.Management.Compensation'> {
  /** The associated employee identifier. */
  employeeId: string
  /**
   * The id of the job whose compensation is being edited (for example, the `jobId` from the
   * {@link CompensationCard} `employee/management/compensation/card/editRequested` payload).
   * The form inspects the job's compensations to decide whether to edit the current
   * compensation or an already-scheduled future-dated change.
   */
  jobId: string
  /** Callback invoked when the form emits an event. See the events table on {@link CompensationEditForm} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone form that edits the compensation for a single job, branching automatically between editing the current compensation and an already-scheduled future-dated change.
 *
 * @remarks
 * Pair with {@link CompensationCard} to route its `employee/management/compensation/card/editRequested` event to this form. {@link Compensation} bundles the card, the three form surfaces (edit, add job, add another job), and the swap and alert wiring as a single drop-in; reach for this form directly only when that orchestration is the wrong fit (for example, when the form needs to render in a modal or drawer, or when the swap is driven by a router).
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/compensation/editForm/submitted` | Fired after the compensation change is saved; use it to return to the card | The updated `Compensation` entity |
 * | `employee/management/compensation/editForm/cancelled` | Fired when the user clicks Cancel; use it to return to the card | — |
 *
 * @param props - See {@link CompensationEditFormProps}.
 * @returns The rendered compensation edit form.
 * @public
 * @group Block Components
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
