import { useState } from 'react'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

const MAX_RANGE_MONTHS = 12

interface UseDateRangeFilterOptions {
  onFilterChange?: () => void
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
  filterStartDate: Date | null
  filterEndDate: Date | null
  isFilterActive: boolean
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
 * Manages an optional start/end date range filter, capping the span at 12 months.
 *
 * @remarks
 * `getMaxEndDate` and `getMinStartDate` return bounds for date pickers that keep the
 * selected range within 12 months of the opposite endpoint. `getApiDateParams` returns
 * only the dates that are set, formatted as `YYYY-MM-DD` strings for API requests.
 *
 * @param options - Optional configuration; `onFilterChange` fires after any filter mutation.
 * @returns The current filter state and handlers — see {@link UseDateRangeFilterResult}.
 * @internal
 */
export function useDateRangeFilter(options?: UseDateRangeFilterOptions): UseDateRangeFilterResult {
  const { onFilterChange } = options ?? {}

  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null)
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null)

  const isFilterActive = filterStartDate !== null || filterEndDate !== null

  const handleStartDateChange = (date: Date | null) => {
    setFilterStartDate(date)
    onFilterChange?.()
  }

  const handleEndDateChange = (date: Date | null) => {
    setFilterEndDate(date)
    onFilterChange?.()
  }

  const handleClearFilter = () => {
    setFilterStartDate(null)
    setFilterEndDate(null)
    onFilterChange?.()
  }

  const getApiDateParams = (): DateRangeApiParams => {
    const params: DateRangeApiParams = {}
    if (filterStartDate) {
      params.startDate = toISODateString(filterStartDate)
    }
    if (filterEndDate) {
      params.endDate = toISODateString(filterEndDate)
    }
    return params
  }

  const getMaxEndDate = (): Date | undefined => {
    if (!filterStartDate) return undefined
    return addMonths(filterStartDate, MAX_RANGE_MONTHS)
  }

  const getMinStartDate = (): Date | undefined => {
    if (!filterEndDate) return undefined
    return addMonths(filterEndDate, -MAX_RANGE_MONTHS)
  }

  return {
    filterStartDate,
    filterEndDate,
    isFilterActive,
    handleStartDateChange,
    handleEndDateChange,
    handleClearFilter,
    getApiDateParams,
    getMaxEndDate,
    getMinStartDate,
  }
}
