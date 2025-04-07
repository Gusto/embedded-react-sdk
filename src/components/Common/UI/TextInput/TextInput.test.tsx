import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { ChangeEvent } from 'react'
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

  it('calls both onChange handlers when input changes', () => {
    const onChangeFromProps = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>()
    const onChangeFromInputProps = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>()

    const testValue = 'test value'

    render(
      <TextInput
        label="Test label"
        onChange={onChangeFromProps}
        inputProps={{ onChange: onChangeFromInputProps }}
      />,
    )

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: testValue } })

    expect(onChangeFromProps).toHaveBeenCalledTimes(1)
    expect(onChangeFromInputProps).toHaveBeenCalledTimes(1)

    expect(onChangeFromProps).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: testValue }),
      }),
    )
    expect(onChangeFromInputProps).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: testValue }),
      }),
    )
  })
})
