import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { Button } from './Button'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Test Button</Button>)
    const button = screen.getByRole('button', { name: 'Test Button' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', 'primary')
  })

  it('handles press events', async () => {
    const handlePress = vi.fn()
    render(<Button onClick={handlePress}>Clickable Button</Button>)
    const button = screen.getByRole('button', { name: 'Clickable Button' })

    await userEvent.click(button)
    expect(handlePress).toHaveBeenCalledTimes(1)
  })

  it('is disabled when isDisabled is true', () => {
    render(<Button isDisabled>Disabled Button</Button>)
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
  })

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Loading Button</Button>)
    const button = screen.getByRole('button', { name: 'Loading Button' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('data-loading', 'true')
  })

  describe('Accessibility', () => {
    const testCases = [
      { name: 'default', props: { children: 'Default Button' } },
      { name: 'disabled', props: { isDisabled: true, children: 'Disabled Button' } },
      { name: 'loading', props: { isLoading: true, children: 'Loading Button' } },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Button {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
