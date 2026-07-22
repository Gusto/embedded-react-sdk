import type { ReactNode } from 'react'
import { useEmployeeEmploymentsGetRehire } from '@gusto/embedded-api/react-query/employeeEmploymentsGetRehire'
import { formatBadgeDate, startOfToday } from './badgeDate'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { normalizeToDate } from '@/helpers/dateFormatting'

/** @internal */
export interface RehireStatusBadgeProps {
  employeeId: string
  /**
   * Produces the badge copy from the formatted upcoming-rehire date. Only
   * invoked when the employee has a rehire scheduled for today or a future
   * date, so the caller owns the copy without owning the data fetch.
   */
  children: (rehireDate: string) => ReactNode
}

/**
 * Renders a badge for a dismissed employee who has a rehire scheduled for today
 * or a future date. Fetches the employee's rehire on its own and passes the
 * formatted rehire date to `children`; renders nothing when no upcoming rehire
 * exists.
 *
 * @internal
 */
export function RehireStatusBadge({ employeeId, children }: RehireStatusBadgeProps) {
  const Components = useComponentContext()

  const { data } = useEmployeeEmploymentsGetRehire(
    { employeeId },
    { throwOnError: () => false, retry: false },
  )

  const rehire = data?.rehire
  const rehireDate = normalizeToDate(rehire?.effectiveDate)

  const isUpcomingRehire =
    rehire?.active !== true && rehireDate !== null && rehireDate.getTime() >= startOfToday()

  if (!isUpcomingRehire) {
    return null
  }

  return <Components.Badge status="info">{children(formatBadgeDate(rehireDate))}</Components.Badge>
}
