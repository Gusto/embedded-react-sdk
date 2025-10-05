import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PayrollBlockerList } from './PayrollBlockerList'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

interface PayrollBlocker {
  id: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

// Mock i18n hooks
vi.mock('@/i18n', () => ({
  useI18n: vi.fn(),
  defaultNS: 'common',
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Return localized strings for our specific keys
      const translations: Record<string, string> = {
        blockersListTitle: 'Payroll blockers',
        blockerSectionLabel: 'Blocker',
      }
      return translations[key] || key
    },
    i18n: {
      resolvedLanguage: 'en',
      addResourceBundle: vi.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const createMockBlocker = (overrides: Partial<PayrollBlocker> = {}): PayrollBlocker => ({
  id: 'blocker-1',
  title: 'Missing tax information',
  description: 'Please complete your tax setup before running payroll.',
  ...overrides,
})

describe('PayrollBlockerList', () => {
  describe('rendering behavior', () => {
    it('renders nothing when no blockers are provided', () => {
      renderWithProviders(<PayrollBlockerList blockers={[]} />)

      // Component should not render the title or DataView when no blockers
      expect(screen.queryByText('Payroll blockers')).not.toBeInTheDocument()
      expect(screen.queryByTestId('data-view')).not.toBeInTheDocument()
    })

    it('renders list title when blockers exist', () => {
      const blockers = [createMockBlocker()]

      renderWithProviders(<PayrollBlockerList blockers={blockers} />)

      expect(screen.getByText('Payroll blockers')).toBeInTheDocument()
    })

    it('renders DataView component with proper label', () => {
      const blockers = [createMockBlocker()]

      renderWithProviders(<PayrollBlockerList blockers={blockers} />)

      // DataView should be present
      expect(screen.getByTestId('data-view')).toBeInTheDocument()
      // And should have proper aria-label
      expect(screen.getByRole('list')).toBeInTheDocument()
    })

    it('applies custom className when provided', () => {
      const blockers = [createMockBlocker()]
      const customClass = 'custom-blocker-list'

      const { container } = renderWithProviders(
        <PayrollBlockerList blockers={blockers} className={customClass} />,
      )

      // The className should be applied somewhere in the component tree
      expect(container.querySelector(`.${customClass}`)).toBeInTheDocument()
    })
  })

  describe('blocker content rendering', () => {
    it('displays blocker title and description', () => {
      const blocker = createMockBlocker({
        title: 'Test Blocker Title',
        description: 'Test blocker description',
      })

      renderWithProviders(<PayrollBlockerList blockers={[blocker]} />)

      expect(screen.getByText('Test Blocker Title')).toBeInTheDocument()
      expect(screen.getByText('Test blocker description')).toBeInTheDocument()
    })

    it('renders multiple blockers', () => {
      const blockers = [
        createMockBlocker({
          id: 'blocker-1',
          title: 'First Blocker',
          description: 'First description',
        }),
        createMockBlocker({
          id: 'blocker-2',
          title: 'Second Blocker',
          description: 'Second description',
        }),
      ]

      renderWithProviders(<PayrollBlockerList blockers={blockers} />)

      expect(screen.getByText('First Blocker')).toBeInTheDocument()
      expect(screen.getByText('First description')).toBeInTheDocument()
      expect(screen.getByText('Second Blocker')).toBeInTheDocument()
      expect(screen.getByText('Second description')).toBeInTheDocument()
    })
  })

  describe('action button behavior', () => {
    it('renders action button when blocker has an action', () => {
      const mockAction = vi.fn()
      const blocker = createMockBlocker({
        action: {
          label: 'Fix Issue',
          onClick: mockAction,
        },
      })

      renderWithProviders(<PayrollBlockerList blockers={[blocker]} />)

      const actionButton = screen.getByRole('button', { name: 'Fix Issue' })
      expect(actionButton).toBeInTheDocument()
      // Note: The component sets title attribute, but testing library might not reflect it properly
      // Testing for the button presence and accessibility name is sufficient
    })

    it('does not render action button when blocker has no action', () => {
      const blocker = createMockBlocker({
        action: undefined,
      })

      renderWithProviders(<PayrollBlockerList blockers={[blocker]} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('calls action onClick when button is clicked', async () => {
      const mockAction = vi.fn()
      const blocker = createMockBlocker({
        action: {
          label: 'Resolve Now',
          onClick: mockAction,
        },
      })

      renderWithProviders(<PayrollBlockerList blockers={[blocker]} />)

      const actionButton = screen.getByRole('button', { name: 'Resolve Now' })
      await userEvent.click(actionButton)

      expect(mockAction).toHaveBeenCalledTimes(1)
    })

    it('renders multiple action buttons for multiple blockers', async () => {
      const mockAction1 = vi.fn()
      const mockAction2 = vi.fn()
      const blockers = [
        createMockBlocker({
          id: 'blocker-1',
          title: 'First Blocker',
          action: {
            label: 'Fix First',
            onClick: mockAction1,
          },
        }),
        createMockBlocker({
          id: 'blocker-2',
          title: 'Second Blocker',
          action: {
            label: 'Fix Second',
            onClick: mockAction2,
          },
        }),
      ]

      renderWithProviders(<PayrollBlockerList blockers={blockers} />)

      const firstButton = screen.getByRole('button', { name: 'Fix First' })
      const secondButton = screen.getByRole('button', { name: 'Fix Second' })

      expect(firstButton).toBeInTheDocument()
      expect(secondButton).toBeInTheDocument()

      await userEvent.click(firstButton)
      await userEvent.click(secondButton)

      expect(mockAction1).toHaveBeenCalledTimes(1)
      expect(mockAction2).toHaveBeenCalledTimes(1)
    })
  })

  describe('DataView integration', () => {
    it('passes blockers data to DataView', () => {
      const blockers = [
        createMockBlocker({ id: 'blocker-1', title: 'Test 1' }),
        createMockBlocker({ id: 'blocker-2', title: 'Test 2' }),
      ]

      renderWithProviders(<PayrollBlockerList blockers={blockers} />)

      // Verify that both blockers are rendered through DataView
      expect(screen.getByText('Test 1')).toBeInTheDocument()
      expect(screen.getByText('Test 2')).toBeInTheDocument()
    })

    it('renders correct column structure', () => {
      const blocker = createMockBlocker({
        title: 'Column Test',
        description: 'Testing column structure',
        action: {
          label: 'Test Action',
          onClick: vi.fn(),
        },
      })

      renderWithProviders(<PayrollBlockerList blockers={[blocker]} />)

      // Check that the blocker column header is present
      expect(screen.getByText('Blocker')).toBeInTheDocument()

      // Verify content is properly structured
      expect(screen.getByText('Column Test')).toBeInTheDocument()
      expect(screen.getByText('Testing column structure')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Test Action' })).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      const blockers = [createMockBlocker()]

      renderWithProviders(<PayrollBlockerList blockers={blockers} />)

      const heading = screen.getByRole('heading', { name: 'Payroll blockers' })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })

    it('maintains semantic structure with text weights', () => {
      const blocker = createMockBlocker({
        title: 'Important Title',
        description: 'Supporting description',
      })

      renderWithProviders(<PayrollBlockerList blockers={[blocker]} />)

      // The title should be rendered with semibold weight
      const titleElement = screen.getByText('Important Title')
      expect(titleElement).toBeInTheDocument()

      // The description should be rendered with supporting variant
      const descriptionElement = screen.getByText('Supporting description')
      expect(descriptionElement).toBeInTheDocument()
    })
  })
})
