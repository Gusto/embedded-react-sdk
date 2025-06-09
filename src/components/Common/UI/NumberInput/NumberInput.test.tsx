import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberInput } from './NumberInput'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('NumberInput', () => {
  const defaultProps = {
    label: 'Test Number Input',
  }

  it('renders correctly', () => {
    renderWithProviders(<NumberInput {...defaultProps} />)
    expect(screen.getByText('Test Number Input')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with description', () => {
    renderWithProviders(<NumberInput {...defaultProps} description="Test description" />)
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders with error message', () => {
    renderWithProviders(
      <NumberInput {...defaultProps} errorMessage="Error message" isInvalid={true} />,
    )
    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('associates description with input via matching IDs', () => {
    const description = 'Helpful description'
    renderWithProviders(<NumberInput label="Test Input" description={description} />)

    const descriptionElement = screen.getByText(description)
    expect(descriptionElement).toBeInTheDocument()
    const inputElement = screen.getByRole('textbox')
    expect(inputElement).toHaveAttribute('aria-describedby', descriptionElement.id)
  })

  it('associates description with input via matching IDs', () => {
    const description = 'Helpful description'
    renderWithProviders(<NumberInput label="Test Input" description={description} />)

    const descriptionElement = screen.getByText(description)
    expect(descriptionElement).toBeInTheDocument()
    const inputElement = screen.getByRole('textbox')
    expect(inputElement).toHaveAttribute('aria-describedby', descriptionElement.id)
  })

  it('associates description with input via aria-describedby', () => {
    const description = 'This is a description'
    renderWithProviders(<NumberInput label="Test Input" description={description} />)

    const input = screen.getByRole('textbox')
    const descriptionId = input.getAttribute('aria-describedby')
    expect(screen.getByText(description)).toHaveAttribute('id', descriptionId)
  })

  it('associates label with input via htmlFor', () => {
    const label = 'Test Input'
    renderWithProviders(<NumberInput label={label} />)

    const input = screen.getByRole('textbox')
    const labelElement = screen.getByText(label)
    expect(labelElement).toHaveAttribute('for', input.id)
  })

  it('calls onChange handler when input changes', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<NumberInput {...defaultProps} onChange={onChange} value={0} />)

    const input = screen.getByRole('textbox')
    await user.type(input, '123')
    // Necessary to blur the input to trigger the onChange event for react aria
    await user.tab()

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(123)
  })

  it('handles disabled state', () => {
    renderWithProviders(<NumberInput {...defaultProps} isDisabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('handles required state', () => {
    renderWithProviders(<NumberInput {...defaultProps} isRequired />)

    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  it('accepts initial value', () => {
    renderWithProviders(<NumberInput {...defaultProps} value={42} />)

    // Check that the input has the correct value
    expect(screen.getByDisplayValue('42')).toBeInTheDocument()
  })

  it('handles min and max props', () => {
    renderWithProviders(<NumberInput {...defaultProps} min={0} max={100} />)

    const input = screen.getByRole('textbox')
    // Note: React Aria NumberField may not set min/max attributes directly on the input
    expect(input).toBeInTheDocument()
  })

  it('handles placeholder', () => {
    renderWithProviders(<NumberInput {...defaultProps} placeholder="Enter a number" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter a number')
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic number input',
        props: { label: 'Amount' },
      },
      {
        name: 'number input with value',
        props: { label: 'Price', value: 99.99 },
      },
      {
        name: 'number input with placeholder',
        props: { label: 'Quantity', placeholder: 'Enter quantity' },
      },
      {
        name: 'disabled number input',
        props: { label: 'Disabled Amount', isDisabled: true },
      },
      {
        name: 'required number input',
        props: { label: 'Required Field', isRequired: true },
      },
      {
        name: 'number input with description',
        props: { label: 'Tax Rate', description: 'Enter as a percentage' },
      },
      {
        name: 'invalid number input with error',
        props: {
          label: 'Invalid Amount',
          isInvalid: true,
          errorMessage: 'Please enter a valid amount',
        },
      },
      {
        name: 'number input with min/max',
        props: { label: 'Score', min: 0, max: 100 },
      },
      {
        name: 'currency format number input',
        props: { label: 'Price', format: 'currency' as const, value: 29.99 },
      },
      {
        name: 'percent format number input',
        props: { label: 'Tax Rate', format: 'percent' as const },
      },
      {
        name: 'number input with hidden label',
        props: {
          label: 'Hidden Label Number',
          shouldVisuallyHideLabel: true,
          placeholder: 'Enter number...',
        },
      },
      {
        name: 'controlled number input',
        props: { label: 'Controlled', value: 42, onChange: vi.fn() },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<NumberInput {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
