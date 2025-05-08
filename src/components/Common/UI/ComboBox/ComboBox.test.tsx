import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect } from 'vitest'
import { ComboBox } from './ComboBox'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const defaultProps = {
  label: 'Test Label',
  options: [
    { label: 'Option 1', value: '1', id: '1' },
    { label: 'Option 2', value: '2', id: '2' },
  ],
  onChange: vi.fn(),
  onBlur: vi.fn(),
}

const renderComboBox = (props = {}) => {
  return renderWithProviders(<ComboBox {...defaultProps} {...props} />)
}

describe('ComboBox Component', () => {
  const user = userEvent.setup()

  test('renders with label', () => {
    renderComboBox()
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  test('renders with description', () => {
    renderComboBox({ description: 'Test Description' })
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  test('renders with error message', () => {
    renderComboBox({ errorMessage: 'Test Error', isInvalid: true })
    expect(screen.getByText('Test Error')).toBeInTheDocument()
  })

  test('renders with placeholder', () => {
    renderComboBox({ placeholder: 'Type something' })
    expect(screen.getByPlaceholderText('Type something')).toBeInTheDocument()
  })

  test('renders as disabled', () => {
    renderComboBox({ isDisabled: true })
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  test('renders as invalid', () => {
    renderComboBox({ isInvalid: true })
    expect(screen.getByRole('combobox').closest('[data-invalid]')).toBeInTheDocument()
  })

  test('renders as required', () => {
    renderComboBox({ isRequired: true })
    expect(screen.queryByText('(optional)')).not.toBeInTheDocument()
  })

  test('renders as optional', () => {
    renderComboBox()
    expect(screen.getByText('(optional)')).toBeInTheDocument()
  })

  test('calls onBlur when focus is lost', () => {
    const onBlur = vi.fn()
    renderComboBox({ onBlur })

    const input = screen.getByRole('combobox')
    fireEvent.blur(input)

    expect(onBlur).toHaveBeenCalled()
  })

  test('renders with custom id', () => {
    renderComboBox({ id: 'custom-id' })
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('id', 'custom-id')
  })

  test('renders with custom className', () => {
    const { container } = renderComboBox({ className: 'custom-class' })
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  test('opens listbox when interacted with', async () => {
    renderComboBox()
    const combobox = screen.getByRole('combobox')

    await user.click(combobox)

    // The listbox should be visible after clicking
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  test('shows options when opened', async () => {
    renderComboBox()
    const combobox = screen.getByRole('combobox')

    await user.click(combobox)

    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument()
  })

  test('calls onChange when an option is selected', async () => {
    const onChange = vi.fn()
    renderComboBox({ onChange })

    const combobox = screen.getByRole('combobox')
    await user.click(combobox)

    const option = screen.getByRole('option', { name: 'Option 1' })
    await user.click(option)

    expect(onChange).toHaveBeenCalledWith('1')
  })

  test('displays selected value', () => {
    renderComboBox({ value: '1' })

    // When a value is selected, the ComboBox should show that value
    const combobox = screen.getByRole('combobox')
    expect(combobox).toHaveValue('Option 1')
  })

  test('can type in the input field', async () => {
    renderComboBox()

    const combobox = screen.getByRole('combobox')
    await user.type(combobox, 'test input')

    expect(combobox).toHaveValue('test input')
  })
})
