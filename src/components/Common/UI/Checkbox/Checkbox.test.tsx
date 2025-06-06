import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('calls onChange when clicked', async () => {
    const onChange = vi.fn()
    renderWithProviders(<Checkbox {...defaultProps} onChange={onChange} />)

    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('shows checked state', () => {
    renderWithProviders(<Checkbox {...defaultProps} value={true} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('handles disabled state', () => {
    renderWithProviders(<Checkbox {...defaultProps} isDisabled />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
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
      {
        name: 'basic checkbox',
        props: { label: 'Accept terms' },
      },
      {
        name: 'checked checkbox',
        props: { label: 'Checked option', value: true },
      },
      {
        name: 'disabled checkbox',
        props: { label: 'Disabled option', isDisabled: true },
      },
      {
        name: 'required checkbox',
        props: { label: 'Required field', isRequired: true },
      },
      {
        name: 'checkbox with description',
        props: { label: 'Option with help', description: 'This is a helpful description' },
      },
      {
        name: 'invalid checkbox with error',
        props: {
          label: 'Invalid option',
          isInvalid: true,
          errorMessage: 'This field is required',
        },
      },
      {
        name: 'checkbox with onChange handler',
        props: { label: 'Interactive checkbox', onChange: vi.fn() },
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
