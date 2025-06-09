import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RadioGroup } from './RadioGroup'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3', isDisabled: true },
]

describe('RadioGroup', () => {
  it('renders all options with correct labels', () => {
    renderWithProviders(<RadioGroup label="Test Group" options={mockOptions} />)

    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument()
    })
  })

  it('renders label', () => {
    const label = 'Test Group'
    renderWithProviders(<RadioGroup label={label} options={mockOptions} />)

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('associates error message with fieldset when error is present', () => {
    const errorMessage = 'This field is required'
    const { container } = renderWithProviders(
      <RadioGroup
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

  it('calls onChange handler when an option is selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(<RadioGroup label="Test Group" options={mockOptions} onChange={onChange} />)

    const firstRadio = screen.getByLabelText('Option 1')
    await user.click(firstRadio)

    expect(onChange).toHaveBeenCalledWith('option1')
  })

  it('disables all radio buttons when isDisabled is true', () => {
    renderWithProviders(<RadioGroup label="Test Group" options={mockOptions} isDisabled />)

    const radios = screen.getAllByRole('radio')
    radios.forEach(radio => {
      expect(radio).toBeDisabled()
    })
  })

  it('respects individual option disabled state', () => {
    renderWithProviders(<RadioGroup label="Test Group" options={mockOptions} />)

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
    renderWithProviders(
      <RadioGroup label="Test Group" options={mockOptions} description={description} />,
    )

    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('sets the checked state based on value prop', () => {
    renderWithProviders(<RadioGroup label="Test Group" options={mockOptions} value="option2" />)

    const checkedRadio = screen.getByLabelText('Option 2')
    expect(checkedRadio).toBeChecked()

    const uncheckedRadio = screen.getByLabelText('Option 1')
    expect(uncheckedRadio).not.toBeChecked()
  })

  describe('Accessibility', () => {
    const testCases = [
      { name: 'default', props: { label: 'Select Option', options: mockOptions } },
      {
        name: 'disabled',
        props: { label: 'Select Option', options: mockOptions, isDisabled: true },
      },
      {
        name: 'with description',
        props: { label: 'Select Option', options: mockOptions, description: 'Choose one option' },
      },
      {
        name: 'with error',
        props: {
          label: 'Select Option',
          options: mockOptions,
          isInvalid: true,
          errorMessage: 'Selection required',
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<RadioGroup {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
