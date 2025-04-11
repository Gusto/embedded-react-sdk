import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RadioGroup } from './RadioGroup'

const mockOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3', isDisabled: true },
]

describe('RadioGroup', () => {
  it('renders all options with correct labels', () => {
    render(<RadioGroup label="Test Group" options={mockOptions} />)

    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument()
    })
  })

  it('renders label', () => {
    const label = 'Test Group'
    render(<RadioGroup label={label} options={mockOptions} />)

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('associates error message with fieldset when error is present', () => {
    const errorMessage = 'This field is required'
    render(<RadioGroup label="Test Group" options={mockOptions} errorMessage={errorMessage} />)

    const errorElement = screen.getByRole('alert')

    // Workaround for multiple groups present in the DOM
    const group = screen
      .getAllByRole('group')
      .find(el => el.getAttribute('aria-describedby') === errorElement.id)

    expect(group).toHaveAttribute('aria-describedby', errorElement.id)
  })

  it('calls onChange handler when an option is selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<RadioGroup label="Test Group" options={mockOptions} onChange={onChange} />)

    const firstRadio = screen.getByLabelText('Option 1')
    await user.click(firstRadio)

    expect(onChange).toHaveBeenCalledWith('option1')
  })

  it('disables all radio buttons when isDisabled is true', () => {
    render(<RadioGroup label="Test Group" options={mockOptions} isDisabled />)

    const radios = screen.getAllByRole('radio')
    radios.forEach(radio => {
      expect(radio).toBeDisabled()
    })
  })

  it('respects individual option disabled state', () => {
    render(<RadioGroup label="Test Group" options={mockOptions} />)

    const disabledRadio = screen.getByLabelText('Option 3')
    expect(disabledRadio).toBeDisabled()

    const enabledRadios = screen
      .getAllByRole('radio')
      .filter(
        (radio): radio is HTMLInputElement => radio instanceof HTMLInputElement && !radio.disabled,
      )

    expect(enabledRadios).toHaveLength(2)
  })

  it('displays description when provided', () => {
    const description = 'Helpful description'
    render(<RadioGroup label="Test Group" options={mockOptions} description={description} />)

    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('sets the checked state based on value prop', () => {
    render(<RadioGroup label="Test Group" options={mockOptions} value="option2" />)

    const checkedRadio = screen.getByLabelText('Option 2')
    expect(checkedRadio).toBeChecked()

    const uncheckedRadio = screen.getByLabelText('Option 1')
    expect(uncheckedRadio).not.toBeChecked()
  })
})
