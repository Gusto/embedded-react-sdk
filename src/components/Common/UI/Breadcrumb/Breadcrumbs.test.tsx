import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Breadcrumbs } from './Breadcrumbs'
import { Breadcrumb } from './Breadcrumb'

describe('Breadcrumbs', () => {
  it('renders children breadcrumbs', () => {
    render(
      <Breadcrumbs>
        <Breadcrumb href="/">Home</Breadcrumb>
        <Breadcrumb href="/products">Products</Breadcrumb>
        <Breadcrumb isCurrent>Current Page</Breadcrumb>
      </Breadcrumbs>,
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Current Page')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(
      <Breadcrumbs className="custom-breadcrumbs">
        <Breadcrumb>Test</Breadcrumb>
      </Breadcrumbs>,
    )

    const container = screen.getByRole('navigation')
    expect(container).toHaveClass('custom-breadcrumbs')
  })

  it('renders single breadcrumb correctly', () => {
    render(
      <Breadcrumbs>
        <Breadcrumb isCurrent>Home</Breadcrumb>
      </Breadcrumbs>,
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('renders with proper navigation role', () => {
    render(
      <Breadcrumbs>
        <Breadcrumb href="/">Home</Breadcrumb>
      </Breadcrumbs>,
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders with proper list role', () => {
    render(
      <Breadcrumbs>
        <Breadcrumb href="/">Home</Breadcrumb>
      </Breadcrumbs>,
    )

    expect(screen.getByRole('list')).toBeInTheDocument()
  })
})
