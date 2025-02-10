import {
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateValue,
  Text,
  Heading,
  RangeCalendar,
} from 'react-aria-components'
import { Button, Flex } from '@/components/Common'
import { parseDate } from '@internationalized/date'

export type CalendarDisplayProps = {
  highlightDates?: Array<{
    date: string
    highlightColor: 'orange' | 'green' | 'black' | 'gray'
    label: string
  }>
  rangeSelected: {
    start: string
    end: string
    label: string
  }
}

export const CalendarDisplay = ({ rangeSelected, highlightDates }: CalendarDisplayProps) => {
  //   const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  //   const value = parseDate(formattedDate)

  const highlighter = (date: DateValue) => {
    if (highlightDates) {
      const highlight = highlightDates.find(h => h.date.toString() === date.toString())
      if (highlight) {
        return highlight.highlightColor
      }
    }
  }

  return (
    <>
      <RangeCalendar
        isReadOnly
        defaultValue={{
          start: parseDate(rangeSelected.start),
          end: parseDate(rangeSelected.end),
        }}
      >
        <header>
          <Button slot="previous">◀</Button>
          <Heading />
          <Button slot="next">▶</Button>
        </header>
        <CalendarGrid>
          <CalendarGridHeader>{day => <CalendarHeaderCell />}</CalendarGridHeader>
          <CalendarGridBody>
            {date => {
              return (
                <CalendarCell
                  className="react-aria-CalendarCell"
                  date={date}
                  data-highlight={highlighter(date)}
                >
                  {({ formattedDate }) => {
                    return formattedDate
                  }}
                </CalendarCell>
              )
            }}
          </CalendarGridBody>
        </CalendarGrid>
        <Text slot="errorMessage" />
      </RangeCalendar>
    </>
  )
}
