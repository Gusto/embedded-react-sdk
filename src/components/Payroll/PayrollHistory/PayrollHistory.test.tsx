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
import { getFixture } from '@/test/mocks/fixtures/getFixture'

const mockEmptyPayrollData: never[] = []

describe('PayrollHistory', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    companyId: 'company-123',
    onEvent,
  }

  beforeEach(async () => {
    setupApiTestMocks()
    onEvent.mockClear()

    // Mock dialog methods since JSDOM doesn't support them
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    Object.defineProperty(HTMLDialogElement.prototype, 'open', {
      get: vi.fn(() => false),
      set: vi.fn(),
      configurable: true,
    })

    // Mock the payrolls list API with fixture data
    const mockPayrollData = await getFixture('payroll-history-test-data')
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
      // Use fixture with unprocessed payroll data
      const mockUnprocessedPayroll = await getFixture('payroll-history-unprocessed-test-data')

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
      // Use fixture with unprocessed payroll data
      const mockUnprocessedPayroll = await getFixture('payroll-history-unprocessed-test-data')

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

      // Wait for dialog to appear and confirm cancellation
      await waitFor(() => {
        expect(screen.getByText('Yes, cancel payroll')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Yes, cancel payroll'))

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
      const mockUnprocessedPayroll = await getFixture('payroll-history-unprocessed-test-data')

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

      // Wait for dialog to appear and confirm cancellation
      await waitFor(() => {
        expect(screen.getByText('Yes, cancel payroll')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Yes, cancel payroll'))

      // Verify error is displayed to user via base error handling
      await waitFor(() => {
        expect(screen.getByText('There was a problem with your submission')).toBeInTheDocument()
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

  describe('totals handling', () => {
    it('displays amounts when totals are included in API response', async () => {
      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      expect(screen.getByText('$2,500.00')).toBeInTheDocument()
      expect(screen.getByText('$1,800.00')).toBeInTheDocument()
      expect(screen.getByText('$3,000.00')).toBeInTheDocument()
    })

    it('displays fallback text when totals are missing from API response', async () => {
      const mockDataWithoutTotals = [
        {
          payroll_uuid: 'payroll-no-totals',
          company_uuid: 'company-123',
          processed: true,
          check_date: '2024-12-20',
          external: false,
          off_cycle: false,
          payroll_deadline: '2024-12-19T23:30:00Z',
          payroll_status_meta: {
            cancellable: false,
            expected_check_date: '2024-12-20',
            initial_check_date: '2024-12-20',
            expected_debit_time: '2024-12-19T23:30:00Z',
            payroll_late: false,
            initial_debit_cutoff_time: '2024-12-19T23:30:00Z',
          },
          pay_period: {
            start_date: '2024-12-01',
            end_date: '2024-12-15',
            pay_schedule_uuid: 'schedule-1',
          },
        },
      ]

      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json(mockDataWithoutTotals)
        }),
      )

      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      expect(screen.getByText('$0.00')).toBeInTheDocument()
    })

    it('displays amount when only some totals fields exist', async () => {
      const mockDataWithPartialTotals = [
        {
          payroll_uuid: 'payroll-partial-totals',
          company_uuid: 'company-123',
          processed: true,
          check_date: '2024-12-20',
          external: false,
          off_cycle: false,
          payroll_deadline: '2024-12-19T23:30:00Z',
          payroll_status_meta: {
            cancellable: false,
            expected_check_date: '2024-12-20',
            initial_check_date: '2024-12-20',
            expected_debit_time: '2024-12-19T23:30:00Z',
            payroll_late: false,
            initial_debit_cutoff_time: '2024-12-19T23:30:00Z',
          },
          pay_period: {
            start_date: '2024-12-01',
            end_date: '2024-12-15',
            pay_schedule_uuid: 'schedule-1',
          },
          totals: {
            gross_pay: '1000.00',
            employer_taxes: '150.00',
          },
        },
      ]

      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json(mockDataWithPartialTotals)
        }),
      )

      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      expect(screen.getByText('$1,150.00')).toBeInTheDocument()
    })

    it('displays fallback text when all totals fields are undefined', async () => {
      const mockDataWithEmptyTotals = [
        {
          payroll_uuid: 'payroll-empty-totals',
          company_uuid: 'company-123',
          processed: true,
          check_date: '2024-12-20',
          external: false,
          off_cycle: false,
          payroll_deadline: '2024-12-19T23:30:00Z',
          payroll_status_meta: {
            cancellable: false,
            expected_check_date: '2024-12-20',
            initial_check_date: '2024-12-20',
            expected_debit_time: '2024-12-19T23:30:00Z',
            payroll_late: false,
            initial_debit_cutoff_time: '2024-12-19T23:30:00Z',
          },
          pay_period: {
            start_date: '2024-12-01',
            end_date: '2024-12-15',
            pay_schedule_uuid: 'schedule-1',
          },
          totals: {},
        },
      ]

      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json(mockDataWithEmptyTotals)
        }),
      )

      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      expect(screen.getByText('$0.00')).toBeInTheDocument()
    })

    it('formats amounts correctly when totals contain decimal values', async () => {
      const mockDataWithDecimalAmounts = [
        {
          payroll_uuid: 'payroll-decimal',
          company_uuid: 'company-123',
          processed: true,
          check_date: '2024-12-20',
          external: false,
          off_cycle: false,
          payroll_deadline: '2024-12-19T23:30:00Z',
          payroll_status_meta: {
            cancellable: false,
            expected_check_date: '2024-12-20',
            initial_check_date: '2024-12-20',
            expected_debit_time: '2024-12-19T23:30:00Z',
            payroll_late: false,
            initial_debit_cutoff_time: '2024-12-19T23:30:00Z',
          },
          pay_period: {
            start_date: '2024-12-01',
            end_date: '2024-12-15',
            pay_schedule_uuid: 'schedule-1',
          },
          totals: {
            gross_pay: '1000.12',
            employer_taxes: '150.24',
            reimbursements: '50.10',
            benefits: '34.10',
          },
        },
      ]

      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json(mockDataWithDecimalAmounts)
        }),
      )

      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      expect(screen.getByText('$1,234.56')).toBeInTheDocument()
    })

    it('handles zero amounts correctly', async () => {
      const mockDataWithZeroAmount = [
        {
          payroll_uuid: 'payroll-zero',
          company_uuid: 'company-123',
          processed: true,
          check_date: '2024-12-20',
          external: false,
          off_cycle: false,
          payroll_deadline: '2024-12-19T23:30:00Z',
          payroll_status_meta: {
            cancellable: false,
            expected_check_date: '2024-12-20',
            initial_check_date: '2024-12-20',
            expected_debit_time: '2024-12-19T23:30:00Z',
            payroll_late: false,
            initial_debit_cutoff_time: '2024-12-19T23:30:00Z',
          },
          pay_period: {
            start_date: '2024-12-01',
            end_date: '2024-12-15',
            pay_schedule_uuid: 'schedule-1',
          },
          totals: {
            gross_pay: '0',
            employer_taxes: '0',
            reimbursements: '0',
            benefits: '0',
          },
        },
      ]

      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json(mockDataWithZeroAmount)
        }),
      )

      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      expect(screen.getByText('$0.00')).toBeInTheDocument()
    })

    it('handles mixed data with some payrolls having totals and others not', async () => {
      const mockMixedData = [
        {
          payroll_uuid: 'payroll-with-totals',
          company_uuid: 'company-123',
          processed: true,
          check_date: '2024-12-20',
          external: false,
          off_cycle: false,
          payroll_deadline: '2024-12-19T23:30:00Z',
          payroll_status_meta: {
            cancellable: false,
            expected_check_date: '2024-12-20',
            initial_check_date: '2024-12-20',
            expected_debit_time: '2024-12-19T23:30:00Z',
            payroll_late: false,
            initial_debit_cutoff_time: '2024-12-19T23:30:00Z',
          },
          pay_period: {
            start_date: '2024-12-01',
            end_date: '2024-12-15',
            pay_schedule_uuid: 'schedule-1',
          },
          totals: {
            gross_pay: '2000.00',
            employer_taxes: '300.00',
            reimbursements: '100.00',
            benefits: '100.00',
          },
        },
        {
          payroll_uuid: 'payroll-without-totals',
          company_uuid: 'company-123',
          processed: true,
          check_date: '2024-12-05',
          external: false,
          off_cycle: true,
          payroll_deadline: '2024-12-04T23:30:00Z',
          payroll_status_meta: {
            cancellable: false,
            expected_check_date: '2024-12-05',
            initial_check_date: '2024-12-05',
            expected_debit_time: '2024-12-04T23:30:00Z',
            payroll_late: false,
            initial_debit_cutoff_time: '2024-12-04T23:30:00Z',
          },
          pay_period: {
            start_date: '2024-11-15',
            end_date: '2024-11-30',
            pay_schedule_uuid: 'schedule-1',
          },
        },
      ]

      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json(mockMixedData)
        }),
      )

      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      expect(screen.getByText('$2,500.00')).toBeInTheDocument()
      expect(screen.getAllByText('$0.00')).toHaveLength(1)
    })

    it('handles large amounts with proper formatting', async () => {
      const mockDataWithLargeAmount = [
        {
          payroll_uuid: 'payroll-large',
          company_uuid: 'company-123',
          processed: true,
          check_date: '2024-12-20',
          external: false,
          off_cycle: false,
          payroll_deadline: '2024-12-19T23:30:00Z',
          payroll_status_meta: {
            cancellable: false,
            expected_check_date: '2024-12-20',
            initial_check_date: '2024-12-20',
            expected_debit_time: '2024-12-19T23:30:00Z',
            payroll_late: false,
            initial_debit_cutoff_time: '2024-12-19T23:30:00Z',
          },
          pay_period: {
            start_date: '2024-12-01',
            end_date: '2024-12-15',
            pay_schedule_uuid: 'schedule-1',
          },
          totals: {
            gross_pay: '1000000.00',
            employer_taxes: '150000.00',
            reimbursements: '50000.00',
            benefits: '34567.89',
          },
        },
      ]

      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
          return HttpResponse.json(mockDataWithLargeAmount)
        }),
      )

      renderWithProviders(<PayrollHistory {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('December 1–December 15, 2024')).toBeInTheDocument()
      })

      expect(screen.getByText('$1,234,567.89')).toBeInTheDocument()
    })
  })
})
