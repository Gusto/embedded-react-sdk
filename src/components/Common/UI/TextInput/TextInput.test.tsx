import { describe, expect, it, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { run } from 'axe-core'
import type { AxeResults } from 'axe-core'
import { TextInput } from './TextInput'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Helper function to run axe on a container
const runAxe = async (container: Element): Promise<AxeResults> => {
  return await run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
}

describe('TextInput', () => {
  it('associates error message with input via aria-describedby', () => {
    const errorMessage = 'This field is required'
    renderWithProviders(
      <TextInput label="Test Input" errorMessage={errorMessage} isInvalid={true} />,
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby')
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('associates description with input via aria-describedby', () => {
    const description = 'This is a description'
    renderWithProviders(<TextInput label="Test Input" description={description} />)

    const input = screen.getByRole('textbox')
    const descriptionId = input.getAttribute('aria-describedby')
    expect(screen.getByText(description)).toHaveAttribute('id', descriptionId)
  })

  it('associates label with input via htmlFor', () => {
    const label = 'Test Input'
    renderWithProviders(<TextInput label={label} />)

    const input = screen.getByRole('textbox')
    const labelElement = screen.getByText(label)
    expect(labelElement).toHaveAttribute('for', input.id)
  })

  it('calls onChange handler when input changes', () => {
    const onChange = vi.fn()

    const testValue = 'test value'

    renderWithProviders(<TextInput label="Test label" onChange={onChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: testValue } })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(testValue)
  })

  describe('Accessibility', () => {
    it('should not have any accessibility violations - basic text input', async () => {
      const { container } = renderWithProviders(<TextInput label="Full Name" />)
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - text input with value', async () => {
      const { container } = renderWithProviders(
        <TextInput label="Email Address" value="user@example.com" />,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - disabled text input', async () => {
      const { container } = renderWithProviders(<TextInput label="Disabled Field" isDisabled />)
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - required text input', async () => {
      const { container } = renderWithProviders(<TextInput label="Required Field" isRequired />)
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - text input with error', async () => {
      const { container } = renderWithProviders(
        <TextInput label="Username" isInvalid errorMessage="Username is required" />,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - text input with description', async () => {
      const { container } = renderWithProviders(
        <TextInput label="Password" type="password" description="Must be at least 8 characters" />,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - text input with placeholder', async () => {
      const { container } = renderWithProviders(
        <TextInput label="Search" placeholder="Enter search terms..." />,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - text input with adornments', async () => {
      const { container } = renderWithProviders(
        <TextInput
          label="Amount"
          type="number"
          adornmentStart={<span>$</span>}
          adornmentEnd={<span>USD</span>}
        />,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })
  })
})
