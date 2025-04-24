import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Breadcrumb } from './Breadcrumb'

describe('Breadcrumb', () => {
  it('renders children content', () => {
    render(<Breadcrumb>Home</Breadcrumb>)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('renders as a link when href is provided', () => {
    render(<Breadcrumb href="/home">Home</Breadcrumb>)
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/home')
  })

  it('renders as a span when no href is provided', () => {
    render(<Breadcrumb>Current Page</Breadcrumb>)
    const element = screen.getByText('Current Page')
    expect(element.tagName).toBe('SPAN')
  })

  it('handles click events when provided', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Breadcrumb href="/home" onClick={handleClick}>
        Home
      </Breadcrumb>,
    )

    const link = screen.getByRole('link', { name: 'Home' })
    await user.click(link)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className when provided', () => {
    render(<Breadcrumb className="custom-breadcrumb">Home</Breadcrumb>)
    expect(screen.getByText('Home')).toHaveClass('custom-breadcrumb')
  })

  it('renders correctly when isCurrent is true', () => {
    render(<Breadcrumb isCurrent>Current Page</Breadcrumb>)
    const element = screen.getByText('Current Page')
    expect(element.tagName).toBe('SPAN')
  })
})
