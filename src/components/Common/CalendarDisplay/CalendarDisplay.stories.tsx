import type { CalendarDisplayProps } from './CalendarDisplay'
import { CalendarDisplay } from './CalendarDisplay'

// Adding a meta object for title
export default {
  title: 'UI/Components/CalendarDisplay', // Creates nesting structure for UI components
}

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
        highlightColor: 'warning',
        label: 'Run payroll by 1:00PM (PDT) on ',
      },
      {
        date: '2025-02-24',
        highlightColor: 'primary',
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
        highlightColor: 'warning',
        label: 'Run payroll by 1:00PM (PDT) on ',
      },
      {
        date: '2025-04-04',
        highlightColor: 'primary',
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
        highlightColor: 'warning',
        label: 'Run payroll by 1:00PM (PDT) on ',
      },
      {
        date: '2025-03-27',
        highlightColor: 'primary',
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
