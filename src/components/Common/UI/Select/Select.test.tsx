import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect } from 'vitest'
import { Select } from './Select'
import { ThemeProvider } from '@/contexts/ThemeProvider'

// Mock the translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock the SVG import
vi.mock('@/assets/icons/caret-down.svg?react', () => ({
  default: () => <div data-testid="caret-down" />,
}))

// Mock the ThemeProvider context
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
  label: 'Test Label',
  options: [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ],
  onChange: vi.fn(),
  onBlur: vi.fn(),
}

const renderSelect = (props = {}) => {
  return render(<Select {...defaultProps} {...props} />)
}

describe('Select Component', () => {
  const user = userEvent.setup()

  test('renders with label', () => {
    renderSelect()
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  test('renders with description', () => {
    renderSelect({ description: 'Test Description' })
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  test('renders with error message', () => {
    renderSelect({ errorMessage: 'Test Error', isInvalid: true })
    expect(screen.getByText('Test Error')).toBeInTheDocument()
  })

  test('renders with placeholder', () => {
    renderSelect({ placeholder: 'Select an option' })
    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  test('renders with selected value', () => {
    const onChange = vi.fn()
    renderSelect({ value: '1', onChange })
    expect(screen.getByRole('button')).toHaveTextContent('Option 1')
  })

  test('renders as disabled', () => {
    renderSelect({ isDisabled: true })
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('renders as invalid', () => {
    renderSelect({ isInvalid: true })
    expect(screen.getByRole('button').parentElement).toHaveAttribute('data-invalid')
  })

  test('renders as required', () => {
    renderSelect({ isRequired: true })
    expect(screen.queryByText('optionalLabel')).not.toBeInTheDocument()
  })

  test('renders as optional', () => {
    renderSelect()
    expect(screen.getByText('optionalLabel')).toBeInTheDocument()
  })

  test('opens dropdown when clicked', async () => {
    renderSelect()
    const button = screen.getByRole('button')
    await user.click(button)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  test('calls onChange when an option is selected', async () => {
    const onChange = vi.fn()
    renderSelect({ onChange })
    const button = screen.getByRole('button')
    await user.click(button)
    const option = screen.getByRole('option', { name: 'Option 1' })
    await user.click(option)
    expect(onChange).toHaveBeenCalledWith('1')
  })

  test('should call onBlur when focus is lost', () => {
    const onBlur = vi.fn()

    render(
      <ThemeProvider>
        <Select {...defaultProps} onBlur={onBlur} />
      </ThemeProvider>,
    )

    const button = screen.getByRole('button')
    fireEvent.blur(button)

    expect(onBlur).toHaveBeenCalled()
  })

  test('renders with custom id', () => {
    renderSelect({ id: 'custom-id' })
    expect(screen.getByRole('button')).toHaveAttribute('id', 'custom-id')
  })

  test('renders with custom name', () => {
    const { container } = renderSelect({ name: 'custom-name' })
    const hiddenSelect = container.querySelector('select[name="custom-name"]')
    expect(hiddenSelect).toHaveAttribute('name', 'custom-name')
  })

  test('renders with custom className', () => {
    const { container } = renderSelect({ className: 'custom-class' })
    const element = container.querySelector('.custom-class')
    expect(element).toHaveClass('custom-class')
  })
})
