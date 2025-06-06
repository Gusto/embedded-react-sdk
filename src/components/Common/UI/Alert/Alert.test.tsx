import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Alert } from './Alert'
import InfoIcon from '@/assets/icons/info.svg?react'
import { ComponentsContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Alert', () => {
  it('renders with default variant (info)', () => {
    render(<Alert label="Test Alert" />)

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveAttribute('data-variant', 'info')
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
      <ComponentsContext.Provider value={defaultComponents}>
        <Alert label="Test Alert">
          <defaultComponents.Text>Additional content</defaultComponents.Text>
        </Alert>
      </ComponentsContext.Provider>,
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

  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'basic alert',
        props: { label: 'Alert', children: 'This is a basic alert message' },
      },
      {
        name: 'info alert',
        props: {
          label: 'Information',
          status: 'info' as const,
          children: 'This is an informational message',
        },
      },
      {
        name: 'success alert',
        props: {
          label: 'Success',
          status: 'success' as const,
          children: 'Operation completed successfully',
        },
      },
      {
        name: 'warning alert',
        props: {
          label: 'Warning',
          status: 'warning' as const,
          children: 'This is a warning message',
        },
      },
      {
        name: 'error alert',
        props: { label: 'Error', status: 'error' as const, children: 'An error has occurred' },
      },
      {
        name: 'alert with custom icon',
        props: { label: 'Custom', icon: <span>🔔</span>, children: 'Alert with custom icon' },
      },
      { name: 'alert without children', props: { label: 'Simple alert' } },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Alert {...props} />)
        await expect(
          axe(container, {
            rules: {
              'color-contrast': { enabled: false },
            },
          }),
        ).resolves.toHaveNoViolations()
      },
    )
  })
})
