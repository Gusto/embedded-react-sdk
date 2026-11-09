import type { Compensation } from '@gusto/embedded-api/models/components/compensation'
import type { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import type { Job } from '@gusto/embedded-api/models/components/job'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

/**
 * Where a compensation sits relative to today.
 *
 * @remarks
 * `current` is the latest compensation whose effective date is on or before
 * today. A job whose compensations are all future-dated has no `current`
 * entry — every entry is `upcoming`.
 *
 * @alpha
 */
export type CompensationHistoryStatus = 'past' | 'current' | 'upcoming'

/**
 * A single effective-dated compensation record in an employee's history.
 *
 * @alpha
 */
export interface CompensationHistoryEntry {
  /** Identifier of the underlying compensation record. */
  compensationId: string
  /** Date this compensation took (or takes) effect, as `YYYY-MM-DD`. */
  effectiveDate: string
  /** Job title in effect on `effectiveDate`; `null` when the record carries no title. */
  title: string | null
  /** Employee classification in effect on `effectiveDate`. */
  flsaStatus?: FlsaStatusType
  /** Pay rate for this compensation, as a decimal string. */
  rate?: string
  /** Period the rate is tracked over, e.g. `Hour` or `Year`. */
  paymentUnit?: string
  /** Where this record sits relative to today. */
  status: CompensationHistoryStatus
}

/**
 * One job's compensation history.
 *
 * @alpha
 */
export interface JobCompensationHistory {
  /** Identifier of the job these compensations belong to. */
  jobId: string
  /** Title to display for the job, taken from its current or earliest compensation. */
  jobTitle: string
  /** Whether this is the employee's primary job. */
  isPrimary: boolean
  /** The job's compensations, newest effective date first. */
  entries: CompensationHistoryEntry[]
}

/**
 * Builds the per-job compensation history for an employee, tagging each
 * effective-dated compensation as past, current, or upcoming.
 *
 * @remarks
 * Expects jobs fetched with `include=all_compensations`, which returns every
 * effective-dated compensation rather than only the current one.
 *
 * Status is derived by comparing `effectiveDate` to today rather than by
 * reading `job.currentCompensationUuid`, because that pointer is nullable and
 * can reference a compensation that has not taken effect yet. Dates are
 * compared as `YYYY-MM-DD` strings so no timezone conversion is involved.
 *
 * `title` is read off each compensation rather than off the job, because
 * `job.title` is a denormalized snapshot of the primary compensation's title
 * and lags behind compensation-level edits. The API resolves each
 * compensation's title as of that record's own effective date, which is what a
 * history row should show.
 *
 * Entries come back newest-first for display; jobs keep their incoming order.
 *
 * @param jobs - Jobs to derive history from, each with its `compensations` array populated.
 * @param options - Set `today` to pin the past/current/upcoming boundary; defaults to the current local date.
 * @returns One {@link JobCompensationHistory} per job that has at least one effective-dated compensation.
 * @internal
 */
export function getCompensationHistory(
  jobs: Job[] | undefined,
  options: { today?: Date } = {},
): JobCompensationHistory[] {
  if (!jobs?.length) return []

  const today = formatDateToStringDate(options.today ?? new Date()) ?? ''

  return jobs.reduce<JobCompensationHistory[]>((acc, job) => {
    const sorted = (job.compensations ?? [])
      .filter(hasEffectiveDate)
      .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))

    if (sorted.length === 0) return acc

    const currentIndex = sorted.reduce(
      (latest, compensation, index) => (compensation.effectiveDate <= today ? index : latest),
      -1,
    )

    const entries = sorted.map((compensation, index) => ({
      compensationId: compensation.uuid,
      effectiveDate: compensation.effectiveDate,
      title: compensation.title ?? null,
      flsaStatus: compensation.flsaStatus,
      rate: compensation.rate,
      paymentUnit: compensation.paymentUnit,
      status: toStatus(index, currentIndex),
    }))

    acc.push({
      jobId: job.uuid,
      isPrimary: job.primary ?? false,
      // Prefer the title in effect today; a job that hasn't started yet has no
      // current compensation, so fall back to the title it starts with.
      jobTitle: sorted[currentIndex]?.title ?? sorted[0]?.title ?? job.title ?? '',
      entries: entries.reverse(),
    })

    return acc
  }, [])
}

function hasEffectiveDate(
  compensation: Compensation,
): compensation is Compensation & { effectiveDate: string } {
  return typeof compensation.effectiveDate === 'string' && compensation.effectiveDate.length > 0
}

function toStatus(index: number, currentIndex: number): CompensationHistoryStatus {
  if (index === currentIndex) return 'current'
  return index > currentIndex ? 'upcoming' : 'past'
}
