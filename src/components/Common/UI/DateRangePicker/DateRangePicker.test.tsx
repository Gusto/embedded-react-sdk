import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { DateRangePicker } from './DateRangePicker'
import type { DateRangePickerProps } from './DateRangePickerTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { assertDefined } from '@/test-utils/assertions'

vi.mock('@/assets/icons/caret-left.svg?react', () => ({
  default: () => <div data-testid="caret-left" />,
}))

vi.mock('@/assets/icons/caret-right.svg?react', () => ({
  default: () => <div data-testid="caret-right" />,
}))

const defaultProps = {
  label: 'Date Range',
  startDateLabel: 'From',
  endDateLabel: 'To',
  onChange: vi.fn(),
  value: { start: new Date(2020, 10, 1), end: new Date(2020, 10, 2) },
}

const renderDateRangePicker = (props: Partial<DateRangePickerProps>) =>
  renderWithProviders(<DateRangePicker {...defaultProps} {...props} />)

// June 2026: starts on Monday, so the 5-week grid runs May 31 – Jul 4.
// Day numbers chosen here appear only once in that window.
const START_DATE = new Date(2026, 5, 10) // June 10
const END_DATE = new Date(2026, 5, 20) // June 20

// react-aria labels date range spinbuttons by slot ("Start Date" / "End Date"),
// not by the startDateLabel / endDateLabel props. The full accessible name is
// "<segment>, <slot label>, <picker label>", e.g. "month, Start Date, Date Range".
const startSpinbutton = (segment: string) =>
  screen.getByRole('spinbutton', { name: new RegExp(`^${segment}.*start date`, 'i') })
const endSpinbutton = (segment: string) =>
  screen.getByRole('spinbutton', { name: new RegExp(`^${segment}.*end date`, 'i') })

describe('DateRangePicker', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('value and onChange', () => {
    test('renders correct segments for start and end Date values', () => {
      renderDateRangePicker({ value: { start: START_DATE, end: END_DATE } })

      expect(startSpinbutton('month')).toHaveAttribute('aria-valuenow', '6')
      expect(startSpinbutton('day')).toHaveAttribute('aria-valuenow', '10')
      expect(startSpinbutton('year')).toHaveAttribute('aria-valuenow', '2026')

      expect(endSpinbutton('month')).toHaveAttribute('aria-valuenow', '6')
      expect(endSpinbutton('day')).toHaveAttribute('aria-valuenow', '20')
      expect(endSpinbutton('year')).toHaveAttribute('aria-valuenow', '2026')
    })

    test('onChange receives correct start and end Date objects when user selects a range in the calendar', async () => {
      const onChange = vi.fn<DateRangePickerProps['onChange']>()
      // Provide a value in June 2026 so the calendar shows that month
      renderDateRangePicker({
        value: { start: new Date(2026, 5, 1), end: new Date(2026, 5, 28) },
        onChange,
      })

      // CalendarCell in RangeCalendar renders a <div role="button"> labeled with the full date
      const june10 = screen
        .getAllByRole('button')
        .find(btn => btn.getAttribute('aria-label')?.includes('June 10'))
      assertDefined(june10)
      await user.click(june10)

      const june20 = screen
        .getAllByRole('button')
        .find(btn => btn.getAttribute('aria-label')?.includes('June 20'))
      assertDefined(june20)
      await user.click(june20)

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled()
      })
      const range = onChange.mock.lastCall?.[0]
      assertDefined(range)

      expect(range.start).toBeInstanceOf(Date)
      expect(range.start.getFullYear()).toBe(2026)
      expect(range.start.getMonth()).toBe(5) // June = index 5
      expect(range.start.getDate()).toBe(10)

      expect(range.end).toBeInstanceOf(Date)
      expect(range.end.getFullYear()).toBe(2026)
      expect(range.end.getMonth()).toBe(5)
      expect(range.end.getDate()).toBe(20)
    })
  })

  describe('date constraints', () => {
    test('minValue disables dates before the minimum in the calendar', () => {
      renderDateRangePicker({
        value: { start: START_DATE, end: END_DATE },
        minValue: new Date(2026, 5, 15),
      })

      const cells = screen.getAllByRole('gridcell')

      const june8 = cells.find(c => c.textContent.trim() === '8')
      assertDefined(june8)
      expect(june8).toHaveAttribute('aria-disabled', 'true')

      const june20 = cells.find(c => c.textContent.trim() === '20')
      assertDefined(june20)
      expect(june20).not.toHaveAttribute('aria-disabled')
    })

    test('maxValue disables dates after the maximum in the calendar', () => {
      renderDateRangePicker({
        value: { start: START_DATE, end: END_DATE },
        maxValue: new Date(2026, 5, 15),
      })

      const cells = screen.getAllByRole('gridcell')

      const june25 = cells.find(c => c.textContent.trim() === '25')
      assertDefined(june25)
      expect(june25).toHaveAttribute('aria-disabled', 'true')

      const june10 = cells.find(c => c.textContent.trim() === '10')
      assertDefined(june10)
      expect(june10).not.toHaveAttribute('aria-disabled')
    })
  })
})
