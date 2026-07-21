import { useRef, useState } from 'react'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

const MAX_RANGE_MONTHS = 12

interface UseDateRangeFilterOptions {
  onFilterChange?: () => void
  initialStartDate?: Date | null
  initialEndDate?: Date | null
}

interface DateRangeApiParams {
  startDate?: string
  endDate?: string
}

/**
 * Return shape of {@link useDateRangeFilter}, exposing the current filter dates,
 * change handlers, and helpers for date-picker bounds and API query params.
 *
 * @internal
 */
export interface UseDateRangeFilterResult {
  startDate: Date | null
  endDate: Date | null
  /** True when the current dates differ from the initial dates the hook was seeded with. */
  isModified: boolean
  handleStartDateChange: (date: Date | null) => void
  handleEndDateChange: (date: Date | null) => void
  handleClearFilter: () => void
  getApiDateParams: () => DateRangeApiParams
  getMaxEndDate: () => Date | undefined
  getMinStartDate: () => Date | undefined
}

const toISODateString = (date: Date): string => formatDateToStringDate(date) ?? ''

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Manages a start/end date range filter as a single source of truth, capping the span at 12 months.
 *
 * @remarks
 * Seed the hook with `initialStartDate` / `initialEndDate` to render a default range on load;
 * `handleClearFilter` returns to those initial values (not `null`). `getMaxEndDate` and
 * `getMinStartDate` return bounds for date pickers that keep the selected range within
 * 12 months of the opposite endpoint. `getApiDateParams` returns only the dates that are set,
 * formatted as `YYYY-MM-DD` strings for API requests.
 *
 * @param options - Optional configuration; `onFilterChange` fires after any filter mutation.
 * @returns The current filter state and handlers — see {@link UseDateRangeFilterResult}.
 * @internal
 */
export function useDateRangeFilter(options?: UseDateRangeFilterOptions): UseDateRangeFilterResult {
  const { onFilterChange, initialStartDate = null, initialEndDate = null } = options ?? {}

  const initialRef = useRef<{ start: Date | null; end: Date | null }>({
    start: initialStartDate,
    end: initialEndDate,
  })

  const [startDate, setStartDate] = useState<Date | null>(initialRef.current.start)
  const [endDate, setEndDate] = useState<Date | null>(initialRef.current.end)

  const isModified = startDate !== initialRef.current.start || endDate !== initialRef.current.end

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date)
    onFilterChange?.()
  }

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date)
    onFilterChange?.()
  }

  const handleClearFilter = () => {
    setStartDate(initialRef.current.start)
    setEndDate(initialRef.current.end)
    onFilterChange?.()
  }

  const getApiDateParams = (): DateRangeApiParams => {
    const params: DateRangeApiParams = {}
    if (startDate) {
      params.startDate = toISODateString(startDate)
    }
    if (endDate) {
      params.endDate = toISODateString(endDate)
    }
    return params
  }

  const getMaxEndDate = (): Date | undefined => {
    if (!startDate) return undefined
    return addMonths(startDate, MAX_RANGE_MONTHS)
  }

  const getMinStartDate = (): Date | undefined => {
    if (!endDate) return undefined
    return addMonths(endDate, -MAX_RANGE_MONTHS)
  }

  return {
    startDate,
    endDate,
    isModified,
    handleStartDateChange,
    handleEndDateChange,
    handleClearFilter,
    getApiDateParams,
    getMaxEndDate,
    getMinStartDate,
  }
}
