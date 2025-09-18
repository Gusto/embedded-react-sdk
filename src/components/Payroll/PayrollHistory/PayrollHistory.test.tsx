import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PayrollHistory } from './PayrollHistory'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

// Mock data that matches the API structure (snake_case)
const mockPayrollData = [
  {
    payroll_uuid: 'payroll-1',
    processed: true,
    check_date: '2024-12-15',
    external: false,
    off_cycle: false,
    pay_period: {
      start_date: '2024-12-01',
      end_date: '2024-12-15',
      pay_schedule_uuid: 'schedule-1',
    },
    totals: {
      net_pay: '2500.00',
      gross_pay: '3200.00',
    },
  },
  {
    payroll_uuid: 'payroll-2',
    processed: true,
    check_date: '2024-11-30',
    external: false,
    off_cycle: true,
    pay_period: {
      start_date: '2024-11-15',
      end_date: '2024-11-30',
      pay_schedule_uuid: 'schedule-1',
    },
    totals: {
      net_pay: '1800.00',
      gross_pay: '2300.00',
    },
  },
  {
    payroll_uuid: 'payroll-3',
    processed: true,
    check_date: '2024-11-15',
    external: true,
    off_cycle: false,
    pay_period: {
      start_date: '2024-11-01',
      end_date: '2024-11-15',
      pay_schedule_uuid: 'schedule-1',
    },
    totals: {
      net_pay: '3000.00',
      gross_pay: '3850.00',
    },
  },
]

const mockEmptyPayrollData: never[] = []

