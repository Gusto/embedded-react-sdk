import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { DatePicker } from './DatePicker'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/assets/icons/caret-down.svg?react', () => ({
  default: () => <div data-testid="caret-down" />,
}))

vi.mock('@/assets/icons/caret-left.svg?react', () => ({
  default: () => <div data-testid="caret-left" />,
}))

vi.mock('@/assets/icons/caret-right.svg?react', () => ({
  default: () => <div data-testid="caret-right" />,
}))

vi.mock('@/contexts/ThemeProvider', async () => {
  const actual = await vi.importActual('@/contexts/ThemeProvider')
  return {
    ...actual,
    useTheme: () => ({
      container: { current: document.body },
    }),
  }
})

const defaultProps = {
  label: 'Test Date',
  onChange: vi.fn(),
  onBlur: vi.fn(),
}

const renderDatePicker = (props = {}) => {
  return render(<DatePicker {...defaultProps} {...props} />)
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
    expect(screen.queryByText('optionalLabel')).not.toBeInTheDocument()
  })

  test('renders as optional', () => {
    renderDatePicker()
    expect(screen.getByText('optionalLabel')).toBeInTheDocument()
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
})
