import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Alert } from './Alert'
import InfoIcon from '@/assets/icons/info.svg?react'

describe('Alert', () => {
  describe('Alert variant', () => {
    it('renders with required props', () => {
      render(<Alert variant="alert" label="Test Alert" />)

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(screen.getByText('Test Alert')).toBeInTheDocument()
    })

    it('renders with different status variants', () => {
      const { rerender } = render(<Alert variant="alert" label="Test Alert" status="success" />)
      expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'success')

      rerender(<Alert variant="alert" label="Test Alert" status="warning" />)
      expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'warning')

      rerender(<Alert variant="alert" label="Test Alert" status="error" />)
      expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'error')

      rerender(<Alert variant="alert" label="Test Alert" status="info" />)
      expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'info')
    })

    it('renders with children content', () => {
      render(
        <Alert variant="alert" label="Test Alert">
          <div>Additional content</div>
        </Alert>,
      )

      expect(screen.getByText('Additional content')).toBeInTheDocument()
    })

    it('renders with description', () => {
      render(<Alert variant="alert" label="Test Alert" description="This is a description" />)

      expect(screen.getByText('This is a description')).toBeInTheDocument()
    })

    it('renders with custom icon', () => {
      render(<Alert variant="alert" label="Test Alert" icon={<InfoIcon aria-hidden />} />)

      const icon = screen.getByRole('alert').querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('has proper accessibility attributes', () => {
      render(<Alert variant="alert" label="Test Alert" />)

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

      render(<Alert variant="alert" label="Test Alert" />)

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })
    })

    it('renders dismiss button when onDismiss is provided', () => {
      const onDismiss = vi.fn()
      render(<Alert variant="alert" label="Test Alert" onDismiss={onDismiss} />)

      const dismissButton = screen.getByRole('button', { name: 'Dismiss alert' })
      expect(dismissButton).toBeInTheDocument()
    })

    it('calls onDismiss when dismiss button is clicked', async () => {
      const onDismiss = vi.fn()
      render(<Alert variant="alert" label="Test Alert" onDismiss={onDismiss} />)

      const dismissButton = screen.getByRole('button', { name: 'Dismiss alert' })
      await userEvent.click(dismissButton)

      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('applies custom className', () => {
      const { container } = render(
        <Alert variant="alert" label="Test Alert" className="custom-class" />,
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Banner variant', () => {
    it('renders with required props', () => {
      render(<Alert variant="banner" label="Test Banner" />)

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(screen.getByText('Test Banner')).toBeInTheDocument()
    })

    it('renders with different status variants', () => {
      const { rerender } = render(<Alert variant="banner" label="Test Banner" status="success" />)
      expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'success')

      rerender(<Alert variant="banner" label="Test Banner" status="warning" />)
      expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'warning')

      rerender(<Alert variant="banner" label="Test Banner" status="error" />)
      expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'error')

      rerender(<Alert variant="banner" label="Test Banner" status="info" />)
      expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'info')
    })

    it('renders with description', () => {
      render(<Alert variant="banner" label="Test Banner" description="This is a description" />)

      expect(screen.getByText('This is a description')).toBeInTheDocument()
    })

    it('renders with children content', () => {
      render(
        <Alert variant="banner" label="Test Banner">
          <div>Additional content</div>
        </Alert>,
      )

      expect(screen.getByText('Additional content')).toBeInTheDocument()
    })

    it('renders with both description and children', () => {
      render(
        <Alert variant="banner" label="Test Banner" description="Description text">
          <div>Child content</div>
        </Alert>,
      )

      expect(screen.getByText('Description text')).toBeInTheDocument()
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('has data-standalone attribute when no description or children', () => {
      const { container } = render(<Alert variant="banner" label="Test Banner" />)

      const header = container.querySelector('[data-standalone="true"]')
      expect(header).toBeInTheDocument()
    })

    it('does not have data-standalone=true when description is provided', () => {
      const { container } = render(
        <Alert variant="banner" label="Test Banner" description="Description" />,
      )

      const header = container.querySelector('[data-standalone="true"]')
      expect(header).not.toBeInTheDocument()
    })

    it('does not have data-standalone=true when children are provided', () => {
      const { container } = render(
        <Alert variant="banner" label="Test Banner">
          <div>Content</div>
        </Alert>,
      )

      const header = container.querySelector('[data-standalone="true"]')
      expect(header).not.toBeInTheDocument()
    })

    it('renders dismiss button when onDismiss is provided', () => {
      const onDismiss = vi.fn()
      render(<Alert variant="banner" label="Test Banner" onDismiss={onDismiss} />)

      const dismissButton = screen.getByRole('button', { name: 'Dismiss alert' })
      expect(dismissButton).toBeInTheDocument()
    })

    it('calls onDismiss when dismiss button is clicked', async () => {
      const onDismiss = vi.fn()
      render(<Alert variant="banner" label="Test Banner" onDismiss={onDismiss} />)

      const dismissButton = screen.getByRole('button', { name: 'Dismiss alert' })
      await userEvent.click(dismissButton)

      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('renders with custom icon', () => {
      render(<Alert variant="banner" label="Test Banner" icon={<InfoIcon aria-hidden />} />)

      const icon = screen.getByRole('alert').querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('applies custom className', () => {
      const { container } = render(
        <Alert variant="banner" label="Test Banner" className="custom-class" />,
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('does not scroll into view when mounted', () => {
      const scrollIntoViewMock = vi.fn()
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        value: scrollIntoViewMock,
        writable: true,
      })

      render(<Alert variant="banner" label="Test Banner" />)

      expect(scrollIntoViewMock).toHaveBeenCalledTimes(0)
    })
  })
})
