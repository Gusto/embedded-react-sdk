import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { ButtonLink } from './ButtonLink'

describe('ButtonLink', () => {
  it('renders correctly with default props', () => {
    render(<ButtonLink>Test Button</ButtonLink>)
    const button = screen.getByRole('button', { name: 'Test Button' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', 'link')
  })

  it('handles press events', async () => {
    const handlePress = vi.fn()
    render(<ButtonLink onClick={handlePress}>Clickable Button</ButtonLink>)
    const button = screen.getByRole('button', { name: 'Clickable Button' })

    await userEvent.click(button)
    expect(handlePress).toHaveBeenCalledTimes(1)
  })

  it('is disabled when isDisabled is true', () => {
    render(<ButtonLink isDisabled>Disabled Button</ButtonLink>)
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
  })

  it('is disabled when isLoading is true', () => {
    render(<ButtonLink isLoading>Loading Button</ButtonLink>)
    const button = screen.getByRole('button', { name: 'Loading Button' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('data-loading', 'true')
  })

  it('shows error state when isError is true', () => {
    render(<ButtonLink isError>Error Button</ButtonLink>)
    const button = screen.getByRole('button', { name: 'Error Button' })
    expect(button).toHaveAttribute('data-error', 'true')
  })
})
