import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { ButtonIcon } from './ButtonIcon'

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
})
