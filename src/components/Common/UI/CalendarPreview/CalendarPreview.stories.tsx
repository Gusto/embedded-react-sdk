import type { CalendarPreviewProps } from './CalendarPreviewTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/CalendarPreview',
}

export const CalendarOneMonthDefault = () => {
  const Components = useComponentContext()
  const props: CalendarPreviewProps = {
    dateRange: {
      start: new Date('2025-02-02'),
      end: new Date('2025-02-10'),
      label: 'Pay Period',
    },
    highlightDates: [
      {
        date: new Date('2025-02-20'),
        highlightColor: 'secondary',
        label: 'Run payroll by 1:00PM (PDT) on ',
      },
      {
        date: new Date('2025-02-24'),
        highlightColor: 'primary',
        label: 'Payday',
      },
    ],
  }

  return (
    <>
      <Components.CalendarPreview {...props} />
    </>
  )
}

export const CalendarTwoMonthsDefault = () => {
  const Components = useComponentContext()
  const props: CalendarPreviewProps = {
    dateRange: {
      start: new Date('2025-03-15'),
      end: new Date('2025-03-28'),
      label: 'Pay Period',
    },
    highlightDates: [
      {
        date: new Date('2025-04-02'),
        highlightColor: 'secondary',
        label: 'Run payroll by 1:00PM (PDT) on ',
      },
      {
        date: new Date('2025-04-04'),
        highlightColor: 'primary',
        label: 'Payday',
      },
    ],
  }

  return (
    <>
      <Components.CalendarPreview {...props} />
    </>
  )
}

export const CalendarDatesWithinRange = () => {
  const Components = useComponentContext()
  const props: CalendarPreviewProps = {
    dateRange: {
      start: new Date('2025-03-15'),
      end: new Date('2025-03-28'),
      label: 'Pay Period',
    },
    highlightDates: [
      {
        date: new Date('2025-03-24'),
        highlightColor: 'secondary',
        label: 'Run payroll by 1:00PM (PDT) on ',
      },
      {
        date: new Date('2025-03-27'),
        highlightColor: 'primary',
        label: 'Payday',
      },
    ],
  }

  return (
    <>
      <Components.CalendarPreview {...props} />
    </>
  )
}
