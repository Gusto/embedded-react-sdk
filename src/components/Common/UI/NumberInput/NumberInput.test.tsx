import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberInput } from './NumberInput'
import { LocaleProvider } from '@/contexts/LocaleProvider'

const renderWithLocale = (ui: React.ReactElement) => {
  return render(
    <LocaleProvider locale="en-US" currency="USD">
      {ui}
    </LocaleProvider>,
  )
}

describe('NumberInput', () => {
  it('associates error message with input via aria-describedby', () => {
    const errorMessage = 'This field is required'
    renderWithLocale(<NumberInput label="Test Input" errorMessage={errorMessage} />)

    const input = screen.getByRole('textbox')
    const errorMessageId = input.getAttribute('aria-describedby')
    expect(screen.getByText(errorMessage)).toHaveAttribute('id', errorMessageId)
  })

  it('associates description with input via aria-describedby', () => {
    const description = 'This is a description'
    renderWithLocale(<NumberInput label="Test Input" description={description} />)

    const input = screen.getByRole('textbox')
    const descriptionId = input.getAttribute('aria-describedby')
    expect(screen.getByText(description)).toHaveAttribute('id', descriptionId)
  })

  it('associates label with input via htmlFor', () => {
    const label = 'Test Input'
    renderWithLocale(<NumberInput label={label} />)

    const input = screen.getByRole('textbox')
    const labelElement = screen.getByText(label)
    expect(labelElement).toHaveAttribute('for', input.id)
  })

  it('calls onChange handler when input changes', async () => {
    const onChange = vi.fn()
    const testValue = 42
    const user = userEvent.setup()

    renderWithLocale(<NumberInput label="Test label" onChange={onChange} value={0} />)

    const input = screen.getByRole('textbox')

    await user.type(input, testValue.toString())
    // Necessary to blur the input to trigger the onChange event for react aria
    await user.tab()

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(testValue)
  })

  it('displays percent symbol when format is percent', () => {
    renderWithLocale(<NumberInput label="Test Input" format="percent" />)
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('handles currency format', () => {
    renderWithLocale(<NumberInput label="Test Input" format="currency" value={42} />)
    const input = screen.getByLabelText(/Test Input/)
    expect(input).toHaveValue('42.00')
  })
})
