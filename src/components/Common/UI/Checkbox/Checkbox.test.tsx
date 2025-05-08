import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Checkbox } from './Checkbox'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Checkbox', () => {
  it('associates label with input via htmlFor', () => {
    const label = 'Test Checkbox'
    renderWithProviders(<Checkbox label={label} />)

    const input = screen.getByRole('checkbox')
    const labelElement = screen.getByText(label)
    expect(labelElement).toHaveAttribute('for', input.id)
  })

  it('associates error message with input via aria-describedby', () => {
    const errorMessage = 'This field is required'
    renderWithProviders(
      <Checkbox label="Test Checkbox" errorMessage={errorMessage} isInvalid={true} />,
    )

    const input = screen.getByRole('checkbox')
    expect(input).toHaveAttribute('aria-describedby')
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('associates description with input via aria-describedby', () => {
    const description = 'Helpful description'
    renderWithProviders(<Checkbox label="Test Checkbox" description={description} />)

    const input = screen.getByRole('checkbox')
    const descriptionId = input.getAttribute('aria-describedby')
    expect(screen.getByText(description)).toHaveAttribute('id', descriptionId)
  })

  it('calls onChange handler when clicked', async () => {
    const user = userEvent.setup()

    const onChange = vi.fn<(checked: boolean) => void>()

    renderWithProviders(<Checkbox label="Test label" onChange={onChange} />)

    const input = screen.getByRole('checkbox')

    expect(input).not.toBeChecked()

    await user.click(input)

    expect(input).toBeChecked()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('applies disabled attribute when isDisabled is true', () => {
    renderWithProviders(<Checkbox label="Test Checkbox" isDisabled />)
    const input = screen.getByRole('checkbox')
    expect(input).toBeDisabled()
  })

  it('applies aria-invalid attribute when isInvalid is true', () => {
    renderWithProviders(<Checkbox label="Test Checkbox" isInvalid />)
    const input = screen.getByRole('checkbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })
})
