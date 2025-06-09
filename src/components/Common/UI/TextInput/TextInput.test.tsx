import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextInput } from './TextInput'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('TextInput', () => {
  const defaultProps = {
    label: 'Test Text Input',
  }

  it('renders text input with label', () => {
    renderWithProviders(<TextInput {...defaultProps} />)
    expect(screen.getByText('Test Text Input')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('calls onChange when value changes', async () => {
    const onChange = vi.fn()
    renderWithProviders(<TextInput {...defaultProps} onChange={onChange} />)

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Hello')

    expect(onChange).toHaveBeenCalled()
  })

  it('handles disabled state', () => {
    renderWithProviders(<TextInput {...defaultProps} isDisabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('renders with description', () => {
    renderWithProviders(<TextInput {...defaultProps} description="Helpful description" />)
    expect(screen.getByText('Helpful description')).toBeInTheDocument()
  })

  it('renders error message when invalid', () => {
    renderWithProviders(
      <TextInput {...defaultProps} isInvalid errorMessage="This field is required" />,
    )
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic text input',
        props: { label: 'Name' },
      },
      {
        name: 'disabled text input',
        props: { label: 'Disabled Field', isDisabled: true },
      },
      {
        name: 'required text input',
        props: { label: 'Required Field', isRequired: true },
      },
      {
        name: 'text input with description',
        props: { label: 'Username', description: 'Choose a unique username' },
      },
      {
        name: 'invalid text input with error',
        props: {
          label: 'Invalid Field',
          isInvalid: true,
          errorMessage: 'This field is required',
        },
      },
      {
        name: 'text input with hidden label',
        props: {
          label: 'Hidden Label Input',
          shouldVisuallyHideLabel: true,
          placeholder: 'Enter text...',
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<TextInput {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
