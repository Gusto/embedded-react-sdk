import { useState } from 'react'

const MAX_RANGE_MONTHS = 12

interface UseDateRangeFilterOptions {
  onFilterChange?: () => void
}

interface DateRangeApiParams {
  startDate?: string
  endDate?: string
}

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

const toISODateString = (date: Date): string => date.toISOString().split('T')[0]!

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

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
