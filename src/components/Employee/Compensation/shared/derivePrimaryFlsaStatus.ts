import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'

/**
 * Returns the FLSA status of the employee's primary job's current compensation,
 * or `undefined` when there is no primary job or no resolvable current compensation.
 *
 * The primary job is the one with `primary === true`; "current compensation" is the
 * entry in `job.compensations` whose `uuid` matches `job.currentCompensationUuid`.
 *
 * @internal
 */
export function derivePrimaryFlsaStatus(jobs: Job[] | undefined): string | undefined {
  return (jobs ?? []).reduce<string | undefined>((acc, job) => {
    const comp = job.compensations?.find(c => c.uuid === job.currentCompensationUuid)
    if (!job.primary || !comp) return acc
    return comp.flsaStatus ?? acc
  }, undefined)
}
