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

  describe('alertConfig prop', () => {
    it('renders with alertConfig prop', () => {
      const alertConfig = {
        content: 'Config Alert',
        description: 'This is from the config',
        status: 'warning' as const,
      }

      render(<Alert alertConfig={alertConfig} />)

      expect(screen.getByText('Config Alert')).toBeInTheDocument()
      expect(screen.getByText('This is from the config')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'warning')
    })

    it('alertConfig takes precedence over individual props', () => {
      const alertConfig = {
        content: 'Config Content',
        description: 'Config Description',
        status: 'error' as const,
      }

      render(
        <Alert label="Old Label" status="info" alertConfig={alertConfig}>
          Old Children
        </Alert>,
      )

      expect(screen.getByText('Config Content')).toBeInTheDocument()
      expect(screen.getByText('Config Description')).toBeInTheDocument()
      expect(screen.queryByText('Old Label')).not.toBeInTheDocument()
      expect(screen.queryByText('Old Children')).not.toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'error')
    })

    it('handles alertConfig without description', () => {
      const alertConfig = {
        content: 'Simple Alert',
        status: 'success' as const,
      }

      render(<Alert alertConfig={alertConfig} />)

      expect(screen.getByText('Simple Alert')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'success')
    })
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
