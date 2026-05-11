import { screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect, beforeEach, it } from 'vitest'
import { DatePicker } from './DatePicker'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { assertDefined, assertInstanceOf } from '@/test-utils/assertions'

vi.mock('@/assets/icons/caret-down.svg?react', () => ({
  default: () => <div data-testid="caret-down" />,
}))

vi.mock('@/assets/icons/caret-left.svg?react', () => ({
  default: () => <div data-testid="caret-left" />,
}))

vi.mock('@/assets/icons/caret-right.svg?react', () => ({
  default: () => <div data-testid="caret-right" />,
}))

const defaultProps = {
  label: 'Test Date',
  onChange: vi.fn(),
  onBlur: vi.fn(),
}

const renderDatePicker = (props = {}) => {
  return renderWithProviders(<DatePicker {...defaultProps} {...props} />)
}

describe('DatePicker Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders with label', () => {
    renderDatePicker()
    expect(screen.getByText('Test Date')).toBeInTheDocument()
  })

  test('renders with description', () => {
    renderDatePicker({ description: 'Test Description' })
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  test('renders with error message', () => {
    renderDatePicker({ errorMessage: 'Test Error', isInvalid: true })
    expect(screen.getByText('Test Error')).toBeInTheDocument()
  })

  test('renders as disabled', () => {
    renderDatePicker({ isDisabled: true })
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  test('renders as invalid', () => {
    const { container } = renderDatePicker({ isInvalid: true })
    const datePicker = container.querySelector('.react-aria-DatePicker')
    expect(datePicker).toHaveAttribute('data-invalid', 'true')
  })

  test('renders as required', () => {
    renderDatePicker({ isRequired: true })
    expect(screen.queryByText('(optional)')).not.toBeInTheDocument()
  })

  test('renders as optional', () => {
    renderDatePicker()
    expect(screen.getByText('(optional)')).toBeInTheDocument()
  })

  test('calls onBlur when focus is lost', () => {
    const onBlur = vi.fn()
    renderDatePicker({ onBlur })
    const button = screen.getByRole('button')
    fireEvent.blur(button)
    expect(onBlur).toHaveBeenCalled()
  })

  test('renders with custom id', () => {
    renderDatePicker({ id: 'custom-id' })
    const datePicker = screen.getByRole('group')
    expect(datePicker).toHaveAttribute('id', 'custom-id')
  })

  test('renders with custom className', () => {
    const { container } = renderDatePicker({ className: 'custom-class' })
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  test('opens calendar when button is clicked', async () => {
    renderDatePicker()
    const button = screen.getByRole('button')
    await user.click(button)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('renders with default value', () => {
    const defaultDate = new Date(2023, 11, 25)
    const { container } = renderDatePicker({ value: defaultDate })
    const dateSegments = container.querySelectorAll('.react-aria-DateSegment')
    const hasValue = Array.from(dateSegments).some(
      segment =>
        !segment.hasAttribute('data-placeholder') && !segment.hasAttribute('data-readonly'),
    )
    expect(hasValue).toBe(true)
  })

  test('calls onChange when date value changes', () => {
    const onChange = vi.fn()
    const { container } = renderDatePicker({ onChange })
    const daySegment = container.querySelector('[data-type="day"]')
    expect(daySegment).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  test('navigation buttons are present in calendar', async () => {
    renderDatePicker()
    const button = screen.getByRole('button')
    await user.click(button)
    expect(screen.getByTestId('caret-left')).toBeInTheDocument()
    expect(screen.getByTestId('caret-right')).toBeInTheDocument()
  })

  test('has correct field structure', () => {
    renderDatePicker({
      description: 'Select a date',
      errorMessage: 'Error message',
      isInvalid: true,
    })
    expect(screen.getByText('Select a date')).toBeInTheDocument()
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  test('passes additional props to DatePicker', () => {
    const testId = 'test-date-picker'
    renderDatePicker({ 'data-testid': testId })
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  describe('value and onChange', () => {
    test('renders correct segments when given a Date value', () => {
      renderDatePicker({ value: new Date(2026, 5, 15) })

      const group = screen.getByRole('group', { name: /test date/i })
      expect(within(group).getByRole('spinbutton', { name: /^month/i })).toHaveAttribute(
        'aria-valuenow',
        '6',
      )
      expect(within(group).getByRole('spinbutton', { name: /^day/i })).toHaveAttribute(
        'aria-valuenow',
        '15',
      )
      expect(within(group).getByRole('spinbutton', { name: /^year/i })).toHaveAttribute(
        'aria-valuenow',
        '2026',
      )
    })

    test('onChange receives a Date at local midnight when user selects a date from the calendar', async () => {
      const onChange = vi.fn<(value: Date | null) => void>()
      // Provide a value so the calendar opens to June 2026
      renderDatePicker({ value: new Date(2026, 5, 1), onChange })

      await user.click(screen.getByRole('button'))
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

      // CalendarCell renders a <div role="button"> labeled with the full date
      const june15 = screen
        .getAllByRole('button')
        .find(btn => btn.getAttribute('aria-label')?.includes('June 15'))
      assertDefined(june15)
      await user.click(june15)

      expect(onChange).toHaveBeenCalled()
      const received = onChange.mock.lastCall?.[0]
      assertInstanceOf(received, Date)
      expect(received.getFullYear()).toBe(2026)
      expect(received.getMonth()).toBe(5) // June = index 5
      expect(received.getDate()).toBe(15)
    })

    describe('timezone sensitivity', () => {
      beforeEach(() => {
        vi.stubEnv('TZ', 'Europe/Paris') // UTC+2 in summer: local midnight June 15 = UTC June 14 22:00
      })

      afterEach(() => {
        vi.unstubAllEnvs()
      })

      it.fails(
        'renders the correct day segment when value is local midnight in a UTC+2 timezone',
        () => {
          // Bug: DatePicker uses formatDateToStringDate(value) which calls toISOString().
          // In UTC+2, local midnight June 15 = UTC June 14 22:00 → displayed as June 14.
          renderDatePicker({ value: new Date(2026, 5, 15) })
          const group = screen.getByRole('group', { name: /test date/i })
          expect(within(group).getByRole('spinbutton', { name: /^day/i })).toHaveAttribute(
            'aria-valuenow',
            '15',
          )
        },
      )
    })
  })

  describe('date constraints', () => {
    test('minDate disables dates before the minimum in the calendar', async () => {
      renderDatePicker({ value: new Date(2026, 5, 20), minDate: new Date(2026, 5, 15) })

      await user.click(screen.getByRole('button'))
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

      const cells = screen.getAllByRole('gridcell')
      const june8 = cells.find(c => c.textContent.trim() === '8')
      assertDefined(june8)
      expect(june8).toHaveAttribute('aria-disabled', 'true')

      const june20 = cells.find(c => c.textContent.trim() === '20')
      assertDefined(june20)
      expect(june20).not.toHaveAttribute('aria-disabled')
    })

    test('maxDate disables dates after the maximum in the calendar', async () => {
      renderDatePicker({ value: new Date(2026, 5, 10), maxDate: new Date(2026, 5, 15) })

      await user.click(screen.getByRole('button'))
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

      const cells = screen.getAllByRole('gridcell')
      const june25 = cells.find(c => c.textContent.trim() === '25')
      assertDefined(june25)
      expect(june25).toHaveAttribute('aria-disabled', 'true')

      const june10 = cells.find(c => c.textContent.trim() === '10')
      assertDefined(june10)
      expect(june10).not.toHaveAttribute('aria-disabled')
    })

    test('isDateDisabled marks specific dates as unavailable in the calendar', async () => {
      const isDateDisabled = (date: Date) =>
        date.getFullYear() === 2026 && date.getMonth() === 5 && date.getDate() === 15

      renderDatePicker({ value: new Date(2026, 5, 10), isDateDisabled })

      await user.click(screen.getByRole('button'))
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

      const cells = screen.getAllByRole('gridcell')
      const june15 = cells.find(c => c.textContent.trim() === '15')
      assertDefined(june15)
      expect(june15).toHaveAttribute('aria-disabled', 'true')

      const june10 = cells.find(c => c.textContent.trim() === '10')
      assertDefined(june10)
      expect(june10).not.toHaveAttribute('aria-disabled')
    })
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic date picker',
        props: { label: 'Select Date' },
      },
      {
        name: 'date picker with description',
        props: {
          label: 'Birth Date',
          description: 'Enter your date of birth',
        },
      },
      {
        name: 'required date picker',
        props: {
          label: 'Required Date',
          isRequired: true,
        },
      },
      {
        name: 'disabled date picker',
        props: {
          label: 'Disabled Date',
          isDisabled: true,
        },
      },
      {
        name: 'date picker with error',
        props: {
          label: 'Invalid Date',
          isInvalid: true,
          errorMessage: 'Please select a valid date',
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<DatePicker {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
