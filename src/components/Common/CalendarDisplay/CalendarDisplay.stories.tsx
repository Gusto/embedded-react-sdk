import { CalendarDisplay, CalendarDisplayProps } from './CalendarDisplay'
import { CalendarDisplayLegend } from './CalendarDisplayLegend'

export const CalendarDisplayDefault = () => {
  const props: CalendarDisplayProps = {
    rangeSelected: {
      start: '2025-02-02',
      end: '2025-02-09',
      label: 'Pay Period',
    },
    highlightDates: [
      {
        date: '2025-02-20',
        highlightColor: 'orange',
        label: 'Holiday',
      },
      {
        date: '2025-02-22',
        highlightColor: 'green',
        label: 'Payday',
      },
      {
        date: '2025-02-24',
        highlightColor: 'black',
        label: 'Vacation',
      },
      {
        date: '2025-02-26',
        highlightColor: 'gray',
        label: 'Sick Day',
      },
    ],
  }

  return (
    <>
      <CalendarDisplay {...props} />
      <CalendarDisplayLegend {...props} />
    </>
  )
}
