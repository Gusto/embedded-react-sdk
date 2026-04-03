import { useState, useRef, useCallback, useMemo } from 'react'
import { Dialog, Popover } from 'react-aria-components'
import styles from './DateRangeFilter.module.scss'
import type { DateRange } from '@/components/Common/UI/DateRangePicker/DateRangePickerTypes'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useTheme } from '@/contexts/ThemeProvider'
import FilterFunnelIcon from '@/assets/icons/filter-funnel.svg?react'

const formatFilterDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

interface DateRangeFilterProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  onClear: () => void
  startDateLabel: string
  endDateLabel: string
  applyLabel: string
  resetLabel: string
  triggerLabel: string
  isFilterActive: boolean
  maxEndDate?: Date
  minStartDate?: Date
}

export const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  startDateLabel,
  endDateLabel,
  applyLabel,
  resetLabel,
  triggerLabel,
  isFilterActive,
  maxEndDate,
  minStartDate,
}: DateRangeFilterProps) => {
  const { Button, ButtonIcon, DateRangePicker } = useComponentContext()
  const { container } = useTheme()

  const [isOpen, setIsOpen] = useState(false)
  const [draftRange, setDraftRange] = useState<DateRange | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleOpen = useCallback(() => {
    const range = startDate && endDate ? { start: startDate, end: endDate } : null
    setDraftRange(range)
    setIsOpen(true)
  }, [startDate, endDate])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleApply = useCallback(() => {
    if (draftRange) {
      onStartDateChange(draftRange.start)
      onEndDateChange(draftRange.end)
    } else {
      onClear()
    }
    setIsOpen(false)
  }, [draftRange, onStartDateChange, onEndDateChange, onClear])

  const handleReset = useCallback(() => {
    onClear()
    setIsOpen(false)
  }, [onClear])

  const handleRangeChange = useCallback((range: DateRange | null) => {
    setDraftRange(range)
  }, [])

  const filterDateLabel = useMemo(() => {
    if (!isFilterActive || !startDate || !endDate) return null
    return `${formatFilterDate(startDate)} – ${formatFilterDate(endDate)}`
  }, [isFilterActive, startDate, endDate])

  const triggerButton = filterDateLabel ? (
    <Button
      buttonRef={triggerRef}
      aria-label={triggerLabel}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      onClick={handleOpen}
      variant="secondary"
      icon={<FilterFunnelIcon />}
      className={styles.triggerButton}
    >
      {filterDateLabel}
    </Button>
  ) : (
    <ButtonIcon
      buttonRef={triggerRef}
      aria-label={triggerLabel}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      onClick={handleOpen}
      variant="tertiary"
    >
      <FilterFunnelIcon />
    </ButtonIcon>
  )

  return (
    <>
      {triggerButton}

      <Popover
        UNSTABLE_portalContainer={container.current}
        isOpen={isOpen}
        onOpenChange={open => {
          if (!open) handleClose()
        }}
        triggerRef={triggerRef}
        placement="bottom end"
        offset={8}
        shouldUpdatePosition
      >
        <Dialog aria-label={`${startDateLabel} – ${endDateLabel}`}>
          <div className={styles.popoverContent}>
            <DateRangePicker
              aria-label={`${startDateLabel} – ${endDateLabel}`}
              value={draftRange}
              onChange={handleRangeChange}
              startDateLabel={startDateLabel}
              endDateLabel={endDateLabel}
              minValue={minStartDate}
              maxValue={maxEndDate}
            />

            <Flex gap={8} justifyContent="flex-end">
              <Button variant="tertiary" onClick={handleReset}>
                {resetLabel}
              </Button>
              <Button variant="primary" onClick={handleApply}>
                {applyLabel}
              </Button>
            </Flex>
          </div>
        </Dialog>
      </Popover>
    </>
  )
}
