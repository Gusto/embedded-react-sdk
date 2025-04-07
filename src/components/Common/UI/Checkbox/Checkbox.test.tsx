import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { ChangeEvent } from 'react'
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

  it('calls both onChange handlers when clicked', async () => {
    const user = userEvent.setup()

    const onChangeFromProps = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>()
    const onChangeFromInputProps = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>()

    render(
      <Checkbox
        label="Test label"
        onChange={onChangeFromProps}
        inputProps={{ onChange: onChangeFromInputProps }}
      />,
    )

    const input = screen.getByRole('checkbox')

    expect(input).not.toBeChecked()

    await user.click(input)

    expect(input).toBeChecked()
    expect(onChangeFromProps).toHaveBeenCalledTimes(1)
    expect(onChangeFromInputProps).toHaveBeenCalledTimes(1)

    expect(onChangeFromProps).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ checked: true }),
      }),
    )
    expect(onChangeFromInputProps).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ checked: true }),
      }),
    )
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
