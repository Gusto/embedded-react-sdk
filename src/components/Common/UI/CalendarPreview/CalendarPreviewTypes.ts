export type CalendarPreviewProps = {
  highlightDates?: Array<{
    date: Date
    highlightColor: 'primary' | 'secondary'
    label: string
  }>
  dateRange: {
    start: Date
    end: Date
    label: string
  }
}
