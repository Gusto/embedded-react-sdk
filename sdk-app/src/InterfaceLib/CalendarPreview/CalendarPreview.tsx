import { useMemo } from 'react'
import classNames from 'classnames'
import type { CalendarPreviewProps } from '@gusto/embedded-react-sdk'
import styles from './CalendarPreview.module.scss'

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isWithin(date: Date, start: Date, end: Date): boolean {
  const t = date.getTime()
  return t >= start.getTime() && t <= end.getTime()
}

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
})

export function CalendarPreview({ highlightDates = [], dateRange }: CalendarPreviewProps) {
  const months = useMemo(() => {
    const result: Date[] = []
    let cursor = startOfMonth(dateRange.start)
    const endMonth = startOfMonth(dateRange.end)
    while (cursor.getTime() <= endMonth.getTime()) {
      result.push(cursor)
      cursor = addMonths(cursor, 1)
    }
    return result.length > 0 ? result : [startOfMonth(dateRange.start)]
  }, [dateRange])

  return (
    <div className={styles.root} aria-label={dateRange.label}>
      {months.map(monthStart => {
        const total = daysInMonth(monthStart)
        const offset = monthStart.getDay()
        const cells: Array<{ date: Date | null; key: string }> = []
        for (let i = 0; i < offset; i += 1) {
          cells.push({ date: null, key: `pad-${monthStart.getMonth()}-${i}` })
        }
        for (let d = 1; d <= total; d += 1) {
          cells.push({
            date: new Date(monthStart.getFullYear(), monthStart.getMonth(), d),
            key: `${monthStart.getMonth()}-${d}`,
          })
        }
        return (
          <div key={monthStart.toISOString()} className={styles.month}>
            <div className={styles.monthHeader}>{monthFormatter.format(monthStart)}</div>
            <div className={styles.weekdays}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <span key={idx} className={styles.weekday}>
                  {day}
                </span>
              ))}
            </div>
            <div className={styles.grid}>
              {cells.map(cell => {
                if (!cell.date) {
                  return <span key={cell.key} className={styles.empty} />
                }
                const highlight = highlightDates.find(h => isSameDay(h.date, cell.date as Date))
                const inRange = isWithin(cell.date, dateRange.start, dateRange.end)
                return (
                  <span
                    key={cell.key}
                    title={highlight?.label}
                    className={classNames(styles.day, {
                      [styles.inRange as string]: inRange,
                      [styles.primaryHighlight as string]: highlight?.highlightColor === 'primary',
                      [styles.secondaryHighlight as string]:
                        highlight?.highlightColor === 'secondary',
                    })}
                  >
                    {cell.date.getDate()}
                  </span>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
