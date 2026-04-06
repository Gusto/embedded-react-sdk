export interface DateRange {
  start: Date
  end: Date
}

export interface DateRangePickerProps {
  label: string
  shouldVisuallyHideLabel?: boolean
  value: DateRange | null
  onChange: (range: DateRange | null) => void
  startDateLabel: string
  endDateLabel: string
  minValue?: Date
  maxValue?: Date
}
