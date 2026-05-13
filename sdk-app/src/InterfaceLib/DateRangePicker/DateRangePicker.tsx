import { useEffect, useRef, useState, type FocusEvent } from 'react'
// eslint-disable-next-line no-restricted-imports
import {
  DateRangePicker as AriaDateRangePicker,
  Button,
  Group,
  DateInput,
  DateSegment,
  Heading,
  RangeCalendar,
  CalendarGrid,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarGridBody,
  CalendarCell,
  type DateValue,
  type RangeValue,
} from 'react-aria-components'
import { CalendarDate } from '@internationalized/date'
import type { DateRangePickerProps } from '@gusto/embedded-react-sdk'
import styles from './DateRangePicker.module.scss'

function toCalendarDate(d?: Date | null): CalendarDate | null {
  if (!d) return null
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

function toNativeDate(value: DateValue): Date {
  return new Date(value.year, value.month - 1, value.day)
}

function rangeEquals(a: RangeValue<DateValue> | null, b: RangeValue<DateValue> | null) {
  if (!a || !b) return a === b
  return a.start.compare(b.start) === 0 && a.end.compare(b.end) === 0
}

export function DateRangePicker({
  label,
  value,
  onChange,
  startDateLabel,
  endDateLabel,
  minValue,
  maxValue,
}: DateRangePickerProps) {
  const calendarValue: RangeValue<CalendarDate> | null = value
    ? {
        start: toCalendarDate(value.start)!,
        end: toCalendarDate(value.end)!,
      }
    : null
  const minCalendarValue = toCalendarDate(minValue)
  const maxCalendarValue = toCalendarDate(maxValue)

  /* Buffer the value locally so segment-by-segment typing in the date inputs
     doesn't commit upstream until the user is done. */
  const [draft, setDraft] = useState<RangeValue<DateValue> | null>(calendarValue)
  const typingInInputsRef = useRef(false)

  useEffect(() => {
    if (!rangeEquals(draft, calendarValue)) {
      setDraft(calendarValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const commit = (next: RangeValue<DateValue> | null) => {
    if (!next) {
      onChange(null)
      return
    }
    onChange({
      start: toNativeDate(next.start),
      end: toNativeDate(next.end),
    })
  }

  const handleInputsBlur = (e: FocusEvent<HTMLElement>) => {
    /* Only commit when focus leaves the inputs group entirely. */
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    typingInInputsRef.current = false
    commit(draft)
  }

  return (
    <AriaDateRangePicker
      aria-label={typeof label === 'string' ? label : `${startDateLabel} – ${endDateLabel}`}
      validationBehavior="aria"
      value={draft}
      onChange={(next: RangeValue<DateValue> | null) => {
        setDraft(next)
        /* If the change didn't originate from typing in an input, commit now
           (calendar clicks land here). Input edits commit on blur instead. */
        if (!typingInInputsRef.current) commit(next)
      }}
      minValue={minCalendarValue ?? undefined}
      maxValue={maxCalendarValue ?? undefined}
      className={styles.root}
    >
      <div className={styles.inline} data-il-date-range-picker="true">
        <div className={styles.calendarWrap}>
          <RangeCalendar className={styles.calendar}>
            <header className={styles.calendarHeader}>
              <Button slot="previous" className={styles.navButton} aria-label="Previous month">
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12.2074 5.20654L6.41445 10.9995H20.0004V12.9995H6.41445L12.2074 18.7925L10.7934 20.2065L3.29336 12.7065C2.90288 12.316 2.90285 11.683 3.29336 11.2925L10.7934 3.79248L12.2074 5.20654Z"
                    fill="currentColor"
                  />
                </svg>
              </Button>
              <Heading className={styles.calendarTitle} />
              <Button slot="next" className={styles.navButton} aria-label="Next month">
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M20.7075 11.2925C20.8949 11.4799 21.0004 11.7345 21.0005 11.9995C21.0005 12.2645 20.8948 12.519 20.7075 12.7065L13.2075 20.2065L11.7935 18.7925L17.5864 12.9995H4.00049V10.9995H17.5864L11.7935 5.20654L13.2075 3.79248L20.7075 11.2925Z"
                    fill="currentColor"
                  />
                </svg>
              </Button>
            </header>
            <CalendarGrid className={styles.grid} weekdayStyle="short">
              <CalendarGridHeader>
                {day => (
                  <CalendarHeaderCell className={styles.dayHeader}>
                    {day.slice(0, 2)}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody>
                {date => <CalendarCell date={date} className={styles.day} />}
              </CalendarGridBody>
            </CalendarGrid>
          </RangeCalendar>
          <Group
            className={styles.inputs}
            onFocus={() => {
              typingInInputsRef.current = true
            }}
            onBlur={handleInputsBlur}
          >
            <div className={styles.inputField}>
              <span className={styles.inputLabel}>{startDateLabel}</span>
              <DateInput slot="start" className={styles.dateInput} aria-label={startDateLabel}>
                {segment => <DateSegment segment={segment} className={styles.dateSegment} />}
              </DateInput>
            </div>
            <div className={styles.inputField}>
              <span className={styles.inputLabel}>{endDateLabel}</span>
              <DateInput slot="end" className={styles.dateInput} aria-label={endDateLabel}>
                {segment => <DateSegment segment={segment} className={styles.dateSegment} />}
              </DateInput>
            </div>
          </Group>
        </div>
      </div>
    </AriaDateRangePicker>
  )
}
