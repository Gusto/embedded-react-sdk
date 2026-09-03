import type { CompanySuspension } from '@gusto/embedded-api/models/components/companysuspension'
import { normalizeToDate } from '@/helpers/dateFormatting'

/**
 * Returns the suspension with the latest `effectiveDate` from a list, or `undefined` when the list
 * is empty. Suspensions without a parseable `effectiveDate` sort earliest.
 *
 * @internal
 */
export function getLatestSuspension(
  suspensions: CompanySuspension[] | undefined,
): CompanySuspension | undefined {
  if (!suspensions || suspensions.length === 0) return undefined

  return suspensions.reduce((latest, candidate) => {
    const latestTime = normalizeToDate(latest.effectiveDate)?.getTime() ?? -Infinity
    const candidateTime = normalizeToDate(candidate.effectiveDate)?.getTime() ?? -Infinity
    return candidateTime > latestTime ? candidate : latest
  })
}
