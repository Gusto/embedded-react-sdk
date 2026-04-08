import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateRangeFilter } from './DateRangeFilter'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const defaultProps = {
  startDate: null,
  endDate: null,
  onStartDateChange: vi.fn(),
  onEndDateChange: vi.fn(),
  onClear: vi.fn(),
  startDateLabel: 'From',
  endDateLabel: 'To',
  applyLabel: 'Apply',
  cancelLabel: 'Cancel',
  resetLabel: 'Reset',
  selectDatesLabel: 'Select dates',
  triggerLabel: 'Filter by date',
  isFilterActive: false,
}

describe('DateRangeFilter', () => {
  const user = userEvent.setup()

  it('renders the filter trigger button', () => {
    renderWithProviders(<DateRangeFilter {...defaultProps} />)

    expect(screen.getByRole('button', { name: 'Filter by date' })).toBeInTheDocument()
  })

  it('opens popover with date range picker on trigger click', async () => {
    renderWithProviders(<DateRangeFilter {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Filter by date' }))

    await waitFor(() => {
      expect(screen.getByText('From')).toBeInTheDocument()
      expect(screen.getByText('To')).toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'From – To' })).toBeInTheDocument()
    })
  })

  it('shows Apply and Reset buttons in popover', async () => {
    renderWithProviders(<DateRangeFilter {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Filter by date' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    })
  })

  it('calls onClear and closes popover when Reset is clicked', async () => {
    const onClear = vi.fn()
    renderWithProviders(<DateRangeFilter {...defaultProps} onClear={onClear} />)

    await user.click(screen.getByRole('button', { name: 'Filter by date' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(onClear).toHaveBeenCalledOnce()
  })

  it('uses secondary variant and shows date range for trigger when filter is active', () => {
    renderWithProviders(
      <DateRangeFilter
        {...defaultProps}
        isFilterActive={true}
        startDate={new Date(2025, 2, 10)}
        endDate={new Date(2025, 3, 16)}
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Filter by date' })
    expect(trigger).toHaveAttribute('data-variant', 'secondary')
    expect(trigger).toHaveTextContent('Mar 10 – Apr 16')
  })

  it('uses tertiary variant for trigger when filter is not active', () => {
    renderWithProviders(<DateRangeFilter {...defaultProps} isFilterActive={false} />)

    const trigger = screen.getByRole('button', { name: 'Filter by date' })
    expect(trigger).toHaveAttribute('data-variant', 'tertiary')
  })
})
