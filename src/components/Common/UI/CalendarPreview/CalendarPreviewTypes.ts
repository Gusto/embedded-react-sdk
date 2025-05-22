export type CalendarPreviewProps = {
  /**
   * Array of dates to highlight with custom colors and labels
   */
  highlightDates?: Array<{
    /**
     * Date to highlight
     */
    date: Date
    /**
     * Color to use for highlighting
     */
    highlightColor: 'primary' | 'secondary'
    /**
     * Label text for the highlighted date
     */
    label: string
  }>
  /**
   * Date range to display in the calendar preview
   */
  dateRange: {
    /**
     * Start date of the range
     */
    start: Date
    /**
     * End date of the range
     */
    end: Date
    /**
     * Label text for the date range
     */
    label: string
  }
}
