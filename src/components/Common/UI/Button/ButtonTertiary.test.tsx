import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { ButtonTertiary } from './ButtonTertiary'

describe('ButtonTertiary', () => {
  it('renders correctly with default props', () => {
    render(<ButtonTertiary>Test Button</ButtonTertiary>)
    const button = screen.getByRole('button', { name: 'Test Button' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-variant', 'tertiary')
  })

  it('handles press events', async () => {
    const handlePress = vi.fn()
    render(<ButtonTertiary onClick={handlePress}>Clickable Button</ButtonTertiary>)
    const button = screen.getByRole('button', { name: 'Clickable Button' })

    await userEvent.click(button)
    expect(handlePress).toHaveBeenCalledTimes(1)
  })

  it('is disabled when isDisabled is true', () => {
    render(<ButtonTertiary isDisabled>Disabled Button</ButtonTertiary>)
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
  })

  it('is disabled when isLoading is true', () => {
    render(<ButtonTertiary isLoading>Loading Button</ButtonTertiary>)
    const button = screen.getByRole('button', { name: 'Loading Button' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('data-loading', 'true')
  })

  it('shows error state when isError is true', () => {
    render(<ButtonTertiary isError>Error Button</ButtonTertiary>)
    const button = screen.getByRole('button', { name: 'Error Button' })
    expect(button).toHaveAttribute('data-error', 'true')
  })
})
