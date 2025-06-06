import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { run } from 'axe-core'
import type { AxeResults } from 'axe-core'
import { NumberInput } from './NumberInput'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Helper function to run axe on a container
const runAxe = async (container: Element): Promise<AxeResults> => {
  return await run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
}

describe('NumberInput', () => {
  it('associates error message with input via aria-describedby', () => {
    const errorMessage = 'This field is required'
    renderWithProviders(
      <NumberInput label="Test Input" errorMessage={errorMessage} isInvalid={true} />,
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby')
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
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
    const testValue = 42
    const user = userEvent.setup()

    renderWithProviders(<NumberInput label="Test label" onChange={onChange} value={0} />)

    const input = screen.getByRole('textbox')

    await user.type(input, testValue.toString())
    // Necessary to blur the input to trigger the onChange event for react aria
    await user.tab()

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(testValue)
  })

  it('displays percent symbol when format is percent', () => {
    renderWithProviders(<NumberInput label="Test Input" format="percent" />)
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('handles currency format', () => {
    renderWithProviders(<NumberInput label="Test Input" format="currency" value={42} />)
    const input = screen.getByLabelText(/Test Input/)
    expect(input).toHaveValue('42.00')
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic number input',
        props: { label: 'Quantity' },
      },
      {
        name: 'number input with value',
        props: { label: 'Price', value: 29.99 },
      },
      {
        name: 'currency format',
        props: { label: 'Amount', format: 'currency' as const, value: 100.5 },
      },
      {
        name: 'percentage format',
        props: { label: 'Interest Rate', format: 'percent' as const, value: 4.5 },
      },
      {
        name: 'with min/max values',
        props: { label: 'Age', min: 0, max: 150, value: 25 },
      },
      {
        name: 'disabled number input',
        props: { label: 'Disabled Field', isDisabled: true },
      },
      {
        name: 'required number input',
        props: { label: 'Required Amount', isRequired: true },
      },
      {
        name: 'with error state',
        props: {
          label: 'Invalid Number',
          isInvalid: true,
          errorMessage: 'Please enter a valid number',
        },
      },
      {
        name: 'with description',
        props: {
          label: 'Payment Amount',
          description: 'Enter amount in USD',
          format: 'currency' as const,
        },
      },
      {
        name: 'with adornments',
        props: {
          label: 'Custom Amount',
          adornmentStart: <span>From</span>,
          adornmentEnd: <span>total</span>,
        },
      },
      {
        name: 'with placeholder',
        props: { label: 'Optional Amount', placeholder: 'Enter amount...' },
      },
      {
        name: 'with fraction digits',
        props: {
          label: 'Precise Value',
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
          value: 123.4567,
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<NumberInput {...props} />)
        const results = await runAxe(container)
        expect(results.violations).toHaveLength(0)
      },
    )
  })
})
