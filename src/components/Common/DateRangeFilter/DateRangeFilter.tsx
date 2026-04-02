import { useState, useRef, useCallback } from 'react'
import {
  DateRangePicker as AriaDateRangePicker,
  Button as AriaButton,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DateSegment,
  Group,
  Heading,
  Popover,
  RangeCalendar,
  type DateValue,
} from 'react-aria-components'
import {
  parseDate,
  type CalendarDate,
  type DateValue as IntlDateValue,
} from '@internationalized/date'
import styles from './DateRangeFilter.module.scss'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useTheme } from '@/contexts/ThemeProvider'
import FilterFunnelIcon from '@/assets/icons/filter-funnel.svg?react'
import CaretLeft from '@/assets/icons/caret-left.svg?react'
import CaretRight from '@/assets/icons/caret-right.svg?react'

interface DateRangeFilterProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  onClear: () => void
  startDateLabel: string
  endDateLabel: string
  applyLabel: string
  resetLabel: string
  triggerLabel: string
  isFilterActive: boolean
  maxEndDate?: Date
  minStartDate?: Date
}

interface DraftRange {
  start: CalendarDate
  end: CalendarDate
}

function dateToCalendarDate(date: Date): CalendarDate | undefined {
  if (!(date instanceof Date) || isNaN(date.getTime())) return undefined

  const dateString = [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')

  return parseDate(dateString)
}

function calendarDateToJsDate(dateValue: DateValue | null): Date | null {
  if (!dateValue) return null
  return new Date(dateValue.year, dateValue.month - 1, dateValue.day)
}

function buildDraftRange(start: Date | null, end: Date | null): DraftRange | null {
  const startCal = start ? dateToCalendarDate(start) : undefined
  const endCal = end ? dateToCalendarDate(end) : undefined
  if (startCal && endCal) return { start: startCal, end: endCal }
  return null
}

function isDateInRange(date: IntlDateValue, range: DraftRange | null): boolean {
  if (!range) return false
  return date.compare(range.start) >= 0 && date.compare(range.end) <= 0
}

export const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  startDateLabel,
  endDateLabel,
  applyLabel,
  resetLabel,
  triggerLabel,
  isFilterActive,
  maxEndDate,
  minStartDate,
}: DateRangeFilterProps) => {
  const { Button, ButtonIcon } = useComponentContext()
  const { container } = useTheme()

  const [isOpen, setIsOpen] = useState(false)
  const [draftRange, setDraftRange] = useState<DraftRange | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const minValue = minStartDate ? dateToCalendarDate(minStartDate) : undefined
  const maxValue = maxEndDate ? dateToCalendarDate(maxEndDate) : undefined

  const handleOpen = useCallback(() => {
    setDraftRange(buildDraftRange(startDate, endDate))
    setIsOpen(true)
  }, [startDate, endDate])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleApply = useCallback(() => {
    if (draftRange) {
      onStartDateChange(calendarDateToJsDate(draftRange.start))
      onEndDateChange(calendarDateToJsDate(draftRange.end))
    }
    setIsOpen(false)
  }, [draftRange, onStartDateChange, onEndDateChange])

  const handleReset = useCallback(() => {
    onClear()
    setIsOpen(false)
  }, [onClear])

  const handleRangeChange = useCallback((range: { start: DateValue; end: DateValue } | null) => {
    if (range) {
      setDraftRange({
        start: parseDate(range.start.toString()),
        end: parseDate(range.end.toString()),
      })
    } else {
      setDraftRange(null)
    }
  }, [])

  return (
    <>
      <ButtonIcon
        buttonRef={triggerRef}
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={handleOpen}
        variant={isFilterActive ? 'secondary' : 'tertiary'}
      >
        <FilterFunnelIcon />
      </ButtonIcon>

      <Popover
        UNSTABLE_portalContainer={container.current}
        isOpen={isOpen}
        onOpenChange={open => {
          if (!open) handleClose()
        }}
        triggerRef={triggerRef}
        placement="bottom end"
        offset={8}
        shouldUpdatePosition
      >
        <div className={styles.popoverContent}>
          <AriaDateRangePicker
            value={draftRange}
            onChange={handleRangeChange}
            minValue={minValue}
            maxValue={maxValue}
            aria-label={`${startDateLabel} – ${endDateLabel}`}
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
                {date => (
                  <CalendarCell
                    date={date}
                    className={styles.calendarCell}
                    {...(isDateInRange(date, draftRange) ? { 'data-in-range': true } : {})}
                  />
                )}
              </CalendarGrid>
            </RangeCalendar>
          </AriaDateRangePicker>

          <Flex gap={8} justifyContent="flex-end">
            <Button variant="tertiary" onClick={handleReset}>
              {resetLabel}
            </Button>
            <Button variant="primary" onClick={handleApply}>
              {applyLabel}
            </Button>
          </Flex>
        </div>
      </Popover>
    </>
  )
}
