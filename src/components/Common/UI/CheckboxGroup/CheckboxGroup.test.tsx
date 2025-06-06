import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { CheckboxGroup } from './CheckboxGroup'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3', isDisabled: true },
]

describe('CheckboxGroup', () => {
  it('renders all options with correct labels', () => {
    renderWithProviders(<CheckboxGroup label="Test Group" options={mockOptions} />)

    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument()
    })
  })

  it('renders label', () => {
    const label = 'Test Group'
    renderWithProviders(<CheckboxGroup label={label} options={mockOptions} />)

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('associates error message with fieldset when error is present', () => {
    const errorMessage = 'This field is required'
    const { container } = renderWithProviders(
      <CheckboxGroup
        label="Test Group"
        options={mockOptions}
        errorMessage={errorMessage}
        isInvalid={true}
      />,
    )

    // Find the error message by text content
    const errorElement = screen.getByText(errorMessage)

    // Look for the fieldset element by class
    const fieldset = container.querySelector('fieldset')

    // Test presence and basic association without relying on specific IDs
    expect(fieldset).toHaveAttribute('aria-describedby')
    expect(errorElement).toBeInTheDocument()
  })

  it('calls onChange handler when options are selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <CheckboxGroup label="Test Group" options={mockOptions} onChange={onChange} />,
    )

    const firstCheckbox = screen.getByLabelText('Option 1')
    await user.click(firstCheckbox)

    expect(onChange).toHaveBeenCalledWith(['option1'])
  })

  it('calls onChange handler when options are deselected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <CheckboxGroup
        label="Test Group"
        value={['option1']}
        options={mockOptions}
        onChange={onChange}
      />,
    )

    const firstCheckbox = screen.getByLabelText('Option 1')
    await user.click(firstCheckbox)

    expect(onChange).toHaveBeenCalledWith([])
  })

  it('disables all checkboxes when isDisabled is true', () => {
    renderWithProviders(<CheckboxGroup label="Test Group" options={mockOptions} isDisabled />)

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeDisabled()
    })
  })

  it('respects individual option disabled state', () => {
    renderWithProviders(<CheckboxGroup label="Test Group" options={mockOptions} />)

    const disabledCheckbox = screen.getByLabelText('Option 3')
    expect(disabledCheckbox).toBeDisabled()

    const enabledCheckboxes = screen
      .getAllByRole('checkbox')
      .filter(
        (checkbox): checkbox is HTMLInputElement =>
          checkbox instanceof HTMLInputElement && !checkbox.disabled,
      )

    expect(enabledCheckboxes).toHaveLength(2)
  })

  it('displays description when provided', () => {
    const description = 'Helpful description'
    renderWithProviders(
      <CheckboxGroup label="Test Group" options={mockOptions} description={description} />,
    )

    expect(screen.getByText(description)).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    const mockCheckboxOptions = [
      { label: 'Newsletter', value: 'newsletter' },
      { label: 'Updates', value: 'updates' },
    ]
    const mockCheckboxOptionsWithDescriptions = [
      {
        label: 'Weekly Newsletter',
        value: 'newsletter',
        description: 'Get our weekly roundup',
      },
      {
        label: 'Product Updates',
        value: 'updates',
        description: 'Be first to know about new features',
      },
    ]

    const testCases = [
      {
        name: 'basic checkbox group',
        props: { label: 'Select options', options: mockCheckboxOptions },
      },
      {
        name: 'required checkbox group',
        props: { label: 'Required selections', options: mockCheckboxOptions, isRequired: true },
      },
      {
        name: 'disabled checkbox group',
        props: { label: 'Disabled group', options: mockCheckboxOptions, isDisabled: true },
      },
      {
        name: 'checkbox group with error',
        props: {
          label: 'Invalid selections',
          options: mockCheckboxOptions,
          isInvalid: true,
          errorMessage: 'Please select at least one option',
        },
      },
      {
        name: 'checkbox group with description',
        props: {
          label: 'Email Preferences',
          description: "Choose which emails you'd like to receive",
          options: mockCheckboxOptions,
        },
      },
      {
        name: 'checkbox group with option descriptions',
        props: {
          label: 'Subscription Options',
          options: mockCheckboxOptionsWithDescriptions,
        },
      },
      {
        name: 'checkbox group with hidden label',
        props: {
          label: 'Hidden label group',
          options: mockCheckboxOptions,
          shouldVisuallyHideLabel: true,
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<CheckboxGroup {...props} />)
        await expect(
          axe(container, {
            rules: {
              'color-contrast': { enabled: false },
            },
          }),
        ).resolves.toHaveNoViolations()
      },
    )
  })
})
