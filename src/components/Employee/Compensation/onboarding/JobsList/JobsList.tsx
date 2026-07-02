import { useMemo } from 'react'
import { useJobsAndCompensationsGetJobsSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/jobsAndCompensationsGetJobs'
import { useJobsAndCompensationsDeleteMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/jobsAndCompensationsDelete'
import { derivePrimaryFlsaStatus } from '../../shared/derivePrimaryFlsaStatus'
import { JobsListPresentation } from './JobsListPresentation'
import { BaseComponent, type BaseComponentInterface, useBase } from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/** @public */
export interface JobsListProps extends BaseComponentInterface<'Employee.Compensation'> {
  /** The associated employee identifier. */
  employeeId: string
}

/**
 * Lists an employee's jobs alongside their compensation details, with controls to add, edit,
 * or remove a job.
 *
 * @remarks
 * Used for employees who hold multiple roles. The primary job's FLSA classification determines
 * whether the employee is treated as exempt or nonexempt.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/job/add` | Fired when the user chooses to add a job | none |
 * | `employee/job/edit` | Fired when the user chooses to edit a job | `{ uuid: string }` |
 * | `employee/job/deleted` | Fired after a job is successfully deleted | none |
 * | `employee/compensations/done` | Fired when the user continues past the jobs list | none |
 *
 * @param props - See {@link JobsListProps}.
 * @returns The employee's jobs list.
 * @public
 */
export function JobsList(props: JobsListProps) {
  useComponentDictionary('Employee.Compensation', props.dictionary)
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ employeeId, className }: JobsListProps) {
  useI18n('Employee.Compensation')
  const { onEvent } = useBase()

  const { data: jobsData } = useJobsAndCompensationsGetJobsSuspense({ employeeId })
  const employeeJobs = useMemo(() => jobsData.jobs ?? [], [jobsData.jobs])

  const { mutateAsync: deleteEmployeeJob, isPending: isDeleting } =
    useJobsAndCompensationsDeleteMutation()

  const primaryFlsaStatus = useMemo(() => derivePrimaryFlsaStatus(employeeJobs), [employeeJobs])

  const handleAdd = () => {
    onEvent(componentEvents.EMPLOYEE_JOB_ADD)
  }

  const handleEdit = (jobId: string) => {
    onEvent(componentEvents.EMPLOYEE_JOB_EDIT, { uuid: jobId })
  }

  const handleDelete = async (jobId: string) => {
    await deleteEmployeeJob({ request: { jobId } })
    onEvent(componentEvents.EMPLOYEE_JOB_DELETED)
  }

  const handleContinue = () => {
    onEvent(componentEvents.EMPLOYEE_COMPENSATION_DONE)
  }

  return (
    <section className={className}>
      <JobsListPresentation
        jobs={employeeJobs}
        primaryFlsaStatus={primaryFlsaStatus}
        isPending={isDeleting}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={(jobId: string) => {
          void handleDelete(jobId)
        }}
        onContinue={handleContinue}
      />
    </section>
  )
}
