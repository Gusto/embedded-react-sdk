/**
 * Inclusive start/end pair representing a date range selected in a
 * {@link DateRangePickerProps | DateRangePicker}.
 *
 * @public
 * @childOf {@link DateRangePickerProps}
 */
export interface DateRange {
  /**
   * First date in the range, inclusive.
   */
  start: Date
  /**
   * Last date in the range, inclusive.
   */
  end: Date
}

/**
 * Props your `DateRangePicker` implementation must accept from the component adapter.
 * Renders a form field wrapping paired `<input type="date" />` elements for selecting an inclusive date range.
 *
 * @public
 * @group Component props
 */
export interface DateRangePickerProps {
  /**
   * Label text for the date range field.
   */
  label: string
  /**
   * Hides the label visually while keeping it accessible to screen readers.
   */
  shouldVisuallyHideLabel?: boolean
  /**
   * Currently selected date range, or null when nothing is selected.
   */
  value: DateRange | null
  /**
   * Callback fired when the selected range changes. Receives null when the range is cleared.
   */
  onChange: (range: DateRange | null) => void
  /**
   * Accessible label for the start-date input.
   */
  startDateLabel: string
  /**
   * Accessible label for the end-date input.
   */
  endDateLabel: string
  /**
   * Earliest selectable date. Dates before this are disabled.
   */
  minValue?: Date
  /**
   * Latest selectable date. Dates after this are disabled.
   */
  maxValue?: Date
}
