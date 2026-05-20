import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert } from './Alert'
import InfoIcon from '@/assets/icons/info.svg?react'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Alert', () => {
  it('renders with required props', () => {
    render(<Alert label="Test Alert" />)

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(screen.getByText('Test Alert')).toBeInTheDocument()
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Alert label="Test Alert" status="success" />)
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'success')

    rerender(<Alert label="Test Alert" status="warning" />)
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'warning')

    rerender(<Alert label="Test Alert" status="error" />)
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'error')
  })

  it('renders with children content', () => {
    render(
      <Alert label="Test Alert">
        <div>Additional content</div>
      </Alert>,
    )

    expect(screen.getByText('Additional content')).toBeInTheDocument()
  })

  it('renders an action inline beside the label', () => {
    render(<Alert label="Test Alert" action={<button>Review</button>} />)

    const reviewButton = screen.getByRole('button', { name: 'Review' })
    const heading = screen.getByText('Test Alert')
    expect(reviewButton).toBeInTheDocument()
    expect(heading.parentElement).toBe(reviewButton.parentElement?.parentElement)
  })

  it('renders with custom icon', () => {
    render(<Alert label="Test Alert" icon={<InfoIcon aria-hidden />} />)

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

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic alert',
        props: { label: 'Information', children: 'Basic alert message' },
      },
      {
        name: 'alert with complex content',
        props: {
          label: 'Important',
          children: (
            <div>
              <strong>Important:</strong> Please save your work before continuing.
            </div>
          ),
        },
      },
      {
        name: 'alert with custom icon',
        props: {
          label: 'Custom',
          icon: <span>🔔</span>,
          children: 'Alert with custom icon',
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Alert {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic alert',
        props: { label: 'Information', children: 'Basic alert message' },
      },
      {
        name: 'alert with complex content',
        props: {
          label: 'Important',
          children: (
            <div>
              <strong>Important:</strong> Please save your work before continuing.
            </div>
          ),
        },
      },
      {
        name: 'alert with custom icon',
        props: {
          label: 'Custom',
          icon: <span>🔔</span>,
          children: 'Alert with custom icon',
        },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Alert {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })
})
