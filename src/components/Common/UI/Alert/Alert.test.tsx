import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert } from './Alert'
import InfoIcon from '@/assets/icons/info.svg?react'

describe('Alert', () => {
  it('renders with default variant (info)', () => {
    render(<Alert label="Test Alert" />)

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveAttribute('data-variant', 'info')
    expect(screen.getByText('Test Alert')).toBeInTheDocument()
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Alert label="Test Alert" variant="success" />)
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'success')

    rerender(<Alert label="Test Alert" variant="warning" />)
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'warning')

    rerender(<Alert label="Test Alert" variant="error" />)
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'error')
  })

  it('renders with children content', () => {
    render(
      <Alert label="Test Alert">
        <p>Additional content</p>
      </Alert>,
    )

    expect(screen.getByText('Additional content')).toBeInTheDocument()
  })

  it('renders with custom icon', () => {
    render(<Alert label="Test Alert" icon={InfoIcon} />)

    const icon = screen.getByRole('alert').querySelector('[aria-hidden="true"]')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('has proper accessibility attributes', () => {
    render(<Alert label="Test Alert" />)

    const alert = screen.getByRole('alert')
    const heading = screen.getByText('Test Alert')

    expect(alert).toHaveAttribute('aria-labelledby', heading.id)
    expect(heading).toHaveAttribute('id')
  })

  it('scrolls into view when mounted', () => {
    const scrollIntoViewMock = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      value: scrollIntoViewMock,
      writable: true,
    })

    render(<Alert label="Test Alert" />)

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })
  })
})
