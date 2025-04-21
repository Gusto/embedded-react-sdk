import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextInput } from './TextInput'

describe('TextInput', () => {
  it('associates error message with input via aria-describedby', () => {
    const errorMessage = 'This field is required'
    render(<TextInput label="Test Input" errorMessage={errorMessage} />)

    const input = screen.getByRole('textbox')
    const errorMessageId = input.getAttribute('aria-describedby')
    expect(screen.getByText(errorMessage)).toHaveAttribute('id', errorMessageId)
  })

  it('associates description with input via aria-describedby', () => {
    const description = 'This is a description'
    render(<TextInput label="Test Input" description={description} />)

    const input = screen.getByRole('textbox')
    const descriptionId = input.getAttribute('aria-describedby')
    expect(screen.getByText(description)).toHaveAttribute('id', descriptionId)
  })

  it('associates label with input via htmlFor', () => {
    const label = 'Test Input'
    render(<TextInput label={label} />)

    const input = screen.getByRole('textbox')
    const labelElement = screen.getByText(label)
    expect(labelElement).toHaveAttribute('for', input.id)
  })

  it('calls onChange handler when input changes', () => {
    const onChange = vi.fn()

    const testValue = 'test value'

    render(<TextInput label="Test label" onChange={onChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: testValue } })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(testValue)
  })
})
