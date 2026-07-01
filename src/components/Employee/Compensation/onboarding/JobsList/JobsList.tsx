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

/** @public */
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
