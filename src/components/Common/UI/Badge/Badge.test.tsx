import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from './Badge'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Badge', () => {
  describe('Accessibility', () => {
    const testCases = [
      {
        name: 'default badge',
        props: { children: 'Badge Text' },
      },
      {
        name: 'dismissable badge',
        props: { children: 'Dismissable', onDismiss: () => {}, dismissAriaLabel: 'Remove item' },
      },
    ]

    it.each(testCases)(
      'should not have any accessibility violations - $name',
      async ({ props }) => {
        const { container } = renderWithProviders(<Badge {...props} />)
        await expectNoAxeViolations(container)
      },
    )
  })

  describe('onDismiss', () => {
    it('renders a dismiss button when onDismiss is provided', () => {
      const handleDismiss = vi.fn()
      renderWithProviders(
        <Badge onDismiss={handleDismiss} dismissAriaLabel="Remove tag">
          Tag
        </Badge>,
      )
      expect(screen.getByRole('button', { name: 'Remove tag' })).toBeInTheDocument()
    })

    it('does not render a dismiss button without onDismiss', () => {
      renderWithProviders(<Badge>Tag</Badge>)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('calls onDismiss when the dismiss button is clicked', async () => {
      const handleDismiss = vi.fn()
      renderWithProviders(
        <Badge onDismiss={handleDismiss} dismissAriaLabel="Remove tag">
          Tag
        </Badge>,
      )
      await userEvent.click(screen.getByRole('button', { name: 'Remove tag' }))
      expect(handleDismiss).toHaveBeenCalledOnce()
    })

    it('disables the dismiss button when isDisabled is true', () => {
      const handleDismiss = vi.fn()
      renderWithProviders(
        <Badge onDismiss={handleDismiss} isDisabled>
          Tag
        </Badge>,
      )
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })
})
