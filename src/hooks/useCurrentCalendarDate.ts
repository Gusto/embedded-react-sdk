import { useEffect, useState } from 'react'

const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const msUntilNextLocalMidnight = (now: Date): number =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()

/**
 * Tracks the current local calendar day, re-rendering when it rolls over.
 *
 * @remarks
 * Date-only values are classified by comparing them against today, so anything
 * derived from `new Date()` during render goes stale on a surface left open past
 * midnight: a rate that becomes effective overnight keeps rendering as upcoming.
 * This re-reads the clock when the day changes, and again whenever the tab regains
 * focus or becomes visible, which covers a machine that slept through the rollover.
 *
 * The returned `Date` is pinned to local midnight and keeps a stable identity for as
 * long as the day is unchanged, so it is safe to use as a dependency.
 *
 * @returns A `Date` at the start of the current local calendar day.
 * @internal
 */
export function useCurrentCalendarDate(): Date {
  const [today, setToday] = useState(() => startOfLocalDay(new Date()))

  useEffect(() => {
    let rolloverTimeoutId: ReturnType<typeof setTimeout>

    const syncToClock = () => {
      setToday(current => {
        const next = startOfLocalDay(new Date())
        return next.getTime() === current.getTime() ? current : next
      })
    }

    const scheduleRollover = () => {
      rolloverTimeoutId = setTimeout(() => {
        syncToClock()
        scheduleRollover()
      }, msUntilNextLocalMidnight(new Date()))
    }

    scheduleRollover()
    window.addEventListener('focus', syncToClock)
    document.addEventListener('visibilitychange', syncToClock)

    return () => {
      clearTimeout(rolloverTimeoutId)
      window.removeEventListener('focus', syncToClock)
      document.removeEventListener('visibilitychange', syncToClock)
    }
  }, [])

  return today
}
