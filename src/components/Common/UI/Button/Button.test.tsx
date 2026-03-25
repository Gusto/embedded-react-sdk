import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { Button } from './Button'
import { ButtonDefaults } from './ButtonTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Button', () => {
  it('renders correctly with default props', () => {
    renderWithProviders(<Button {...ButtonDefaults}>Test Button</Button>)
    const button = screen.getByRole('button', { name: 'Test Button' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', ButtonDefaults.variant)
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

  it('renders icon when provided', () => {
    render(<Button icon={<svg data-testid="test-icon" />}>Icon Button</Button>)
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Icon Button' })).toBeInTheDocument()
  })

  it('does not render icon wrapper when icon is not provided', () => {
    const { container } = render(<Button>No Icon</Button>)
    expect(container.querySelector('span')).not.toBeInTheDocument()
  })

  describe('Accessibility', () => {
    const testCases = [
      { name: 'default', props: { children: 'Default Button' } },
      { name: 'disabled', props: { isDisabled: true, children: 'Disabled Button' } },
      { name: 'loading', props: { isLoading: true, children: 'Loading Button' } },
      {
        name: 'with icon',
        props: { icon: <svg aria-hidden="true" />, children: 'Icon Button' },
      },
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
