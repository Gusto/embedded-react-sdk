import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Breadcrumb } from './Breadcrumb'
import { Breadcrumbs } from './Breadcrumbs'

describe('Breadcrumb', () => {
  it('renders children content', () => {
    render(
      <Breadcrumbs>
        <Breadcrumb>Home</Breadcrumb>
      </Breadcrumbs>,
    )
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('renders as a link when href is provided', () => {
    render(
      <Breadcrumbs>
        <Breadcrumb href="/home">Home</Breadcrumb>
      </Breadcrumbs>,
    )
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/home')
  })

  it('renders as a span when no href is provided', () => {
    render(
      <Breadcrumbs>
        <Breadcrumb>Current Page</Breadcrumb>
      </Breadcrumbs>,
    )
    const element = screen.getByText('Current Page')
    expect(element.closest('span')).toBeInTheDocument()
  })

  it('handles click events when provided', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Breadcrumbs>
        <Breadcrumb href="#" onClick={handleClick}>
          Home
        </Breadcrumb>
      </Breadcrumbs>,
    )

    const link = screen.getByRole('link', { name: 'Home' })
    await user.click(link)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className when provided', () => {
    render(
      <Breadcrumbs>
        <Breadcrumb className="custom-breadcrumb">Home</Breadcrumb>
      </Breadcrumbs>,
    )
    const element = screen.getByText('Home')
    expect(element.closest('li')).toHaveClass('custom-breadcrumb')
  })

  it('renders correctly when isCurrent is true', () => {
    render(
      <Breadcrumbs>
        <Breadcrumb isCurrent>Current Page</Breadcrumb>
      </Breadcrumbs>,
    )
    const element = screen.getByText('Current Page')
    expect(element.closest('li')).toHaveAttribute('data-current', 'true')
  })
})
