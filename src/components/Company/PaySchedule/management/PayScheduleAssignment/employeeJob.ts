import type { ShowEmployees } from '@gusto/embedded-api/models/components/showemployees'

/**
 * Finds the primary job, falling back to the first job for older responses.
 *
 * @param employee - Employee whose job is needed.
 * @returns The primary job, or undefined when no jobs exist.
 * @internal
 */
export function getPrimaryJob(employee: Pick<ShowEmployees, 'jobs'>) {
  return employee.jobs?.find(job => job.primary) ?? employee.jobs?.[0]
}

/**
 * Finds the primary job's current compensation without depending on array order.
 *
 * @param employee - Employee whose compensation is needed.
 * @returns The named current compensation, or the first record when no pointer is supplied.
 * @internal
 */
export function getPrimaryCompensation(employee: Pick<ShowEmployees, 'jobs'>) {
  const job = getPrimaryJob(employee)
  if (job?.currentCompensationUuid === null) return undefined
  return job?.currentCompensationUuid
    ? job.compensations?.find(compensation => compensation.uuid === job.currentCompensationUuid)
    : job?.compensations?.[0]
}
