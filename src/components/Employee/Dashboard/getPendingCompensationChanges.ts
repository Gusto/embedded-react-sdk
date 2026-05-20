import type { Compensation } from '@gusto/embedded-api/models/components/compensation'
import type { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import type { Job } from '@gusto/embedded-api/models/components/job'
import { normalizeToDate } from '@/helpers/dateFormatting'

export type PendingChangeDetail =
  | { kind: 'titleChange'; title: string }
  | { kind: 'payChange'; rate: number; paymentUnit: string }
  | { kind: 'flsaChange'; flsaStatus: FlsaStatusType }
  | { kind: 'minWageEnabled'; wage: string | null }
  | { kind: 'minWageDisabled' }
  | { kind: 'minWageChanged'; wage: string | null }
  | {
      kind: 'newJob'
      title: string | null
      rate: number | null
      paymentUnit: string | null
    }

export interface PendingCompensationChange {
  compensationUuid: string
  jobUuid: string
  effectiveDate: string
  jobTitle: string | null
  details: PendingChangeDetail[]
}

const startOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const isAfterToday = (effectiveDate: string | undefined, todayStart: Date): boolean => {
  if (!effectiveDate) return false
  const parsed = normalizeToDate(effectiveDate)
  if (!parsed) return false
  return startOfLocalDay(parsed) > todayStart
}

const isOnOrBeforeToday = (effectiveDate: string | undefined, todayStart: Date): boolean => {
  if (!effectiveDate) return false
  const parsed = normalizeToDate(effectiveDate)
  if (!parsed) return false
  return startOfLocalDay(parsed) <= todayStart
}

const numericRate = (rate: string | undefined): number | null => {
  if (rate === undefined || rate === '') return null
  const n = Number(rate)
  return Number.isFinite(n) ? n : null
}

function buildExistingJobDetails(
  baseline: Compensation,
  future: Compensation,
  jobTitle: string | null,
): PendingChangeDetail[] {
  const details: PendingChangeDetail[] = []

  const baseTitle = baseline.title ?? jobTitle
  const futureTitle = future.title ?? jobTitle
  if (futureTitle && baseTitle !== futureTitle) {
    details.push({ kind: 'titleChange', title: futureTitle })
  }

  const baseRate = numericRate(baseline.rate)
  const futureRate = numericRate(future.rate)
  const baseUnit = baseline.paymentUnit
  const futureUnit = future.paymentUnit
  const rateDiffers = futureRate !== null && futureRate !== baseRate
  const unitDiffers = futureUnit !== undefined && futureUnit !== baseUnit
  if ((rateDiffers || unitDiffers) && futureRate !== null && futureUnit) {
    details.push({ kind: 'payChange', rate: futureRate, paymentUnit: futureUnit })
  }

  if (future.flsaStatus && future.flsaStatus !== baseline.flsaStatus) {
    details.push({ kind: 'flsaChange', flsaStatus: future.flsaStatus })
  }

  const baseAdj = baseline.adjustForMinimumWage ?? false
  const futureAdj = future.adjustForMinimumWage ?? false
  const baseMw = baseline.minimumWages?.[0]
  const futureMw = future.minimumWages?.[0]

  if (!baseAdj && futureAdj) {
    details.push({ kind: 'minWageEnabled', wage: futureMw?.wage ?? null })
  } else if (baseAdj && !futureAdj) {
    details.push({ kind: 'minWageDisabled' })
  } else if (baseAdj && futureAdj) {
    if (baseMw?.uuid !== futureMw?.uuid || baseMw?.wage !== futureMw?.wage) {
      details.push({ kind: 'minWageChanged', wage: futureMw?.wage ?? null })
    }
  }

  return details
}

function buildNewJobDetails(future: Compensation, jobTitle: string | null): PendingChangeDetail[] {
  const rate = numericRate(future.rate)
  return [
    {
      kind: 'newJob',
      title: future.title ?? jobTitle,
      rate,
      paymentUnit: rate !== null && future.paymentUnit ? future.paymentUnit : null,
    },
  ]
}

/**
 * Returns the pending compensation changes for an employee, flattened across
 * all jobs and sorted globally by `effectiveDate` ascending.
 *
 * A pending change is any `Compensation` whose `effectiveDate` is strictly
 * after today (local midnight). When a single job has multiple future-dated
 * compensations stacked, each is returned in chronological order and the diff
 * details for the N+1th comp are computed against the Nth (rather than the
 * job's current compensation) so the bullets remain meaningful end-to-end.
 *
 * The helper returns structured deltas (a discriminated union per detail) so
 * the consuming UI is responsible for formatting them via i18n / pay-rate
 * helpers. This keeps the helper pure and trivially unit-testable.
 */
export function getPendingCompensationChanges(
  jobs: Job[] | undefined,
  options: { today?: Date } = {},
): PendingCompensationChange[] {
  if (!jobs?.length) return []

  const now = options.today ?? new Date()
  const todayStart = startOfLocalDay(now)
  const results: PendingCompensationChange[] = []

  for (const job of jobs) {
    const comps = job.compensations ?? []

    const futureComps = comps
      .filter(c => isAfterToday(c.effectiveDate, todayStart))
      .slice()
      .sort((a, b) => (a.effectiveDate ?? '').localeCompare(b.effectiveDate ?? ''))

    if (futureComps.length === 0) continue

    const referencedCurrent = job.currentCompensationUuid
      ? comps.find(c => c.uuid === job.currentCompensationUuid)
      : undefined
    const currentComp =
      referencedCurrent && isOnOrBeforeToday(referencedCurrent.effectiveDate, todayStart)
        ? referencedCurrent
        : null

    for (let i = 0; i < futureComps.length; i++) {
      const future = futureComps[i]!
      const baseline = i === 0 ? currentComp : futureComps[i - 1]!

      const details = baseline
        ? buildExistingJobDetails(baseline, future, job.title)
        : buildNewJobDetails(future, job.title)

      results.push({
        compensationUuid: future.uuid,
        jobUuid: job.uuid,
        effectiveDate: future.effectiveDate!,
        jobTitle: job.title,
        details,
      })
    }
  }

  results.sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))

  return results
}
