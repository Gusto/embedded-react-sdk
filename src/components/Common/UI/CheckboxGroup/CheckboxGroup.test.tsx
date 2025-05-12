import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheckboxGroup } from './CheckboxGroup'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3', isDisabled: true },
]

describe('CheckboxGroup', () => {
  it('renders all options with correct labels', () => {
    renderWithProviders(<CheckboxGroup label="Test Group" options={mockOptions} />)

    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument()
    })
  })

  it('renders label', () => {
    const label = 'Test Group'
    renderWithProviders(<CheckboxGroup label={label} options={mockOptions} />)

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('associates error message with fieldset when error is present', () => {
    const errorMessage = 'This field is required'
    const { container } = renderWithProviders(
      <CheckboxGroup
        label="Test Group"
        options={mockOptions}
        errorMessage={errorMessage}
        isInvalid={true}
      />,
    )

    // Find the error message by text content
    const errorElement = screen.getByText(errorMessage)

    // Look for the fieldset element by class
    const fieldset = container.querySelector('fieldset')

    // Test presence and basic association without relying on specific IDs
    expect(fieldset).toHaveAttribute('aria-describedby')
    expect(errorElement).toBeInTheDocument()
  })

  it('calls onChange handler when options are selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <CheckboxGroup label="Test Group" options={mockOptions} onChange={onChange} />,
    )

    const firstCheckbox = screen.getByLabelText('Option 1')
    await user.click(firstCheckbox)

    expect(onChange).toHaveBeenCalledWith(['option1'])
  })

  it('calls onChange handler when options are deselected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <CheckboxGroup
        label="Test Group"
        value={['option1']}
        options={mockOptions}
        onChange={onChange}
      />,
    )

    const firstCheckbox = screen.getByLabelText('Option 1')
    await user.click(firstCheckbox)

    expect(onChange).toHaveBeenCalledWith([])
  })

  it('disables all checkboxes when isDisabled is true', () => {
    renderWithProviders(<CheckboxGroup label="Test Group" options={mockOptions} isDisabled />)

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeDisabled()
    })
  })

  it('respects individual option disabled state', () => {
    renderWithProviders(<CheckboxGroup label="Test Group" options={mockOptions} />)

    const disabledCheckbox = screen.getByLabelText('Option 3')
    expect(disabledCheckbox).toBeDisabled()

    const enabledCheckboxes = screen
      .getAllByRole('checkbox')
      .filter(
        (checkbox): checkbox is HTMLInputElement =>
          checkbox instanceof HTMLInputElement && !checkbox.disabled,
      )

    expect(enabledCheckboxes).toHaveLength(2)
  })

  it('displays description when provided', () => {
    const description = 'Helpful description'
    renderWithProviders(
      <CheckboxGroup label="Test Group" options={mockOptions} description={description} />,
    )

    expect(screen.getByText(description)).toBeInTheDocument()
  })
})