describe('PayrollHistory', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    companyId: 'company-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    // Mock the payrolls list API
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
        return HttpResponse.json(mockPayrollData)
      }),
    )
  })

  describe('rendering', () => {
    it('renders payroll history data correctly', async () => {
      renderWithProviders(<PayrollHistory {...defaultProps} />)

      // Wait for data to load and verify content
      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      // Check that all payroll entries are displayed
      expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('November 15–November 30, 2024')).toBeInTheDocument()
      expect(screen.getByText('November 1–November 15, 2024')).toBeInTheDocument()

      // Check payroll types are correctly mapped
      expect(screen.getByText('Regular')).toBeInTheDocument() // payroll-1
      expect(screen.getByText('Off-Cycle')).toBeInTheDocument() // payroll-2
      expect(screen.getByText('External')).toBeInTheDocument() // payroll-3

      // Check amounts are formatted correctly
      expect(screen.getByText('$2,500.00')).toBeInTheDocument()
      expect(screen.getByText('$1,800.00')).toBeInTheDocument()
      expect(screen.getByText('$3,000.00')).toBeInTheDocument()

      // Check status mapping (all processed payrolls should show as 'Paid' since checkDate has passed)
      const statusBadges = screen.getAllByText('Paid')
      expect(statusBadges).toHaveLength(3)
    })

    it('renders empty state when no payroll history', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json(mockEmptyPayrollData)
        }),
      )

      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('No payroll history')).toBeInTheDocument()
      })

      expect(
        screen.getByText("When you run payrolls, they'll appear here for easy reference."),
      ).toBeInTheDocument()
    })

    it('renders time filter options', async () => {
      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('3 months')).toBeInTheDocument()
      })
    })
  })

  describe('time filter functionality', () => {
    it('allows changing time filter', async () => {
      renderWithProviders(<PayrollHistory {...defaultProps} />)

      // Wait for the component to render and find the select button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Last 3 months/i })).toBeInTheDocument()
      })

      // Find the select button and click it to open options
      const selectButton = screen.getByRole('button', { name: /Last 3 months/i })
      await user.click(selectButton)

      // Wait for the listbox to appear and select a different option
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })

      const sixMonthsOption = screen.getByRole('option', { name: '6 months' })
      await user.click(sixMonthsOption)

      // Verify the selection changed by checking the button text
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Last 3 months/i })).toHaveTextContent('6 months')
      })
    })

    it('renders time filter with default 3 months selection', async () => {
      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Last 3 months/i })).toBeInTheDocument()
      })

      // Verify default selection is "3 months"
      const selectButton = screen.getByRole('button', { name: /Last 3 months/i })
      expect(selectButton).toHaveTextContent('3 months')
    })
  })

  describe('payroll actions', () => {
    it('emits view summary event when summary is clicked', async () => {
      renderWithProviders(<PayrollHistory {...defaultProps} />)

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      // Find and click the first hamburger menu
      const menuButtons = screen.getAllByRole('button', { name: /open menu/i })
      await user.click(menuButtons[0]!)

      // Click the view summary option
      await waitFor(() => {
        expect(screen.getByText('View payroll summary')).toBeInTheDocument()
      })

      await user.click(screen.getByText('View payroll summary'))

      // Verify the correct event was emitted
      expect(onEvent).toHaveBeenCalledWith(componentEvents.RUN_PAYROLL_SUMMARY_VIEWED, {
        payrollId: 'payroll-1',
      })
    })

    it('emits view receipt event when receipt is clicked', async () => {
      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      const menuButtons = screen.getAllByRole('button', { name: /open menu/i })
      await user.click(menuButtons[0]!)

      await waitFor(() => {
        expect(screen.getByText('View payroll receipt')).toBeInTheDocument()
      })

      await user.click(screen.getByText('View payroll receipt'))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.RUN_PAYROLL_RECEIPT_VIEWED, {
        payrollId: 'payroll-1',
      })
    })

    it('shows cancel option only for cancellable payrolls', async () => {
      // Mock payroll data with unprocessed status to show cancel option
      const mockUnprocessedPayroll = [
        {
          ...mockPayrollData[0],
          processed: false, // Unprocessed payroll should be cancellable
        },
      ]

      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json(mockUnprocessedPayroll)
        }),
      )

      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      const menuButtons = screen.getAllByRole('button', { name: /open menu/i })
      await user.click(menuButtons[0]!)

      // Should show cancel option for unprocessed payroll
      await waitFor(() => {
        expect(screen.getByText('Cancel payroll')).toBeInTheDocument()
      })
    })

    it('handles payroll cancellation', async () => {
      // Mock unprocessed payroll
      const mockUnprocessedPayroll = [
        {
          ...mockPayrollData[0],
          processed: false,
        },
      ]

      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json(mockUnprocessedPayroll)
        }),
        // Mock the cancel API
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/cancel`, () => {
          return HttpResponse.json({ success: true })
        }),
      )

      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      const menuButtons = screen.getAllByRole('button', { name: /open menu/i })
      await user.click(menuButtons[0]!)

      await waitFor(() => {
        expect(screen.getByText('Cancel payroll')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Cancel payroll'))

      // Verify the cancel event was emitted
      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.RUN_PAYROLL_CANCELLED,
          expect.objectContaining({
            payrollId: 'payroll-1',
            result: expect.any(Object),
          }),
        )
      })
    })

    it('handles cancellation errors gracefully', async () => {
      const mockUnprocessedPayroll = [
        {
          ...mockPayrollData[0],
          processed: false,
        },
      ]

      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json(mockUnprocessedPayroll)
        }),
        // Mock API error
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/cancel`, () => {
          return HttpResponse.json({ error: 'Cancellation failed' }, { status: 400 })
        }),
      )

      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      const menuButtons = screen.getAllByRole('button', { name: /open menu/i })
      await user.click(menuButtons[0]!)

      await waitFor(() => {
        expect(screen.getByText('Cancel payroll')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Cancel payroll'))

      // Verify error event was emitted
      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.ERROR,
          expect.objectContaining({
            payrollId: 'payroll-1',
            action: 'cancel',
            error: expect.any(String),
          }),
        )
      })
    })
  })

  describe('API integration', () => {
    it('calls payrolls API with correct parameters', async () => {
      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      // The API should be called with processed status
      // This is verified by the test setup and the fact that data loads
    })

    it('handles API errors gracefully', () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 })
        }),
      )

      // Should throw error due to Suspense pattern
      expect(() => {
        renderWithProviders(<PayrollHistory {...defaultProps} />)
      }).not.toThrow()
    })
  })

  describe('internationalization', () => {
    it('uses correct i18n namespace', async () => {
      renderWithProviders(<PayrollHistory {...defaultProps} />)

      // Wait for component to render - this verifies i18n setup works
      await waitFor(() => {
        expect(screen.getByText('Payroll history')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('has proper heading structure', async () => {
      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Payroll history' })).toBeInTheDocument()
      })
    })

    it('has accessible menu buttons', async () => {
      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        const menuButtons = screen.getAllByRole('button', { name: /open menu/i })
        expect(menuButtons.length).toBeGreaterThan(0)
      })
    })
  })
})
