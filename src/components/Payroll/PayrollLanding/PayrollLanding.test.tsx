import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PayrollLanding } from './PayrollLanding'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { getFixture } from '@/test/mocks/fixtures/getFixture'

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
    it('switches between tabs correctly', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollLanding {...defaultProps} />)

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
      expect(screen.getByRole('tab', { name: 'Run payroll' })).toHaveAttribute(
        'aria-selected',
        'false',
      )
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Payroll history' })).toBeInTheDocument()
      })

      // Switch back to run payroll tab
      const runPayrollTab = screen.getByRole('tab', { name: 'Run payroll' })
      await user.click(runPayrollTab)

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
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Upcoming payroll' })).toBeInTheDocument()
      })
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

  describe('receipt and summary navigation', () => {
    beforeEach(async () => {
      // Mock payroll history data
      const mockPayrollHistoryData = await getFixture('payroll-history-test-data')
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json(mockPayrollHistoryData)
        }),
      )
    })

    it('shows receipt when RUN_PAYROLL_RECEIPT_VIEWED event is emitted', async () => {
      const user = userEvent.setup()
      const mockReceiptData = await getFixture('payroll-receipt-test-data')
      server.use(
        http.get(`${API_BASE_URL}/v1/payrolls/:payroll_uuid/receipt`, () => {
          return HttpResponse.json(mockReceiptData)
        }),
      )

      renderWithProviders(<PayrollLanding {...defaultProps} />)

      // Switch to payroll history tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Payroll history' })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('tab', { name: 'Payroll history' }))

      // Wait for history to load
      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      // Click the menu button for the first payroll
      const menuButtons = screen.getAllByRole('button', { name: /open menu/i })
      await user.click(menuButtons[0]!)

      // Click "View payroll receipt"
      await waitFor(() => {
        expect(screen.getByText('View payroll receipt')).toBeInTheDocument()
      })
      await user.click(screen.getByText('View payroll receipt'))

      // Verify receipt is shown and tabs are hidden
      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument()
      })
      expect(screen.queryByRole('tab', { name: 'Run payroll' })).not.toBeInTheDocument()
      expect(screen.queryByRole('tab', { name: 'Payroll history' })).not.toBeInTheDocument()
    })

    it('shows summary when RUN_PAYROLL_SUMMARY_VIEWED event is emitted', async () => {
      const user = userEvent.setup()

      renderWithProviders(<PayrollLanding {...defaultProps} />)

      // Switch to payroll history tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Payroll history' })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('tab', { name: 'Payroll history' }))

      // Wait for history to load
      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      // Click the menu button for the first payroll
      const menuButtons = screen.getAllByRole('button', { name: /open menu/i })
      await user.click(menuButtons[0]!)

      // Click "View payroll summary"
      await waitFor(() => {
        expect(screen.getByText('View payroll summary')).toBeInTheDocument()
      })
      await user.click(screen.getByText('View payroll summary'))

      // Verify event was emitted and tabs are hidden
      expect(defaultProps.onEvent).toHaveBeenCalledWith(
        componentEvents.RUN_PAYROLL_SUMMARY_VIEWED,
        {
          payrollId: 'payroll-1',
        },
      )
      await waitFor(() => {
        expect(screen.queryByRole('tab', { name: 'Run payroll' })).not.toBeInTheDocument()
        expect(screen.queryByRole('tab', { name: 'Payroll history' })).not.toBeInTheDocument()
      })
    })

    it('returns to tabs when back button is clicked from receipt', async () => {
      const user = userEvent.setup()
      const mockReceiptData = await getFixture('payroll-receipt-test-data')
      server.use(
        http.get(`${API_BASE_URL}/v1/payrolls/:payroll_uuid/receipt`, () => {
          return HttpResponse.json(mockReceiptData)
        }),
      )

      renderWithProviders(<PayrollLanding {...defaultProps} />)

      // Navigate to receipt
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Payroll history' })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('tab', { name: 'Payroll history' }))

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      const menuButtons = screen.getAllByRole('button', { name: /open menu/i })
      await user.click(menuButtons[0]!)

      await waitFor(() => {
        expect(screen.getByText('View payroll receipt')).toBeInTheDocument()
      })
      await user.click(screen.getByText('View payroll receipt'))

      // Wait for receipt to show
      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument()
      })

      // Click back button
      await user.click(screen.getByText('Back'))

      // Verify tabs are shown again
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Run payroll' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Payroll history' })).toBeInTheDocument()
      })

      // Verify we're on the payroll history tab and can see the list
      expect(screen.getByRole('tab', { name: 'Payroll history' })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })
    })

    it('emits events correctly through the wrapper', async () => {
      const user = userEvent.setup()

      renderWithProviders(<PayrollLanding {...defaultProps} />)

      // Switch to payroll history tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Payroll history' })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('tab', { name: 'Payroll history' }))

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      // Click menu and view receipt
      const menuButtons = screen.getAllByRole('button', { name: /open menu/i })
      await user.click(menuButtons[0]!)

      await waitFor(() => {
        expect(screen.getByText('View payroll receipt')).toBeInTheDocument()
      })
      await user.click(screen.getByText('View payroll receipt'))

      // Verify the event was emitted to parent
      expect(defaultProps.onEvent).toHaveBeenCalledWith(
        componentEvents.RUN_PAYROLL_RECEIPT_VIEWED,
        { payrollId: 'payroll-1' },
      )
    })
  })
})
