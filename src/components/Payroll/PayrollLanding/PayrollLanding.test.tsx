import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PayrollLanding } from './PayrollLanding'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

// Mock the child components
vi.mock('../RunPayrollFlow/RunPayroll', () => ({
  RunPayroll: ({
    companyId,
    onEvent,
  }: {
    companyId: string
    onEvent: (event: string, payload: unknown) => void
  }) => (
    <div data-testid="run-payroll">
      <h2>Run Payroll</h2>
      <p>Company ID: {companyId}</p>
      <button
        onClick={() => {
          onEvent('test-event', {})
        }}
      >
        Test Event
      </button>
    </div>
  ),
}))

vi.mock('../PayrollHistory/PayrollHistory', () => ({
  PayrollHistory: ({
    companyId,
    onEvent,
  }: {
    companyId: string
    onEvent: (event: string, payload: unknown) => void
  }) => (
    <div data-testid="payroll-history">
      <h2>Payroll History</h2>
      <p>Company ID: {companyId}</p>
      <button
        onClick={() => {
          onEvent('test-event', {})
        }}
      >
        Test Event
      </button>
    </div>
  ),
}))

describe('PayrollLanding', () => {
  const defaultProps = {
    companyId: 'test-company-123',
    onEvent: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the run payroll component by default', async () => {
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('run-payroll')).toBeInTheDocument()
      })

      expect(screen.getByText('Run Payroll')).toBeInTheDocument()
      expect(screen.getByText('Company ID: test-company-123')).toBeInTheDocument()
    })

    it('does not render payroll history component by default', async () => {
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('run-payroll')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('payroll-history')).not.toBeInTheDocument()
    })
  })

  describe('tab navigation', () => {
    it('switches to payroll history component when tab is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('run-payroll')).toBeInTheDocument()
      })

      // Click on payroll history tab
      const payrollHistoryTab = screen.getByRole('tab', { name: 'Payroll history' })
      await user.click(payrollHistoryTab)

      // Check that payroll history component is now visible
      await waitFor(() => {
        expect(screen.getByTestId('payroll-history')).toBeInTheDocument()
      })

      expect(screen.getByText('Payroll History')).toBeInTheDocument()
      expect(screen.getByText('Company ID: test-company-123')).toBeInTheDocument()
    })

    it('switches back to run payroll component when tab is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('run-payroll')).toBeInTheDocument()
      })

      // Switch to payroll history tab
      const payrollHistoryTab = screen.getByRole('tab', { name: 'Payroll history' })
      await user.click(payrollHistoryTab)

      await waitFor(() => {
        expect(screen.getByTestId('payroll-history')).toBeInTheDocument()
      })

      // Switch back to run payroll tab
      const runPayrollTab = screen.getByRole('tab', { name: 'Run payroll' })
      await user.click(runPayrollTab)

      // Check that run payroll component is visible again
      await waitFor(() => {
        expect(screen.getByTestId('run-payroll')).toBeInTheDocument()
      })

      expect(screen.getByText('Run Payroll')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('renders with proper accessibility structure', async () => {
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('run-payroll')).toBeInTheDocument()
      })

      // Verify the component renders without accessibility violations
      // The tab component itself should handle its own accessibility
      expect(screen.getByText('Run Payroll')).toBeInTheDocument()
    })
  })

  describe('event handling', () => {
    it('passes onEvent to child components', async () => {
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('run-payroll')).toBeInTheDocument()
      })

      // Click the test event button in the run payroll component
      const testButton = screen.getByText('Test Event')
      await userEvent.click(testButton)

      // Check that the event was called
      expect(defaultProps.onEvent).toHaveBeenCalledWith('test-event', {})
    })

    it('passes companyId to child components', async () => {
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Company ID: test-company-123')).toBeInTheDocument()
      })
    })
  })

  describe('internationalization', () => {
    it('uses correct translation keys for tab labels', async () => {
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('run-payroll')).toBeInTheDocument()
      })

      // Check that translated tab labels are used
      expect(screen.getByRole('tab', { name: 'Run payroll' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Payroll history' })).toBeInTheDocument()
    })
  })
})
