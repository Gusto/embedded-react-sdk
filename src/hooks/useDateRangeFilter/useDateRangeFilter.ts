import { useRef, useState } from 'react'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

const MAX_RANGE_MONTHS = 12

interface UseDateRangeFilterOptions {
  onFilterChange?: () => void
  initialStartDate?: Date | null
  initialEndDate?: Date | null
  /** Latest date the end date may be set to, applied on top of the 12 month span cap. */
  latestAllowedEndDate?: Date
}

/**
 * `YYYY-MM-DD` query parameters produced by {@link UseDateRangeFilterResult.getApiDateParams}.
 *
 * @remarks
 * Each key is present only when the matching endpoint of the range is set, so the object can be
 * spread directly into a list request without sending empty values.
 *
 * @public
 */
export interface DateRangeApiParams {
  /** Inclusive start of the range as a `YYYY-MM-DD` string; omitted when no start date is set. */
  startDate?: string
  /** Inclusive end of the range as a `YYYY-MM-DD` string; omitted when no end date is set. */
  endDate?: string
}

/**
 * A start/end date range filter: the current dates, change handlers, and helpers for
 * date-picker bounds and API query params.
 *
 * @remarks
 * Returned on hooks that expose a date filter, such as
 * {@link usePayrollList | usePayrollList}'s `dateRangeFilter`. Wire the handlers to your own
 * date inputs and spread `getApiDateParams()` into requests. The span between the two dates is
 * capped at 12 months, which `getMaxEndDate` and `getMinStartDate` express as picker bounds.
 *
 * @public
 */
export interface UseDateRangeFilterResult {
  /** Inclusive start of the selected range, or `null` when unset. */
  startDate: Date | null
  /** Inclusive end of the selected range, or `null` when unset. */
  endDate: Date | null
  /** True when the current dates differ from the initial dates the filter was seeded with. */
  isModified: boolean
  /** Sets the start date, or clears it when passed `null`. */
  handleStartDateChange: (date: Date | null) => void
  /** Sets the end date, or clears it when passed `null`. */
  handleEndDateChange: (date: Date | null) => void
  /** Returns both dates to the initial values the filter was seeded with. */
  handleClearFilter: () => void
  /** Returns the set dates as `YYYY-MM-DD` request params — see {@link DateRangeApiParams}. */
  getApiDateParams: () => DateRangeApiParams
  /** Latest date the end date may be set to, or `undefined` when unbounded. */
  getMaxEndDate: () => Date | undefined
  /** Earliest date the start date may be set to, or `undefined` when unbounded. */
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
 * 12 months of the opposite endpoint; pass `latestAllowedEndDate` to also prevent end dates after
 * a fixed date. `getApiDateParams` returns only the dates that are set, formatted as `YYYY-MM-DD`
 * strings for API requests.
 *
 * @param options - Optional configuration; `onFilterChange` fires after any filter mutation.
 * @returns The current filter state and handlers — see {@link UseDateRangeFilterResult}.
 * @internal
 */
export function useDateRangeFilter(options?: UseDateRangeFilterOptions): UseDateRangeFilterResult {
  const {
    onFilterChange,
    initialStartDate = null,
    initialEndDate = null,
    latestAllowedEndDate,
  } = options ?? {}

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
    if (!startDate) return latestAllowedEndDate
    const spanLimit = addMonths(startDate, MAX_RANGE_MONTHS)
    if (!latestAllowedEndDate) return spanLimit
    return spanLimit < latestAllowedEndDate ? spanLimit : latestAllowedEndDate
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
