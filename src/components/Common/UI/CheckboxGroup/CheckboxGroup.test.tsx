import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheckboxGroup } from './CheckboxGroup'

const mockOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3', isDisabled: true },
]

describe('CheckboxGroup', () => {
  it('renders all options with correct labels', () => {
    render(<CheckboxGroup label="Test Group" options={mockOptions} />)

    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument()
    })
  })

  it('renders label', () => {
    const label = 'Test Group'
    render(<CheckboxGroup label={label} options={mockOptions} />)

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('associates error message with fieldset when error is present', () => {
    const errorMessage = 'This field is required'
    render(<CheckboxGroup label="Test Group" options={mockOptions} errorMessage={errorMessage} />)

    const errorElement = screen.getByRole('alert')

    // Workaround for multiple groups present in the DOM
    const group = screen
      .getAllByRole('group')
      .find(el => el.getAttribute('aria-describedby') === errorElement.id)

    expect(group).toHaveAttribute('aria-describedby', errorElement.id)
  })

  it('calls onChange handler when options are selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<CheckboxGroup label="Test Group" options={mockOptions} onChange={onChange} />)

    const firstCheckbox = screen.getByLabelText('Option 1')
    await user.click(firstCheckbox)

    expect(onChange).toHaveBeenCalledWith(['option1'])
  })

  it('disables all checkboxes when isDisabled is true', () => {
    render(<CheckboxGroup label="Test Group" options={mockOptions} isDisabled />)

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeDisabled()
    })
  })

  it('respects individual option disabled state', () => {
    render(<CheckboxGroup label="Test Group" options={mockOptions} />)

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
    render(<CheckboxGroup label="Test Group" options={mockOptions} description={description} />)

    expect(screen.getByText(description)).toBeInTheDocument()
  })
})
