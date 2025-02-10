import { CalendarDisplay, CalendarDisplayProps } from './CalendarDisplay'

export const CalendarDisplayOneMonthDefault = () => {
  const props: CalendarDisplayProps = {
    rangeSelected: {
      start: '2025-02-02',
      end: '2025-02-10',
      label: 'Pay Period',
    },
    highlightDates: [
      {
        date: '2025-02-20',
        highlightColor: 'orange',
        label: 'Run payroll by 1:00PM (PDT) on ',
      },
      {
        date: '2025-02-24',
        highlightColor: 'black',
        label: 'Payday',
      },
    ],
  }

  return (
    <>
      <CalendarDisplay {...props} />
    </>
  )
}

export const CalendarDisplayTwoMonthsDefault = () => {
  const props: CalendarDisplayProps = {
    rangeSelected: {
      start: '2025-03-15',
      end: '2025-03-28',
      label: 'Pay Period',
    },
    highlightDates: [
      {
        date: '2025-04-02',
        highlightColor: 'orange',
        label: 'Run payroll by 1:00PM (PDT) on ',
      },
      {
        date: '2025-04-04',
        highlightColor: 'black',
        label: 'Payday',
      },
    ],
  }

  return (
    <>
      <CalendarDisplay {...props} />
    </>
  )
}

export const CalendarDisplayDatesWithinRange = () => {
  const props: CalendarDisplayProps = {
    rangeSelected: {
      start: '2025-03-15',
      end: '2025-03-28',
      label: 'Pay Period',
    },
    highlightDates: [
      {
        date: '2025-03-24',
        highlightColor: 'orange',
        label: 'Run payroll by 1:00PM (PDT) on ',
      },
      {
        date: '2025-03-27',
        highlightColor: 'black',
        label: 'Payday',
      },
    ],
  }

  return (
    <>
      <CalendarDisplay {...props} />
    </>
  )
}
