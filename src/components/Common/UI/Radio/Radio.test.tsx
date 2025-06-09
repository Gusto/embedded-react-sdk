import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('calls onChange when clicked', async () => {
    const onChange = vi.fn()
    renderWithProviders(<Radio {...defaultProps} onChange={onChange} />)

    const radio = screen.getByRole('radio')
    await userEvent.click(radio)

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('shows checked state', () => {
    renderWithProviders(<Radio {...defaultProps} value={true} />)

    const radio = screen.getByRole('radio')
    expect(radio).toBeChecked()
  })

  it('handles disabled state', () => {
    renderWithProviders(<Radio {...defaultProps} isDisabled />)

    const radio = screen.getByRole('radio')
    expect(radio).toBeDisabled()
  })

  it('renders with description', () => {
    renderWithProviders(<Radio {...defaultProps} description="Helpful description" />)
    expect(screen.getByText('Helpful description')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic radio',
        props: { label: 'Option A', name: 'choice' },
      },
      {
        name: 'selected radio',
        props: { label: 'Option B', name: 'choice', value: true },
      },
      {
        name: 'disabled radio',
        props: { label: 'Disabled Option', name: 'choice', isDisabled: true },
      },
      {
        name: 'radio with description',
        props: {
          label: 'Option with description',
          name: 'choice',
          description: 'This is a helpful description',
        },
      },
      {
        name: 'radio with onChange handler',
        props: { label: 'Interactive Radio', name: 'choice', onChange: vi.fn() },
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
