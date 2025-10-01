import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Checkbox } from './Checkbox'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Checkbox', () => {
  const defaultProps = {
    label: 'Test Checkbox',
  }

  it('renders checkbox with label', () => {
    renderWithProviders(<Checkbox {...defaultProps} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByText('Test Checkbox')).toBeInTheDocument()
  })

  it('associates label with input via htmlFor', () => {
    const label = 'Test Checkbox'
    renderWithProviders(<Checkbox label={label} />)

    const input = screen.getByRole('checkbox')
    const labelElement = screen.getByText(label)
    expect(labelElement).toHaveAttribute('for', input.id)
  })

  it('associates error message with input via aria-describedby', () => {
    const errorMessage = 'This field is required'
    renderWithProviders(<Checkbox label="Test Checkbox" errorMessage={errorMessage} isInvalid />)

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

  it('shows checked state', () => {
    renderWithProviders(<Checkbox {...defaultProps} value />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('renders with description', () => {
    renderWithProviders(<Checkbox {...defaultProps} description="Helpful description" />)
    expect(screen.getByText('Helpful description')).toBeInTheDocument()
  })

  it('renders error message when invalid', () => {
    renderWithProviders(
      <Checkbox {...defaultProps} isInvalid errorMessage="This field is required" />,
    )
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    const testCases = [
      { name: 'default', props: { label: 'Default Checkbox' } },
      { name: 'checked', props: { label: 'Checked Checkbox', isSelected: true } },
      { name: 'disabled', props: { label: 'Disabled Checkbox', isDisabled: true } },
      { name: 'indeterminate', props: { label: 'Indeterminate Checkbox', isIndeterminate: true } },
      {
        name: 'with description',
        props: { label: 'Checkbox with Description', description: 'Helpful text' },
      },
      {
        name: 'with error',
        props: { label: 'Error Checkbox', isInvalid: true, errorMessage: 'Required field' },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Checkbox {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })

  describe('Accessibility', () => {
    const testCases = [
      { name: 'default', props: { label: 'Default Checkbox' } },
      { name: 'checked', props: { label: 'Checked Checkbox', isSelected: true } },
      { name: 'disabled', props: { label: 'Disabled Checkbox', isDisabled: true } },
      { name: 'indeterminate', props: { label: 'Indeterminate Checkbox', isIndeterminate: true } },
      {
        name: 'with description',
        props: { label: 'Checkbox with Description', description: 'Helpful text' },
      },
      {
        name: 'with error',
        props: { label: 'Error Checkbox', isInvalid: true, errorMessage: 'Required field' },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Checkbox {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
