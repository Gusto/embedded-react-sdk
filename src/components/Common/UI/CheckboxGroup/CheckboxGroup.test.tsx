import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CheckboxGroup } from './CheckboxGroup'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
]

describe('CheckboxGroup', () => {
  const defaultProps = {
    label: 'Test Checkbox Group',
    options: mockOptions,
  }

  it('renders checkbox group with options', () => {
    renderWithProviders(<CheckboxGroup {...defaultProps} />)

    expect(screen.getByText('Test Checkbox Group')).toBeInTheDocument()
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument()
  })

  it('calls onChange when option is selected', async () => {
    const onChange = vi.fn()
    renderWithProviders(<CheckboxGroup {...defaultProps} onChange={onChange} />)

    const option1 = screen.getByLabelText('Option 1')
    await userEvent.click(option1)

    expect(onChange).toHaveBeenCalledWith(['option1'])
  })

  it('shows selected values', () => {
    renderWithProviders(<CheckboxGroup {...defaultProps} value={['option2']} />)

    const option2 = screen.getByLabelText('Option 2')
    expect(option2).toBeChecked()
  })

  it('handles disabled state', () => {
    renderWithProviders(<CheckboxGroup {...defaultProps} isDisabled />)

    const option1 = screen.getByLabelText('Option 1')
    expect(option1).toBeDisabled()
  })

  it('renders with description', () => {
    renderWithProviders(<CheckboxGroup {...defaultProps} description="Choose options" />)
    expect(screen.getByText('Choose options')).toBeInTheDocument()
  })

  it('renders error message when invalid', () => {
    renderWithProviders(
      <CheckboxGroup
        {...defaultProps}
        isInvalid
        errorMessage="Please select at least one option"
      />,
    )
    expect(screen.getByText('Please select at least one option')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic checkbox group',
        props: { label: 'Choose options', options: mockOptions },
      },
      {
        name: 'checkbox group with selected values',
        props: { label: 'Choose options', options: mockOptions, value: ['option2'] },
      },
      {
        name: 'disabled checkbox group',
        props: { label: 'Disabled group', options: mockOptions, isDisabled: true },
      },
      {
        name: 'required checkbox group',
        props: { label: 'Required group', options: mockOptions, isRequired: true },
      },
      {
        name: 'checkbox group with description',
        props: {
          label: 'Group with description',
          description: 'Choose from the available options',
          options: mockOptions,
        },
      },
      {
        name: 'invalid checkbox group with error',
        props: {
          label: 'Invalid group',
          options: mockOptions,
          isInvalid: true,
          errorMessage: 'Please select at least one option',
        },
      },
      {
        name: 'checkbox group with multiple selections',
        props: {
          label: 'Multi-select group',
          options: mockOptions,
          value: ['option1', 'option3'],
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<CheckboxGroup {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })

  describe('Accessibility', () => {
    const testCases = [
      { name: 'default', props: { label: 'Select Options', options: mockOptions } },
      {
        name: 'with selection',
        props: { label: 'Select Options', options: mockOptions, value: ['option1'] },
      },
      {
        name: 'disabled',
        props: { label: 'Select Options', options: mockOptions, isDisabled: true },
      },
      {
        name: 'with description',
        props: {
          label: 'Select Options',
          options: mockOptions,
          description: 'Choose multiple options',
        },
      },
      {
        name: 'with error',
        props: {
          label: 'Select Options',
          options: mockOptions,
          isInvalid: true,
          errorMessage: 'At least one option required',
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<CheckboxGroup {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
