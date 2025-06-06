import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { axe } from 'jest-axe'
import { ButtonIcon } from './ButtonIcon'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('ButtonIcon', () => {
  it('renders correctly with default props', () => {
    render(<ButtonIcon aria-label="test-label">↓</ButtonIcon>)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', 'icon')
  })

  it('handles press events', async () => {
    const handlePress = vi.fn()
    render(
      <ButtonIcon aria-label="test-label" onClick={handlePress}>
        ↓
      </ButtonIcon>,
    )
    const button = screen.getByRole('button')

    await userEvent.click(button)
    expect(handlePress).toHaveBeenCalledTimes(1)
  })

  it('is disabled when isDisabled is true', () => {
    render(
      <ButtonIcon aria-label="test-label" isDisabled>
        ↓
      </ButtonIcon>,
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('is disabled when isLoading is true', () => {
    render(
      <ButtonIcon aria-label="test-label" isLoading>
        ↓
      </ButtonIcon>,
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('data-loading', 'true')
  })

  it('shows error state when isError is true', () => {
    render(
      <ButtonIcon aria-label="test-label" isError>
        ↓
      </ButtonIcon>,
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-error', 'true')
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic icon button with aria-label',
        render: () => <ButtonIcon aria-label="Close dialog">×</ButtonIcon>,
      },
      {
        name: 'disabled icon button',
        render: () => (
          <ButtonIcon aria-label="Disabled action" isDisabled>
            ⚙️
          </ButtonIcon>
        ),
      },
      {
        name: 'loading icon button',
        render: () => (
          <ButtonIcon aria-label="Loading action" isLoading>
            ⏳
          </ButtonIcon>
        ),
      },
      {
        name: 'error state icon button',
        render: () => (
          <ButtonIcon aria-label="Error action" isError>
            ⚠️
          </ButtonIcon>
        ),
      },
      {
        name: 'icon button with aria-describedby',
        render: () => (
          <div>
            <ButtonIcon aria-label="Save document" aria-describedby="save-help">
              💾
            </ButtonIcon>
            <div id="save-help">Save your current work to the server</div>
          </div>
        ),
      },
      {
        name: 'icon button with form type',
        render: () => (
          <form>
            <ButtonIcon aria-label="Submit form" type="submit">
              ✓
            </ButtonIcon>
          </form>
        ),
      },
      {
        name: 'icon button with toggle state',
        render: () => (
          <ButtonIcon aria-label="Toggle notifications" aria-pressed="false">
            🔔
          </ButtonIcon>
        ),
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ render }) => {
        const { container } = renderWithProviders(render())

        await expect(
          axe(container, {
            rules: {
              'color-contrast': { enabled: false },
            },
          }),
        ).resolves.toHaveNoViolations()
      },
    )

    it.skip('should have an accessibility violation if no aria-label is provided', async () => {
      // @ts-expect-error - we are intentionally testing a violation
      const { container } = renderWithProviders(<ButtonIcon>x</ButtonIcon>)
      const results = await axe(container)
      expect(results.violations).not.toHaveLength(0)
      // Buttons must have discernible text
      expect(results.violations[0]?.id).toBe('button-name')
    })
  })
})
