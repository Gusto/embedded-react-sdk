import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Radio } from './Radio'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Radio', () => {
  const defaultProps = {
    label: 'Test Radio',
    name: 'test-radio',
  }

  it('renders radio with label', () => {
    renderWithProviders(<Radio {...defaultProps} />)
    expect(screen.getByRole('radio')).toBeInTheDocument()
    expect(screen.getByText('Test Radio')).toBeInTheDocument()
  })

  it('associates label with input via htmlFor', () => {
    const label = 'Test Radio'
    renderWithProviders(<Radio label={label} />)

    const input = screen.getByRole('radio')
    const labelElement = screen.getByText(label)
    expect(labelElement).toHaveAttribute('for', input.id)
  })

  it('associates error message with input via aria-describedby', () => {
    const errorMessage = 'This field is required'
    renderWithProviders(<Radio label="Test Radio" errorMessage={errorMessage} isInvalid={true} />)

    const input = screen.getByRole('radio')
    expect(input).toHaveAttribute('aria-describedby')
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('associates description with input via aria-describedby', () => {
    const description = 'Helpful description'
    renderWithProviders(<Radio label="Test Radio" description={description} />)

    const input = screen.getByRole('radio')
    const descriptionId = input.getAttribute('aria-describedby')
    expect(screen.getByText(description)).toHaveAttribute('id', descriptionId)
  })

  it('calls onChange handler when clicked', async () => {
    const user = userEvent.setup()

    const onChange = vi.fn<(checked: boolean) => void>()

    renderWithProviders(<Radio label="Test label" onChange={onChange} />)

    const input = screen.getByRole('radio')

    expect(input).not.toBeChecked()

    await user.click(input)

    expect(input).toBeChecked()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('applies disabled attribute when isDisabled is true', () => {
    renderWithProviders(<Radio label="Test Radio" isDisabled />)
    const input = screen.getByRole('radio')
    expect(input).toBeDisabled()
  })

  it('shows checked state', () => {
    renderWithProviders(<Radio {...defaultProps} value={true} />)

    const radio = screen.getByRole('radio')
    expect(radio).toBeChecked()
  })

  it('renders with description', () => {
    renderWithProviders(<Radio {...defaultProps} description="Helpful description" />)
    expect(screen.getByText('Helpful description')).toBeInTheDocument()
  })

  it('renders error message when invalid', () => {
    renderWithProviders(<Radio {...defaultProps} isInvalid errorMessage="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    const testCases = [
      { name: 'default', props: { label: 'Default Radio' } },
      { name: 'checked', props: { label: 'Checked Radio', value: true } },
      { name: 'disabled', props: { label: 'Disabled Radio', isDisabled: true } },
      {
        name: 'with description',
        props: { label: 'Radio with Description', description: 'Helpful text' },
      },
      {
        name: 'with error',
        props: { label: 'Error Radio', isInvalid: true, errorMessage: 'Required field' },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Radio {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })

  describe('Accessibility', () => {
    const testCases = [
      { name: 'default', props: { label: 'Default Radio' } },
      { name: 'disabled', props: { label: 'Disabled Radio', isDisabled: true } },
      {
        name: 'with description',
        props: { label: 'Radio with Description', description: 'Helpful text' },
      },
      {
        name: 'with error',
        props: { label: 'Error Radio', isInvalid: true, errorMessage: 'Required field' },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Radio {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
