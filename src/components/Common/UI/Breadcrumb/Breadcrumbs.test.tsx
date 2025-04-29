import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Breadcrumbs } from './Breadcrumbs'
import type { BreadcrumbsProps, Crumb } from './BreadcrumbTypes'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'

const renderBreadcrumbs = (props: BreadcrumbsProps) => {
  return render(
    <GustoTestApiProvider>
      <Breadcrumbs {...props} />
    </GustoTestApiProvider>,
  )
}

describe('Breadcrumbs', () => {
  it('renders multiple breadcrumbs', () => {
    const crumbs: Crumb[] = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Current Page', isCurrent: true },
    ]

    renderBreadcrumbs({ crumbs })

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Current Page')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    renderBreadcrumbs({
      className: 'custom-breadcrumbs',
      crumbs: [{ label: 'Test' }],
    })

    const container = screen.getByRole('navigation')
    expect(container).toHaveClass('custom-breadcrumbs')
  })

  it('renders single breadcrumb correctly', () => {
    renderBreadcrumbs({
      crumbs: [{ label: 'Home', isCurrent: true }],
    })

    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('renders with proper navigation role', () => {
    renderBreadcrumbs({
      crumbs: [{ label: 'Home', href: '/' }],
    })

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders with proper list role', () => {
    renderBreadcrumbs({
      crumbs: [{ label: 'Home', href: '/' }],
    })

    expect(screen.getByRole('list')).toBeInTheDocument()
  })
})

describe('Breadcrumb', () => {
  it('renders crumb content', () => {
    renderBreadcrumbs({
      crumbs: [{ label: 'Home' }],
    })
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('renders as a link when href is provided', () => {
    renderBreadcrumbs({
      crumbs: [{ label: 'Home', href: '/home' }],
    })
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/home')
  })

  it('renders as a span when no href is provided', () => {
    renderBreadcrumbs({
      crumbs: [{ label: 'Current Page' }],
    })
    const element = screen.getByText('Current Page')
    expect(element.closest('span')).toBeInTheDocument()
  })

  it('handles click events when provided', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    renderBreadcrumbs({
      crumbs: [{ label: 'Home', href: '#', onClick: handleClick }],
    })

    const link = screen.getByRole('link', { name: 'Home' })
    await user.click(link)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className to the breadcrumbs container', () => {
    renderBreadcrumbs({
      className: 'custom-breadcrumbs',
      crumbs: [{ label: 'Home' }],
    })
    const element = screen.getByRole('navigation')
    expect(element).toHaveClass('custom-breadcrumbs')
  })

  it('renders correctly when isCurrent is true', () => {
    renderBreadcrumbs({
      crumbs: [{ label: 'Current Page', isCurrent: true }],
    })
    const element = screen.getByText('Current Page').closest('[data-current="true"]')
    expect(element).toBeInTheDocument()
  })
})
