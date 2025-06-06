import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RadioGroup } from './RadioGroup'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
]

describe('RadioGroup', () => {
  const defaultProps = {
    label: 'Test Radio Group',
    options: mockOptions,
  }

  it('renders radio group with options', () => {
    renderWithProviders(<RadioGroup {...defaultProps} />)

    expect(screen.getByText('Test Radio Group')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('calls onChange when option is selected', async () => {
    const onChange = vi.fn()
    renderWithProviders(<RadioGroup {...defaultProps} onChange={onChange} />)

    const option1 = screen.getByLabelText('Option 1')
    await userEvent.click(option1)

    expect(onChange).toHaveBeenCalledWith('option1')
  })

  it('shows selected value', () => {
    renderWithProviders(<RadioGroup {...defaultProps} value="option2" />)

    const option2 = screen.getByLabelText('Option 2')
    expect(option2).toBeChecked()
  })

  it('handles disabled state', () => {
    renderWithProviders(<RadioGroup {...defaultProps} isDisabled />)

    const option1 = screen.getByLabelText('Option 1')
    expect(option1).toBeDisabled()
  })

  it('renders with description', () => {
    renderWithProviders(<RadioGroup {...defaultProps} description="Choose an option" />)
    expect(screen.getByText('Choose an option')).toBeInTheDocument()
  })

  it('renders error message when invalid', () => {
    renderWithProviders(
      <RadioGroup {...defaultProps} isInvalid errorMessage="Please select an option" />,
    )
    expect(screen.getByText('Please select an option')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic radio group',
        props: { label: 'Choose option', options: mockOptions },
      },
      {
        name: 'radio group with selected value',
        props: { label: 'Choose option', options: mockOptions, value: 'option2' },
      },
      {
        name: 'disabled radio group',
        props: { label: 'Disabled group', options: mockOptions, isDisabled: true },
      },
      {
        name: 'required radio group',
        props: { label: 'Required group', options: mockOptions, isRequired: true },
      },
      {
        name: 'radio group with description',
        props: {
          label: 'Group with description',
          description: 'Choose from the available options',
          options: mockOptions,
        },
      },
      {
        name: 'invalid radio group with error',
        props: {
          label: 'Invalid group',
          options: mockOptions,
          isInvalid: true,
          errorMessage: 'Please select an option',
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<RadioGroup {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
