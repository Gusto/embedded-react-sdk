import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import { getPendingCompensationChanges } from '../../shared/getPendingCompensationChanges'
import { CompensationEditJobForm } from '../CompensationEditJobForm/CompensationEditJobForm'
import { CompensationEditPendingJobForm } from '../CompensationEditPendingJobForm/CompensationEditPendingJobForm'
import { type CommonComponentInterface } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { type EventType } from '@/shared/constants'

export interface CompensationEditFormProps extends CommonComponentInterface<'Employee.Management.Compensation'> {
  employeeId: string
  /** The job whose compensation is being edited. The form inspects the job's
   *  compensations to decide whether to edit the current comp or an already
   *  scheduled future-dated (pending) change. */
  job: Job
  onCancel?: () => void
  /** Called with `EMPLOYEE_COMPENSATION_UPDATED` then `EMPLOYEE_COMPENSATION_DONE`
   *  on a successful save. Use `EMPLOYEE_COMPENSATION_DONE` to trigger navigation. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Edits the compensation for a single job. Thin router that forwards to the
 * pending-change editor when the job already has a scheduled future-dated
 * compensation (so the user adjusts the queued change rather than stacking a
 * second one), and to the current-compensation editor otherwise. Both branches
 * resolve copy from `Employee.Management.Compensation`; the optional `dictionary`
 * is forwarded to whichever editor renders.
 */
export function CompensationEditForm({
  employeeId,
  job,
  onCancel,
  onEvent,
  dictionary,
}: CompensationEditFormProps) {
  // The API does not guarantee ordering of job.compensations, so rely on the
  // same sorted helper that drives the card display (ascending by effectiveDate)
  // to find the nearest pending change.
  const pendingChanges = getPendingCompensationChanges([job])
  const nearestPending = pendingChanges[0]

  if (nearestPending) {
    return (
      <CompensationEditPendingJobForm
        employeeId={employeeId}
        jobId={job.uuid}
        compensationId={nearestPending.compensationUuid}
        isNewJob={nearestPending.isNewJob}
        isPrimaryJob={job.primary ?? false}
        onEvent={onEvent}
        onCancel={onCancel}
        dictionary={dictionary}
      />
    )
  }

  return (
    <CompensationEditJobForm
      employeeId={employeeId}
      jobId={job.uuid}
      onEvent={onEvent}
      onCancel={onCancel}
      dictionary={dictionary}
    />
  )
}
