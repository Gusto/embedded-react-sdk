import {
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateValue,
  Text,
  RangeCalendar,
} from 'react-aria-components'
import { parseDate } from '@internationalized/date'
import { Flex } from '../Flex/Flex'
import { CalendarDisplayLegend } from './CalendarDisplayLegend'

// TODO: Disabled doesn't seem to work and hovering dates looks weird in this case

export type CalendarDisplayProps = {
  onNext?: () => void
  onPrevious?: () => void
  highlightDates?: Array<{
    date: string
    highlightColor: 'orange' | 'black'
    label: string
  }>
  rangeSelected: {
    start: string
    end: string
    label: string
  }
  selectionControl?: React.ReactNode
}

export const CalendarDisplay = ({
  rangeSelected,
  highlightDates,
  selectionControl,
}: CalendarDisplayProps) => {
  const highlighter = (date: DateValue) => {
    if (highlightDates) {
      const highlight = highlightDates.find(h => h.date.toString() === date.toString())
      if (highlight) {
        return highlight.highlightColor
      } else if (!isInRange(date)) {
        return 'gray'
      }
    }
  }

  const isInRange = (date: DateValue) => {
    const comparisonDate = new Date(date.toString())
    const start = new Date(rangeSelected.start)
    const end = new Date(rangeSelected.end)
    return comparisonDate >= start && comparisonDate <= end
  }

  const isDatesInMultipleMonths = () => {
    // Get all dates into an array
    const allDates = [
      new Date(rangeSelected.start),
      new Date(rangeSelected.end),
      ...(highlightDates?.map(h => new Date(h.date)) || []),
    ]

    // Get the month of the first date to compare against
    const firstMonth = allDates[0]?.getMonth() ?? 0

    // Check if any date has a different month than the first date
    return allDates.some(date => date.getMonth() !== firstMonth)
  }

  const getMonthName = (date: DateValue) => {
    const dateFormatter = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      year: 'numeric',
    })
    return dateFormatter.format(new Date(date.toString()))
  }

  return (
    <div className="react-aria-calendar-display">
      {selectionControl && <div className="calendar-selection-control">{selectionControl}</div>}
      <div className="calendar-wrapper">
        <div className="calendar-header">
          <Flex alignItems={'center'} justifyContent={'center'}>
            <Text>{getMonthName(parseDate(rangeSelected.start))}</Text>
          </Flex>
        </div>
        <RangeCalendar
          isReadOnly
          value={{
            start: parseDate(rangeSelected.start),
            end: parseDate(rangeSelected.end),
          }}
          visibleDuration={isDatesInMultipleMonths() ? { weeks: 2 } : undefined}
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
                    data-highlight={highlighter(date)}
                    data-disabled={true}
                  >
                    {({ formattedDate }) => {
                      return (
                        <Flex flexDirection={'column'} alignItems={'center'} gap={0}>
                          {formattedDate}
                          <div className="date-marker"></div>
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
        <CalendarDisplayLegend highlightDates={highlightDates} rangeSelected={rangeSelected} />
      </div>
    </div>
  )
}
