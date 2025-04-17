import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Radio } from './Radio'

describe('Radio', () => {
  it('associates label with input via htmlFor', () => {
    const label = 'Test Radio'
    render(<Radio label={label} />)

    const input = screen.getByRole('radio')
    const labelElement = screen.getByText(label)
    expect(labelElement).toHaveAttribute('for', input.id)
  })

  it('associates error message with input via aria-describedby', () => {
    const errorMessage = 'This field is required'
    render(<Radio label="Test Radio" errorMessage={errorMessage} />)

    const input = screen.getByRole('radio')
    const errorMessageId = input.getAttribute('aria-describedby')
    expect(screen.getByText(errorMessage)).toHaveAttribute('id', errorMessageId)
  })

  it('associates description with input via aria-describedby', () => {
    const description = 'Helpful description'
    render(<Radio label="Test Radio" description={description} />)

    const input = screen.getByRole('radio')
    const descriptionId = input.getAttribute('aria-describedby')
    expect(screen.getByText(description)).toHaveAttribute('id', descriptionId)
  })

  it('calls onChange handler when clicked', async () => {
    const user = userEvent.setup()

    const onChange = vi.fn<(checked: boolean) => void>()

    render(<Radio label="Test label" onChange={onChange} />)

    const input = screen.getByRole('radio')

    expect(input).not.toBeChecked()

    await user.click(input)

    expect(input).toBeChecked()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('applies disabled attribute when isDisabled is true', () => {
    render(<Radio label="Test Radio" isDisabled />)
    const input = screen.getByRole('radio')
    expect(input).toBeDisabled()
  })

  it('renders with checked state when value prop is true', () => {
    render(<Radio label="Test Radio" value={true} />)
    const input = screen.getByRole('radio')
    expect(input).toBeChecked()
  })
})
