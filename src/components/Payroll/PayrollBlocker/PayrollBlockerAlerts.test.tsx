import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { PayrollBlockerAlerts } from './PayrollBlockerAlerts'
import type { ApiPayrollBlocker } from './payrollHelpers'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

vi.mock('@/i18n', () => ({
  useI18n: vi.fn(),
  defaultNS: 'common',
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      if (key === 'multipleIssuesTitle') {
        return `${options?.count || 0} issues are preventing you from running payroll`
      }
      if (key === 'viewAllBlockers') {
        return 'View All Blockers'
      }
      return key
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

const createMockBlocker = (overrides: Partial<ApiPayrollBlocker> = {}): ApiPayrollBlocker => ({
  key: 'blocker-1',
  message: 'Test Blocker',
  helpText: 'Test description',
  category: 'test',
  ...overrides,
})

describe('PayrollBlockerAlerts', () => {
  describe('rendering behavior', () => {
    it('applies custom className when provided', () => {
      const blockers = [createMockBlocker()]
      renderWithProviders(<PayrollBlockerAlerts blockers={blockers} className="custom-class" />)
      const alertElement = screen.getByRole('alert')
      const wrapper = alertElement.closest('div.custom-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('renders nothing when blockers array is empty', () => {
      renderWithProviders(<PayrollBlockerAlerts blockers={[]} />)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('single blocker', () => {
    it('displays the blocker message as title', () => {
      const blocker = createMockBlocker({ message: 'Single blocker message' })
      renderWithProviders(<PayrollBlockerAlerts blockers={[blocker]} />)
      const alertElement = screen.getByRole('alert')
      expect(alertElement).toHaveAccessibleName('Single blocker message')
    })

    it('displays component correctly with help text', () => {
      const blocker = createMockBlocker({
        key: 'unknown_key',
        message: 'Main message',
        helpText: 'Custom help text',
      })
      renderWithProviders(<PayrollBlockerAlerts blockers={[blocker]} />)
      // The component should render with the main message
      expect(screen.getByRole('alert')).toHaveAccessibleName('Main message')
      expect(screen.getAllByText('Main message')).toHaveLength(2) // Title and description
    })
  })

  describe('multiple blockers', () => {
    it('displays count in title', () => {
      const blockers = [
        createMockBlocker({ key: 'blocker-1' }),
        createMockBlocker({ key: 'blocker-2' }),
      ]
      renderWithProviders(<PayrollBlockerAlerts blockers={blockers} />)
      expect(
        screen.getByText('2 issues are preventing you from running payroll'),
      ).toBeInTheDocument()
    })

    it('shows view all button when onMultipleViewClick is provided', () => {
      const blockers = [
        createMockBlocker({ key: 'blocker-1' }),
        createMockBlocker({ key: 'blocker-2' }),
      ]
      const mockViewClick = vi.fn()
      renderWithProviders(
        <PayrollBlockerAlerts blockers={blockers} onMultipleViewClick={mockViewClick} />,
      )
      expect(screen.getByText('View All Blockers')).toBeInTheDocument()
    })
  })
})
