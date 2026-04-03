import type { RefObject } from 'react'

export interface DateRange {
  start: Date
  end: Date
}

export interface DateRangePickerProps {
  'aria-label': string
  value: DateRange | null
  onChange: (range: DateRange | null) => void
  startDateLabel: string
  endDateLabel: string
  minValue?: Date
  maxValue?: Date
  portalContainerRef?: RefObject<HTMLElement | null>
}
