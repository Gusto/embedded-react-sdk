import type { ReactNode } from 'react'
import type { Termination } from '@gusto/embedded-api/models/components/termination'
import { formatBadgeDate, startOfToday } from './badgeDate'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { normalizeToDate } from '@/helpers/dateFormatting'

/** @internal */
export interface LastDayStatusBadgeProps {
  /** The employee's terminations, if any. */
  terminations?: Termination[]
  /**
   * Produces the badge copy from the formatted upcoming last day. Only invoked
   * when the employee has a termination scheduled for today or a future date,
   * so the caller owns the copy without owning the date math.
   */
  children: (lastDay: string) => ReactNode
}

function latestTerminationDate(terminations?: Termination[]): Date | null {
  const timestamps = (terminations ?? [])
    .map(termination => normalizeToDate(termination.effectiveDate))
    .filter((date): date is Date => date !== null)
    .map(date => date.getTime())

  return timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
}

/**
 * Renders a badge for an active employee who has a termination scheduled for
 * today or a future date. Derives the upcoming last day from the terminations
 * already present on the list row and passes the formatted date to `children`;
 * renders nothing when no upcoming dismissal exists.
 *
 * @internal
 */
export function LastDayStatusBadge({ terminations, children }: LastDayStatusBadgeProps) {
  const Components = useComponentContext()

  const lastDay = latestTerminationDate(terminations)
  const isUpcomingDismissal = lastDay !== null && lastDay.getTime() >= startOfToday()

  if (!isUpcomingDismissal) {
    return null
  }

  return <Components.Badge status="warning">{children(formatBadgeDate(lastDay))}</Components.Badge>
}
