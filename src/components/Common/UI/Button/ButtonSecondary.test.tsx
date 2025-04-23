import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { ButtonSecondary } from './ButtonSecondary'

describe('ButtonSecondary', () => {
  it('renders correctly with default props', () => {
    render(<ButtonSecondary>Test Button</ButtonSecondary>)
    const button = screen.getByRole('button', { name: 'Test Button' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', 'secondary')
  })

  it('handles press events', async () => {
    const handlePress = vi.fn()
    render(<ButtonSecondary onClick={handlePress}>Clickable Button</ButtonSecondary>)
    const button = screen.getByRole('button', { name: 'Clickable Button' })

    await userEvent.click(button)
    expect(handlePress).toHaveBeenCalledTimes(1)
  })

  it('is disabled when isDisabled is true', () => {
    render(<ButtonSecondary isDisabled>Disabled Button</ButtonSecondary>)
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
  })

  it('is disabled when isLoading is true', () => {
    render(<ButtonSecondary isLoading>Loading Button</ButtonSecondary>)
    const button = screen.getByRole('button', { name: 'Loading Button' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('data-loading', 'true')
  })

  it('shows error state when isError is true', () => {
    render(<ButtonSecondary isError>Error Button</ButtonSecondary>)
    const button = screen.getByRole('button', { name: 'Error Button' })
    expect(button).toHaveAttribute('data-error', 'true')
  })
})
