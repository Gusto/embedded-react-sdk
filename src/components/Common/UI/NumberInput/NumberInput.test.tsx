import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberInput } from './NumberInput'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

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
})
