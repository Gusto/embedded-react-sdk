import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, it, expect } from 'vitest'
import { Select } from './Select'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Mock the SVG import
vi.mock('@/assets/icons/caret-down.svg?react', () => ({
  default: () => <div data-testid="caret-down" />,
}))

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
  return renderWithProviders(<Select {...defaultProps} {...props} />)
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
    expect(screen.queryByText('(optional)')).not.toBeInTheDocument()
  })

  test('renders as optional', () => {
    renderSelect()
    expect(screen.getByText('(optional)')).toBeInTheDocument()
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
    renderSelect({ onBlur })
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

  test('returns focus to the trigger after selecting an item', async () => {
    renderSelect()
    const button = screen.getByRole('button')

    // Open the listbox and verify it's open
    await user.click(button)
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    // Select an option
    const option = screen.getByRole('option', { name: 'Option 1' })
    await user.click(option)

    // The listbox should be closed, and focus should be returned to the button
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      expect(document.activeElement).toBe(button)
    })
  })

  describe('Accessibility', () => {
    const mockOptions = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ]

    const testCases = [
      {
        name: 'basic select',
        props: { label: 'Choose an option', options: mockOptions },
      },
      {
        name: 'disabled select',
        props: { label: 'Disabled select', options: mockOptions, isDisabled: true },
      },
      {
        name: 'required select',
        props: { label: 'Required select', options: mockOptions, isRequired: true },
      },
      {
        name: 'select with error',
        props: {
          label: 'Select with error',
          options: mockOptions,
          isInvalid: true,
          errorMessage: 'Please select an option',
        },
      },
      {
        name: 'select with description',
        props: {
          label: 'Select with help',
          options: mockOptions,
          description: 'Choose the best option for your needs',
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Select {...props} />)
        await expectNoAxeViolations(container)
      },
    )

    it('should not have accessibility violations when the listbox is open', async () => {
      const { container } = renderWithProviders(
        <Select label="Choose an option" options={mockOptions} />,
      )
      const button = screen.getByRole('button')

      // Open the listbox
      await userEvent.click(button)
      expect(screen.getByRole('listbox')).toBeInTheDocument()

      await expectNoAxeViolations(container)
    })
  })
})
