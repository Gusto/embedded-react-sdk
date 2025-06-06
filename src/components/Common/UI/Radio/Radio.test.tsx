import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { run } from 'axe-core'
import type { AxeResults } from 'axe-core'
import { Radio } from './Radio'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Helper function to run axe on a container
const runAxe = async (container: Element): Promise<AxeResults> => {
  return await run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
}

describe('Radio', () => {
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

  it('renders with checked state when value prop is true', () => {
    renderWithProviders(<Radio label="Test Radio" value={true} />)
    const input = screen.getByRole('radio')
    expect(input).toBeChecked()
  })

  describe('Accessibility', () => {
    it('should not have any accessibility violations - basic radio', async () => {
      const { container } = renderWithProviders(<Radio label="Option 1" name="choice" />)
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - selected radio', async () => {
      const { container } = renderWithProviders(
        <Radio label="Selected option" name="choice" value={true} />,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - disabled radio', async () => {
      const { container } = renderWithProviders(
        <Radio label="Disabled option" name="choice" isDisabled />,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - radio with description', async () => {
      const { container } = renderWithProviders(
        <Radio
          label="Option with help"
          name="choice"
          description="This option provides additional features"
        />,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('should not have any accessibility violations - radio with error', async () => {
      const { container } = renderWithProviders(
        <Radio
          label="Invalid option"
          name="choice"
          isInvalid
          errorMessage="This option is not available"
        />,
      )
      const results = await runAxe(container)
      expect(results.violations).toHaveLength(0)
    })
  })
})
