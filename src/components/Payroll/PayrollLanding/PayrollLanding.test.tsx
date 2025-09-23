import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PayrollLanding } from './PayrollLanding'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

describe('PayrollLanding', () => {
  const defaultProps = {
    companyId: 'test-company-123',
    onEvent: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setupApiTestMocks()
  })

  describe('rendering', () => {
    it('renders the payroll list in run payroll tab by default', async () => {
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      // Wait for the tabs to load
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Run payroll' })).toBeInTheDocument()
      })

      // Verify the Run payroll tab is selected
      expect(screen.getByRole('tab', { name: 'Run payroll' })).toHaveAttribute(
        'aria-selected',
        'true',
      )

      // Verify PayrollList component content is rendered (look for the heading)
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upcoming payroll' })).toBeInTheDocument()
      })
    })

    it('does not render payroll history component by default', async () => {
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Run payroll' })).toBeInTheDocument()
      })

      // Verify payroll history tab exists but is not selected
      expect(screen.getByRole('tab', { name: 'Payroll history' })).toHaveAttribute(
        'aria-selected',
        'false',
      )

      // Verify PayrollHistory content is not visible (should not see its heading)
      expect(screen.queryByRole('heading', { name: 'Payroll history' })).not.toBeInTheDocument()
    })
  })

  describe('tab navigation', () => {
    it('switches to payroll history component when tab is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Run payroll' })).toBeInTheDocument()
      })

      // Click on payroll history tab
      const payrollHistoryTab = screen.getByRole('tab', { name: 'Payroll history' })
      await user.click(payrollHistoryTab)

      // Check that payroll history tab is now selected
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Payroll history' })).toHaveAttribute(
          'aria-selected',
          'true',
        )
      })

      expect(screen.getByRole('tab', { name: 'Run payroll' })).toHaveAttribute(
        'aria-selected',
        'false',
      )

      // Verify PayrollHistory component content is now visible
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Payroll history' })).toBeInTheDocument()
      })
      expect(screen.queryByRole('heading', { name: 'Run payroll' })).not.toBeInTheDocument()
    })

    it('switches back to run payroll component when tab is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Run payroll' })).toBeInTheDocument()
      })

      // Switch to payroll history tab
      const payrollHistoryTab = screen.getByRole('tab', { name: 'Payroll history' })
      await user.click(payrollHistoryTab)

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Payroll history' })).toHaveAttribute(
          'aria-selected',
          'true',
        )
      })

      // Switch back to run payroll tab
      const runPayrollTab = screen.getByRole('tab', { name: 'Run payroll' })
      await user.click(runPayrollTab)

      // Check that run payroll tab is selected again
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Run payroll' })).toHaveAttribute(
          'aria-selected',
          'true',
        )
      })

      expect(screen.getByRole('tab', { name: 'Payroll history' })).toHaveAttribute(
        'aria-selected',
        'false',
      )

      // Verify PayrollList component content is visible again
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upcoming payroll' })).toBeInTheDocument()
      })
      expect(screen.queryByRole('heading', { name: 'Payroll history' })).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('renders with proper accessibility structure', async () => {
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Run payroll' })).toBeInTheDocument()
      })

      // Verify the component renders with proper tab structure
      expect(screen.getByRole('tab', { name: 'Run payroll' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Payroll history' })).toBeInTheDocument()
    })
  })

  describe('event handling', () => {
    it('renders child components with proper props', async () => {
      renderWithProviders(<PayrollLanding {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Run payroll' })).toBeInTheDocument()
      })

      // Verify PayrollList is rendered with data
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upcoming payroll' })).toBeInTheDocument()
      })

      // Verify both tabs are available, indicating child components are receiving proper props
      expect(screen.getByRole('tab', { name: 'Run payroll' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Payroll history' })).toBeInTheDocument()
    })
  })
})
