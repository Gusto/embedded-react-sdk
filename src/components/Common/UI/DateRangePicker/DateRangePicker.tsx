import {
  DateRangePicker as AriaDateRangePicker,
  Button as AriaButton,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateSegment,
  Group,
  Heading,
  RangeCalendar,
  type DateValue,
} from 'react-aria-components'
import { parseDate, type CalendarDate } from '@internationalized/date'
import type { DateRange, DateRangePickerProps } from './DateRangePickerTypes'
import styles from './DateRangePicker.module.scss'
import CaretLeft from '@/assets/icons/caret-left.svg?react'
import CaretRight from '@/assets/icons/caret-right.svg?react'

function dateToCalendarDate(date: Date): CalendarDate | undefined {
  if (!(date instanceof Date) || isNaN(date.getTime())) return undefined

  const dateString = [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')

  return parseDate(dateString)
}

function calendarDateToJsDate(dateValue: DateValue): Date {
  return new Date(dateValue.year, dateValue.month - 1, dateValue.day)
}

export const DateRangePicker = ({
  'aria-label': ariaLabel,
  value,
  onChange,
  startDateLabel,
  endDateLabel,
  minValue: minDate,
  maxValue: maxDate,
}: DateRangePickerProps) => {
  const startCalendar = value ? dateToCalendarDate(value.start) : undefined
  const endCalendar = value ? dateToCalendarDate(value.end) : undefined

  const ariaValue = startCalendar && endCalendar ? { start: startCalendar, end: endCalendar } : null

  const minValue = minDate ? dateToCalendarDate(minDate) : undefined
  const maxValue = maxDate ? dateToCalendarDate(maxDate) : undefined

  const handleRangeChange = (range: { start: DateValue; end: DateValue } | null) => {
    if (range) {
      const newRange: DateRange = {
        start: calendarDateToJsDate(range.start),
        end: calendarDateToJsDate(range.end),
      }
      onChange(newRange)
    } else {
      onChange(null)
    }
  }

  return (
    <AriaDateRangePicker
      value={ariaValue}
      onChange={handleRangeChange}
      minValue={minValue}
      maxValue={maxValue}
      aria-label={ariaLabel}
    >
      <Group className={styles.dateInputGroup}>
        <div className={styles.dateInputWrapper}>
          <span className={styles.dateInputLabel}>{startDateLabel}</span>
          <DateInput slot="start" className={styles.dateInput}>
            {segment => <DateSegment segment={segment} />}
          </DateInput>
        </div>
        <span className={styles.rangeSeparator} aria-hidden="true">
          –
        </span>
        <div className={styles.dateInputWrapper}>
          <span className={styles.dateInputLabel}>{endDateLabel}</span>
          <DateInput slot="end" className={styles.dateInput}>
            {segment => <DateSegment segment={segment} />}
          </DateInput>
        </div>
      </Group>

      <RangeCalendar className={styles.rangeCalendar}>
        <header className={styles.calendarHeader}>
          <AriaButton slot="previous" className={styles.calendarNavButton}>
            <CaretLeft aria-hidden />
          </AriaButton>
          <Heading className={styles.calendarHeading} />
          <AriaButton slot="next" className={styles.calendarNavButton}>
            <CaretRight aria-hidden />
          </AriaButton>
        </header>
        <CalendarGrid className={styles.calendarGrid}>
          {date => <CalendarCell date={date} className={styles.calendarCell} />}
        </CalendarGrid>
      </RangeCalendar>
    </AriaDateRangePicker>
  )
}
