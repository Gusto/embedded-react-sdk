import type { DateValue } from 'react-aria-components'
import {
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Text,
  RangeCalendar,
} from 'react-aria-components'
import { parseDate } from '@internationalized/date'
import { useMemo } from 'react'
import { CalendarLegend } from './CalendarLegend'
import type { CalendarPreviewProps } from './CalendarPreviewTypes'
import styles from './CalendarPreview.module.scss'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { Flex } from '@/components/Common/Flex'

export const CalendarPreview = ({ dateRange, highlightDates }: CalendarPreviewProps) => {
  const highlightMap = useMemo(() => {
    if (!highlightDates) return new Map()

    return new Map(
      highlightDates.map(highlight => [
        formatDateToStringDate(highlight.date),
        highlight.highlightColor,
      ]),
    )
  }, [highlightDates])

  const isInRange = (date: DateValue) => {
    const comparisonDate = new Date(date.toString())
    const { start, end } = dateRange
    return comparisonDate >= start && comparisonDate <= end
  }

  const isDatesInMultipleMonths = useMemo(() => {
    // Get all dates into an array
    const allDates = [dateRange.start, dateRange.end, ...(highlightDates?.map(h => h.date) || [])]

    // Get the month of the first date to compare against
    const firstMonth = allDates[0]?.getMonth() ?? 0

    // Check if any date has a different month than the first date
    return allDates.some(date => date.getMonth() !== firstMonth)
  }, [dateRange, highlightDates])

  const getMonthName = (date: Date) => {
    const dateFormatter = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    })
    return dateFormatter.format(date)
  }

  const formattedStartDate = formatDateToStringDate(dateRange.start)
  const formattedEndDate = formatDateToStringDate(dateRange.end)

  const rangeValue =
    formattedStartDate && formattedEndDate
      ? {
          start: parseDate(formattedStartDate),
          end: parseDate(formattedEndDate),
        }
      : undefined

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarWrapper}>
        <div className={styles.calendarHeader}>
          <Flex alignItems={'center'} justifyContent={'center'}>
            <Text>{getMonthName(dateRange.start)}</Text>
          </Flex>
        </div>
        <RangeCalendar
          isReadOnly
          value={rangeValue}
          visibleDuration={isDatesInMultipleMonths ? { weeks: 2 } : undefined}
        >
          <CalendarGrid weekdayStyle={'short'}>
            <CalendarGridHeader>
              {day => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>
              {date => {
                return (
                  <CalendarCell
                    className="react-aria-CalendarCell"
                    date={date}
                    {...(isInRange(date) ? { 'data-selected': true } : {})}
                    data-highlight={highlightMap.get(date.toString())}
                    data-disabled={true}
                  >
                    {({ formattedDate }) => {
                      return (
                        <Flex flexDirection={'column'} alignItems={'center'} gap={0}>
                          {formattedDate}
                          <div className={styles.dateMarker}></div>
                        </Flex>
                      )
                    }}
                  </CalendarCell>
                )
              }}
            </CalendarGridBody>
          </CalendarGrid>

          <Text slot="errorMessage" />
        </RangeCalendar>
        <CalendarLegend highlightDates={highlightDates} dateRange={dateRange} />
      </div>
    </div>
  )
}
