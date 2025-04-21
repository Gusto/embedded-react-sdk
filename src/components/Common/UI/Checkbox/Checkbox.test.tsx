import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('associates label with input via htmlFor', () => {
    const label = 'Test Checkbox'
    render(<Checkbox label={label} />)

    const input = screen.getByRole('checkbox')
    const labelElement = screen.getByText(label)
    expect(labelElement).toHaveAttribute('for', input.id)
  })

  it('associates error message with input via aria-describedby', () => {
    const errorMessage = 'This field is required'
    render(<Checkbox label="Test Checkbox" errorMessage={errorMessage} />)

    const input = screen.getByRole('checkbox')
    const errorMessageId = input.getAttribute('aria-describedby')
    expect(screen.getByText(errorMessage)).toHaveAttribute('id', errorMessageId)
  })

  it('associates description with input via aria-describedby', () => {
    const description = 'Helpful description'
    render(<Checkbox label="Test Checkbox" description={description} />)

    const input = screen.getByRole('checkbox')
    const descriptionId = input.getAttribute('aria-describedby')
    expect(screen.getByText(description)).toHaveAttribute('id', descriptionId)
  })

  it('calls onChange handler when clicked', async () => {
    const user = userEvent.setup()

    const onChange = vi.fn<(checked: boolean) => void>()

    render(<Checkbox label="Test label" onChange={onChange} />)

    const input = screen.getByRole('checkbox')

    expect(input).not.toBeChecked()

    await user.click(input)

    expect(input).toBeChecked()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('applies disabled attribute when isDisabled is true', () => {
    render(<Checkbox label="Test Checkbox" isDisabled />)
    const input = screen.getByRole('checkbox')
    expect(input).toBeDisabled()
  })

  it('applies aria-invalid attribute when isInvalid is true', () => {
    render(<Checkbox label="Test Checkbox" isInvalid />)
    const input = screen.getByRole('checkbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })
})
