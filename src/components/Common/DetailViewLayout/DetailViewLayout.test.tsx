import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DetailViewLayout } from './DetailViewLayout'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints')

describe('DetailViewLayout', () => {
  const tabs = [
    { id: 'details', label: 'Details', content: <div>Details tab content</div> },
    { id: 'employees', label: 'Employees', content: <div>Employees tab content</div> },
  ]
  beforeEach(async () => {
    const { useContainerBreakpoints } =
      await import('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
    vi.mocked(useContainerBreakpoints).mockReturnValue(['base', 'small', 'medium'])
  })

  describe('Rendering', () => {
    it('renders title as a heading', async () => {
      renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={vi.fn()}
        />,
      )

      expect(await screen.findByRole('heading', { name: 'Company PTO' })).toBeInTheDocument()
    })

    it('renders subtitle when provided', async () => {
      renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          subtitle="Paid time off policy"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={vi.fn()}
        />,
      )

      expect(await screen.findByText('Paid time off policy')).toBeInTheDocument()
    })

    it('does not render subtitle when omitted', async () => {
      renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={vi.fn()}
        />,
      )

      await screen.findByRole('heading', { name: 'Company PTO' })
      expect(screen.queryByText('Paid time off policy')).not.toBeInTheDocument()
    })

    it('renders tab buttons matching provided labels', async () => {
      renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={vi.fn()}
        />,
      )

      expect(await screen.findByRole('tab', { name: 'Details' })).toBeInTheDocument()
      expect(await screen.findByRole('tab', { name: 'Employees' })).toBeInTheDocument()
    })

    it('renders the selected tab content', async () => {
      renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={vi.fn()}
        />,
      )

      expect(await screen.findByText('Details tab content')).toBeInTheDocument()
    })

    it('renders actions when provided', async () => {
      renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={vi.fn()}
          actions={<button>Edit policy</button>}
        />,
      )

      expect(await screen.findByRole('button', { name: 'Edit policy' })).toBeInTheDocument()
    })

    it('does not render actions wrapper when actions are omitted', async () => {
      const { container } = renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={vi.fn()}
        />,
      )

      await screen.findByRole('heading', { name: 'Company PTO' })
      expect(container.querySelector('[class*="actions"]')).not.toBeInTheDocument()
    })
  })

  describe('Back navigation', () => {
    it('renders back button with backLabel when onBack is provided', async () => {
      renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={vi.fn()}
          onBack={vi.fn()}
          backLabel="Time off policies"
        />,
      )

      expect(await screen.findByRole('button', { name: /Time off policies/i })).toBeInTheDocument()
    })

    it('does not render back button when onBack is omitted', async () => {
      renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={vi.fn()}
        />,
      )

      await screen.findByRole('heading', { name: 'Company PTO' })
      expect(screen.queryByRole('button', { name: /Time off policies/i })).not.toBeInTheDocument()
    })

    it('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup()
      const handleBack = vi.fn()

      renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={vi.fn()}
          onBack={handleBack}
          backLabel="Time off policies"
        />,
      )

      await user.click(await screen.findByRole('button', { name: /Time off policies/i }))
      expect(handleBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Tab interaction', () => {
    it('calls onTabChange when a different tab is clicked', async () => {
      const user = userEvent.setup()
      const handleTabChange = vi.fn()

      renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={handleTabChange}
        />,
      )

      await user.click(await screen.findByRole('tab', { name: 'Employees' }))
      expect(handleTabChange).toHaveBeenCalledWith('employees')
    })
  })

  describe('Accessibility', () => {
    it('should not have any accessibility violations with default config', async () => {
      const { container } = renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={vi.fn()}
        />,
      )

      await screen.findByRole('heading', { name: 'Company PTO' })
      await expectNoAxeViolations(container)
    })

    it('should not have any accessibility violations with back button and actions', async () => {
      const { container } = renderWithProviders(
        <DetailViewLayout
          title="Company PTO"
          subtitle="Paid time off policy"
          tabs={tabs}
          selectedTabId="details"
          onTabChange={vi.fn()}
          onBack={vi.fn()}
          backLabel="Time off policies"
          actions={<button>Edit policy</button>}
        />,
      )

      await screen.findByRole('heading', { name: 'Company PTO' })
      await expectNoAxeViolations(container)
    })
  })
})
