import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { PayrollConfiguration } from './PayrollConfiguration'
import {
  createEmployee,
  createCompensation,
  page1Employees,
  allEmployees,
  allCompensations,
  mockPayrollData,
  buildPayrollData,
  buildPayrollConfigurationHandlers,
} from './__fixtures__/payrollConfigurationMocks'
import { server } from '@/test/mocks/server'
import { getCompanyBankAccounts } from '@/test/mocks/apis/company_bank_accounts'
import { getPaymentConfigs } from '@/test/mocks/apis/company'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

describe('PayrollConfiguration', () => {
  const onEvent = vi.fn()
  const defaultProps = {
    companyId: 'company-123',
    payrollId: 'payroll-uuid-1',
    onEvent,
  }

  let currentPayrollData = mockPayrollData

  beforeEach(() => {
    onEvent.mockClear()
    currentPayrollData = mockPayrollData

    server.use(...buildPayrollConfigurationHandlers({ getPayrollData: () => currentPayrollData }))
  })

  describe('initial render', () => {
    it('renders employee data correctly on initial load', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      expect(screen.getByText('Bob Baker')).toBeInTheDocument()
    })

    it('displays the payroll configuration page title', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })
    })

    it('shows calculate payroll button', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument()
      })
    })

    it('applies custom className', async () => {
      const { container } = renderWithProviders(
        <PayrollConfiguration {...defaultProps} className="custom-class" />,
      )

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('already processed payroll', () => {
    const alreadyProcessedResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(
        {
          errors: [
            {
              error_key: 'base',
              category: 'invalid_operation',
              message:
                'This payroll has already been processed. Its data cannot be updated or altered.',
            },
          ],
        },
        { status: 422 },
      ),
    )

    beforeEach(() => {
      alreadyProcessedResolver.mockClear()
      currentPayrollData = {
        ...mockPayrollData,
        processed: true,
        payroll_deadline: '2027-01-01T17:00:00-08:00',
        employee_compensations: allEmployees.map(emp => ({
          ...createCompensation(emp.uuid),
          first_name: emp.first_name,
          last_name: emp.last_name,
        })),
      }
      server.use(
        http.put(
          `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`,
          alreadyProcessedResolver,
        ),
        getCompanyBankAccounts,
        getPaymentConfigs,
      )
    })

    it('does not retry the terminal already-processed error', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            "This payroll is already processed. If you'd like to make changes, please cancel and re-run it.",
          ),
        ).toBeInTheDocument()
      })
      expect(alreadyProcessedResolver).toHaveBeenCalledTimes(1)
    })

    it('delegates to the read-only payroll overview with a cancel action', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            "This payroll is already processed. If you'd like to make changes, please cancel and re-run it.",
          ),
        ).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: /cancel payroll/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /calculate/i })).not.toBeInTheDocument()
    })

    it('returns to the configuration table after cancelling', async () => {
      const user = userEvent.setup()
      let isCancelled = false

      server.use(
        http.put(
          `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`,
          async ({ request }) => {
            if (!isCancelled) {
              return HttpResponse.json(
                {
                  errors: [
                    {
                      error_key: 'base',
                      category: 'invalid_operation',
                      message: 'This payroll has already been processed.',
                    },
                  ],
                },
                { status: 422 },
              )
            }
            const body = (await request.json()) as { employee_uuids?: string[] } | null
            const employeeUuids = body?.employee_uuids
            const filteredCompensations = employeeUuids?.length
              ? allCompensations.filter(comp => employeeUuids.includes(comp.employee_uuid))
              : allCompensations
            return HttpResponse.json({
              ...mockPayrollData,
              employee_compensations: filteredCompensations,
            })
          },
        ),
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/cancel`, () => {
          isCancelled = true
          return HttpResponse.json({ success: true })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel payroll/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /cancel payroll/i }))

      await waitFor(() => {
        expect(screen.getByText(/your changes will be saved/i)).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /yes, cancel payroll/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument()
      })
      expect(screen.queryByRole('button', { name: /cancel payroll/i })).not.toBeInTheDocument()
    })

    it('emits runPayroll/alreadyProcessed once', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          'runPayroll/alreadyProcessed',
          expect.objectContaining({ payrollId: 'payroll-uuid-1' }),
        )
      })
      expect(onEvent).toHaveBeenCalledTimes(1)
    })
  })

  describe('pagination', () => {
    it('shows pagination controls when there are multiple pages', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('pagination-next')
      expect(nextButton).toBeInTheDocument()
    })

    it('clicking next page shows different employees', async () => {
      const user = userEvent.setup()

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })
      expect(screen.getByText('Yara Young')).toBeInTheDocument()
      expect(screen.queryByText('Kate King')).not.toBeInTheDocument()

      const nextButton = screen.getByTestId('pagination-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Kate King')).toBeInTheDocument()
      })
      expect(screen.getByText('Leo Lewis')).toBeInTheDocument()
      expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument()
    })

    it('clicking previous page returns to prior data', async () => {
      const user = userEvent.setup()

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      const nextButton = screen.getByTestId('pagination-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Kate King')).toBeInTheDocument()
      })

      const prevButton = screen.getByTestId('pagination-previous')
      await user.click(prevButton)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })
      expect(screen.getByText('Bob Baker')).toBeInTheDocument()
    })

    it('employee compensations stay in sync with employee details across page changes', async () => {
      const user = userEvent.setup()

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })
      expect(screen.getByText('Yara Young')).toBeInTheDocument()

      const nextButton = screen.getByTestId('pagination-next')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Kate King')).toBeInTheDocument()
      })
      expect(screen.getByText('Leo Lewis')).toBeInTheDocument()
      expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument()
      expect(screen.queryByText('Yara Young')).not.toBeInTheDocument()
    })
  })

  describe('late payroll banner', () => {
    it('shows late payroll warning banner when payroll is late', async () => {
      currentPayrollData = {
        ...mockPayrollData,
        check_date: '2024-12-05',
        payroll_status_meta: {
          cancellable: true,
          payroll_late: true,
          initial_check_date: '2024-12-05',
          expected_check_date: '2025-01-21',
          expected_debit_time: '2025-01-16T16:00:00-08:00',
          initial_debit_cutoff_time: '2024-12-02T16:00:00-08:00',
        },
      }

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/Your original pay date was/i)).toBeInTheDocument()
      })

      expect(screen.getByText(/Run payroll before/i)).toBeInTheDocument()
    })

    it('does not show late payroll banner when payroll is not late', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      expect(screen.queryByText(/Your original pay date was/i)).not.toBeInTheDocument()
    })

    it('shows only late banner and hides deadline notice when payroll is late', async () => {
      currentPayrollData = {
        ...mockPayrollData,
        check_date: '2024-12-05',
        payroll_status_meta: {
          cancellable: true,
          payroll_late: true,
          initial_check_date: '2024-12-05',
          expected_check_date: '2025-01-21',
          expected_debit_time: '2025-01-16T16:00:00-08:00',
          initial_debit_cutoff_time: '2024-12-02T16:00:00-08:00',
        },
      }

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/Your original pay date was/i)).toBeInTheDocument()
      })

      expect(
        screen.queryByText(/To pay your employees with direct deposit by/i),
      ).not.toBeInTheDocument()
    })
  })

  describe('deadline banner', () => {
    it('shows deadline banner regardless of payment method', async () => {
      currentPayrollData = {
        ...mockPayrollData,
        employee_compensations: allCompensations.map(comp => ({
          ...comp,
          payment_method: 'Check',
        })),
      }

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      expect(screen.getByText(/To pay your employees with direct deposit by/i)).toBeInTheDocument()
    })
  })

  describe('calculate and polling', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      currentPayrollData = {
        ...mockPayrollData,
        calculated_at: null,
        processing_request: null,
      }
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('fires RUN_PAYROLL_CALCULATED when polling detects calculate_success', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = {
            ...mockPayrollData,
            calculated_at: new Date().toISOString(),
            processing_request: { status: 'calculate_success', errors: [] },
          }
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      const calculateButton = screen.getByRole('button', { name: /calculate/i })
      await user.click(calculateButton)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(6_000)
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          'runPayroll/calculated',
          expect.objectContaining({ payrollId: 'payroll-uuid-1' }),
        )
      })
    })

    it('fires RUN_PAYROLL_CALCULATED when calculatedAt is set with null processingRequest', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = {
            ...mockPayrollData,
            calculated_at: new Date().toISOString(),
            processing_request: null,
          }
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      const calculateButton = screen.getByRole('button', { name: /calculate/i })
      await user.click(calculateButton)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(6_000)
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          'runPayroll/calculated',
          expect.objectContaining({ payrollId: 'payroll-uuid-1' }),
        )
      })
    })

    it('fires RUN_PAYROLL_PROCESSING_FAILED when polling detects processing_failed', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = {
            ...mockPayrollData,
            calculated_at: null,
            processing_request: { status: 'processing_failed', errors: [] },
          }
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      const calculateButton = screen.getByRole('button', { name: /calculate/i })
      await user.click(calculateButton)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(6_000)
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith('runPayroll/processingFailed')
      })
      expect(
        screen.getByText("This payroll couldn't be calculated. Please try calculating again."),
      ).toBeInTheDocument()
    })

    it('fires RUN_PAYROLL_PROCESSING_FAILED on polling timeout', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = {
            ...mockPayrollData,
            calculated_at: null,
            processing_request: { status: 'calculating', errors: [] },
          }
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      const calculateButton = screen.getByRole('button', { name: /calculate/i })
      await user.click(calculateButton)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3 * 60 * 1000 + 1_000)
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith('runPayroll/processingFailed')
      })
    })

    it('keeps reporting the deadline while the payroll stays in calculating', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = {
            ...mockPayrollData,
            calculated_at: null,
            processing_request: { status: 'calculating', errors: [] },
          }
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /calculate/i }))

      // A payroll the server never moves off `calculating` is picked back up by the
      // start-on-calculating effect after each deadline, so the failure is reported once per
      // window rather than latching after the first. This is the repeated-failsafe shape seen in
      // production; the deadline no longer lies about the outcome, but it does keep retrying.
      //
      // Jumping the mocked clock past the deadline -- rather than ticking through all ~36 real
      // 5s intervals to get there -- means the very next scheduled poll read sees a stale clock
      // and reports the deadline immediately, without changing what's under test.
      await act(async () => {
        vi.setSystemTime(Date.now() + 3 * 60 * 1000 + 10_000)
        await vi.advanceTimersByTimeAsync(6_000)
      })
      expect(
        onEvent.mock.calls.filter(([eventType]) => eventType === 'runPayroll/processingFailed'),
      ).toHaveLength(1)

      await act(async () => {
        vi.setSystemTime(Date.now() + 3 * 60 * 1000 + 10_000)
        await vi.advanceTimersByTimeAsync(6_000)
      })
      expect(
        onEvent.mock.calls.filter(([eventType]) => eventType === 'runPayroll/processingFailed'),
      ).toHaveLength(2)
    })

    it('clears the stale failure alert and shows the calculating loader once a fresh calculating status is picked back up after a deadline', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = {
            ...mockPayrollData,
            calculated_at: null,
            processing_request: { status: 'calculating', errors: [] },
          }
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /calculate/i }))

      // Same deadline jump as the test above -- the payroll is still `calculating` server-side,
      // so the deadline reports a failure and the start-on-calculating effect immediately picks
      // the still-running calculation back up.
      await act(async () => {
        vi.setSystemTime(Date.now() + 3 * 60 * 1000 + 10_000)
        await vi.advanceTimersByTimeAsync(6_000)
      })

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Calculating payroll...' })).toBeInTheDocument()
      })
      expect(screen.queryByText(/couldn't be calculated/i)).toBeNull()
    })

    it('recovers to a retryable state when calculate itself fails (SDK-1276)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () =>
          HttpResponse.json({ message: 'conflict' }, { status: 409 }),
        ),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      const calculateButton = screen.getByRole('button', { name: /calculate/i })
      await user.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText(/There was a problem with your submission/i)).toBeInTheDocument()
      })

      // Before the fix, hasSeenCalculatingRef never reset on this path, so the component stayed
      // on the "Calculating..." loading view forever -- the Calculate button never came back.
      expect(await screen.findByRole('button', { name: /calculate/i })).toBeEnabled()
    })

    it('recovers from a transient read failure mid-poll', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      let hasCalculated = false
      let hasFailedOnce = false

      server.use(
        // Listed before the payroll route below, which would otherwise match
        // `/payrolls/blockers` via its `:payroll_id` segment.
        http.get(`${API_BASE_URL}/v1/companies/:company_uuid/payrolls/blockers`, () => {
          return HttpResponse.json([])
        }),
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, () => {
          // Fail exactly one read, and only once polling is underway.
          if (hasCalculated && !hasFailedOnce) {
            hasFailedOnce = true
            return new HttpResponse(null, { status: 500 })
          }
          return HttpResponse.json(currentPayrollData)
        }),
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = {
            ...mockPayrollData,
            calculated_at: new Date().toISOString(),
            processing_request: { status: 'calculate_success', errors: [] },
          }
          hasCalculated = true
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /calculate/i }))

      await act(async () => {
        await vi.advanceTimersByTimeAsync(15_000)
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          'runPayroll/calculated',
          expect.objectContaining({ payrollId: 'payroll-uuid-1' }),
        )
      })
    })

    it('continues polling when calculate_success but calculatedAt is null (SDK-595)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = {
            ...mockPayrollData,
            calculated_at: null,
            processing_request: { status: 'calculate_success', errors: [] },
          }
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      const calculateButton = screen.getByRole('button', { name: /calculate/i })
      await user.click(calculateButton)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(6_000)
      })

      expect(onEvent).not.toHaveBeenCalledWith('runPayroll/calculated', expect.anything())
    })

    it('does not fire RUN_PAYROLL_CALCULATED with stale data when re-calculating a previously calculated payroll', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      const firstCalculatedAt = '2025-08-10T12:00:00Z'
      const newCalculatedAt = '2025-08-10T14:00:00Z'

      currentPayrollData = {
        ...mockPayrollData,
        calculated_at: firstCalculatedAt,
        processing_request: null,
      }

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      const calculateButton = screen.getByRole('button', { name: /calculate/i })
      await user.click(calculateButton)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(6_000)
      })

      expect(onEvent).not.toHaveBeenCalledWith('runPayroll/calculated', expect.anything())

      currentPayrollData = {
        ...mockPayrollData,
        calculated_at: newCalculatedAt,
        processing_request: { status: 'calculate_success', errors: [] },
      }

      await act(async () => {
        await vi.advanceTimersByTimeAsync(6_000)
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          'runPayroll/calculated',
          expect.objectContaining({ payrollId: 'payroll-uuid-1' }),
        )
      })
    })

    it('does not make prepare calls while polling', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      let prepareCallCount = 0

      server.use(
        http.put(
          `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`,
          async ({ request }) => {
            prepareCallCount++
            const body = (await request.json()) as { employee_uuids?: string[] } | null
            const employeeUuids = body?.employee_uuids

            if (employeeUuids && employeeUuids.length > 0) {
              const filteredCompensations = allCompensations.filter(comp =>
                employeeUuids.includes(comp.employee_uuid),
              )
              return HttpResponse.json({
                ...currentPayrollData,
                employee_compensations: filteredCompensations,
              })
            }

            return HttpResponse.json(currentPayrollData)
          },
        ),
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = {
            ...mockPayrollData,
            calculated_at: null,
            processing_request: { status: 'calculating', errors: [] },
          }
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      const prepareCountBeforeCalculate = prepareCallCount

      const calculateButton = screen.getByRole('button', { name: /calculate/i })
      await user.click(calculateButton)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(15_000)
      })

      expect(prepareCallCount).toBe(prepareCountBeforeCalculate)
    })

    it('advances instead of reporting failure when the deadline is reached on a calculated payroll', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      // The calculation succeeded server-side, but nothing the poll reads ever looks like a *new*
      // calculation, so the task runs all the way to its deadline. The server was right the whole
      // time — reporting a failure here is what falsely failed real payrolls.
      currentPayrollData = {
        ...mockPayrollData,
        calculated_at: '2025-08-10T12:00:00Z',
        processing_request: { status: 'calculate_success', errors: [] },
      }

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /calculate/i }))

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3 * 60 * 1000 + 10_000)
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          'runPayroll/calculated',
          expect.objectContaining({ payrollId: 'payroll-uuid-1' }),
        )
      })
      expect(onEvent).not.toHaveBeenCalledWith('runPayroll/processingFailed')
    })

    it('advances instead of reporting failure when a non-retryable error follows a same-tick calculated read', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      let showCallCount = 0

      currentPayrollData = {
        ...mockPayrollData,
        calculated_at: '2025-08-10T12:00:00Z',
        processing_request: { status: 'calculate_success', errors: [] },
      }

      server.use(
        // Literal payroll_id segment -- `:payroll_id` would also match `/payrolls/blockers` and
        // shadow its handler.
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls/payroll-uuid-1`, () => {
          showCallCount++
          // First two reads match baseline exactly, so the freshness check reports 'polling' not
          // 'calculated'; the third 401s and must rescue that snapshot instead of a false failure.
          if (showCallCount > 2) {
            return new HttpResponse(null, { status: 401 })
          }
          return HttpResponse.json(currentPayrollData)
        }),
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /calculate/i }))

      await act(async () => {
        await vi.advanceTimersByTimeAsync(6_000)
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          'runPayroll/calculated',
          expect.objectContaining({ payrollId: 'payroll-uuid-1' }),
        )
      })
      expect(onEvent).not.toHaveBeenCalledWith('runPayroll/processingFailed')
    })

    // Guardrail for the SDK-1231 gate: prepare resets a calculation, so reaching the poll
    // deadline must not re-enable it while a good calculation exists.
    it('keeps prepare gated after the poll deadline', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const prepareResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json(currentPayrollData),
      )

      currentPayrollData = {
        ...mockPayrollData,
        calculated_at: '2025-08-10T12:00:00Z',
        processing_request: { status: 'calculate_success', errors: [] },
      }

      server.use(
        http.put(
          `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`,
          prepareResolver,
        ),
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /calculate/i }))
      const prepareCallsBeforeDeadline = prepareResolver.mock.calls.length

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3 * 60 * 1000 + 30_000)
      })

      expect(prepareResolver).toHaveBeenCalledTimes(prepareCallsBeforeDeadline)
    })

    it('fires RUN_PAYROLL_CALCULATED exactly once for a single calculation', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = {
            ...mockPayrollData,
            calculated_at: new Date().toISOString(),
            processing_request: { status: 'calculate_success', errors: [] },
          }
          return new HttpResponse(null, { status: 202 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /calculate/i }))

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3 * 60 * 1000 + 30_000)
      })

      const calculatedEvents = onEvent.mock.calls.filter(
        ([eventType]) => eventType === 'runPayroll/calculated',
      )
      expect(calculatedEvents).toHaveLength(1)
    })

    it('reports nothing after the component unmounts mid-calculation', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = {
            ...mockPayrollData,
            calculated_at: null,
            processing_request: { status: 'calculating', errors: [] },
          }
          return new HttpResponse(null, { status: 202 })
        }),
      )

      const { unmount } = renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /calculate/i }))
      unmount()
      onEvent.mockClear()

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3 * 60 * 1000 + 30_000)
      })

      expect(onEvent).not.toHaveBeenCalled()
    })

    it('does not spin re-arming the poll after a non-retryable read error leaves the payroll reading stale calculating data (SDK-1319 review)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      let showCallCount = 0

      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = {
            ...mockPayrollData,
            calculated_at: null,
            processing_request: { status: 'calculating', errors: [] },
          }
          return new HttpResponse(null, { status: 202 })
        }),
        // Literal payroll_id segment -- `:payroll_id` would also match `/payrolls/blockers` and
        // shadow its handler.
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls/payroll-uuid-1`, () => {
          showCallCount++
          // Call 1 is the initial suspense read; call 2 is the poll's first tick -- both report
          // `calculating`, so the poll survives onto a real `setTimeout`-scheduled interval, same
          // as it would against a live server. Call 3 (the next tick) 401s -- a non-retryable,
          // terminal read failure, leaving the query's cached data stuck reporting `calculating`
          // (the last successful read) with no way to change on its own.
          if (showCallCount <= 2) {
            return HttpResponse.json(currentPayrollData)
          }
          return new HttpResponse(null, { status: 401 })
        }),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /calculate/i }))

      // Settle the calculate call and the poll's first tick (which reports `calculating`) in
      // their own `act` before advancing to the next tick -- otherwise fake timers can fast
      // forward through the whole click-to-failure sequence in one flush, collapsing the
      // intermediate `isPolling: true` render this test depends on to reproduce a real,
      // separately-committed `isPolling: true -> false` transition.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0)
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5_000)
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith('runPayroll/processingFailed')
      })

      const callCountAfterFirstFailure = showCallCount

      // Before the fix, isPolling flipping back to false re-triggered the auto-pickup effect
      // against the same stale `calculating` snapshot, which failed and flipped isPolling again
      // -- a tight spin of reads and RUN_PAYROLL_PROCESSING_FAILED events instead of stopping.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(15_000)
      })

      expect(showCallCount).toBe(callCountAfterFirstFailure)
      expect(
        onEvent.mock.calls.filter(([eventType]) => eventType === 'runPayroll/processingFailed'),
      ).toHaveLength(1)
    })

    it('does not get stuck on the calculating loader after an unrelated submit clears the error following a non-retryable read failure (SDK-1319 review)', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      let showCallCount = 0

      currentPayrollData = buildPayrollData({
        calculatedAt: null,
        processingRequest: null,
        employeeCompensations: [createCompensation('emp-1')],
      })

      server.use(
        ...buildPayrollConfigurationHandlers({
          getPayrollData: () => currentPayrollData,
          employees: [createEmployee('emp-1', 'Alice', 'Anderson')],
        }),
      )

      // A later `server.use` call's handlers take priority as a whole batch over an earlier
      // call's, regardless of order within either array -- registering these separately (rather
      // than appending them to the array above) is what lets the literal-path GET below actually
      // shadow the generic `:payroll_id` GET already registered above.
      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = buildPayrollData({
            calculatedAt: null,
            processingRequest: { status: 'calculating', errors: [] },
            employeeCompensations: [createCompensation('emp-1')],
          })
          return new HttpResponse(null, { status: 202 })
        }),
        // Literal payroll_id segment -- `:payroll_id` would also match `/payrolls/blockers` and
        // shadow its handler.
        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls/payroll-uuid-1`, () => {
          showCallCount++
          if (showCallCount <= 2) {
            return HttpResponse.json(currentPayrollData)
          }
          return new HttpResponse(null, { status: 401 })
        }),
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, () =>
          HttpResponse.json(currentPayrollData),
        ),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /calculate/i }))

      await act(async () => {
        await vi.advanceTimersByTimeAsync(0)
      })
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5_000)
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith('runPayroll/processingFailed')
      })
      expect(
        screen.getByText("This payroll couldn't be calculated. Please try calculating again."),
      ).toBeInTheDocument()

      // Before the fix, `isCalculatingActive` was gated on `error` from `useBase()`. Any
      // unrelated submit clears that error as its first step (`baseSubmitHandler`), which
      // reopened the gate with no poll running to ever close it again -- the same "stuck on the
      // loading view forever" failure as SDK-1276, just reachable from a different trigger.
      await user.click(screen.getByRole('button', { name: 'Edit' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Skip employee' }))

      expect(screen.queryByRole('heading', { name: 'Calculating payroll...' })).toBeNull()
      expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      // The unrelated submit clears `error` too (as `baseSubmitHandler`'s first step), so the
      // alert itself disappears here even though `hasProcessingFailedAlert` -- the separate flag
      // that keeps the loader gate closed -- stays true. Documenting that trade-off rather than
      // leaving it to be discovered: the pre-fix boolean kept the alert visible through unrelated
      // submits; this doesn't.
      expect(screen.queryByText(/couldn't be calculated/i)).toBeNull()
    })
  })

  describe('excluded employees', () => {
    it('shows excluded employees that are missing from the employee list API', async () => {
      const excludedEmployee = createEmployee('emp-excluded', 'Skipped', 'Person')
      const excludedCompensation = {
        ...createCompensation('emp-excluded'),
        excluded: true,
        gross_pay: '0',
        net_pay: '0',
      }

      const payrollDataWithExcluded = {
        ...mockPayrollData,
        employee_compensations: [...allCompensations, excludedCompensation],
      }

      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/employees`, ({ request }) => {
          const url = new URL(request.url)

          if (url.searchParams.has('payroll_uuid')) {
            const page = parseInt(url.searchParams.get('page') || '1', 10)
            const per = parseInt(url.searchParams.get('per') || '10', 10)
            const totalCount = page1Employees.length
            const totalPages = Math.ceil(totalCount / per)
            const startIndex = (page - 1) * per
            const pageEmployees = page1Employees.slice(startIndex, startIndex + per)

            return HttpResponse.json(pageEmployees, {
              headers: {
                'x-total-pages': String(totalPages),
                'x-total-count': String(totalCount),
                'x-page': String(page),
                'x-per-page': String(per),
              },
            })
          }
          return HttpResponse.json([])
        }),

        http.get(`${API_BASE_URL}/v1/employees/:employee_id`, ({ params }) => {
          if (params.employee_id === 'emp-excluded') {
            return HttpResponse.json(excludedEmployee)
          }
          return new HttpResponse(null, { status: 404 })
        }),

        http.get(`${API_BASE_URL}/v1/companies/:company_uuid/payrolls/blockers`, () => {
          return HttpResponse.json([])
        }),

        http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, () => {
          return HttpResponse.json(payrollDataWithExcluded)
        }),

        http.put(
          `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`,
          async ({ request }) => {
            const body = (await request.json()) as { employee_uuids?: string[] } | null
            const employeeUuids = body?.employee_uuids
            const allComps = [...allCompensations, excludedCompensation]

            if (employeeUuids && employeeUuids.length > 0) {
              const filteredCompensations = allComps.filter(comp =>
                employeeUuids.includes(comp.employee_uuid),
              )
              return HttpResponse.json({
                ...mockPayrollData,
                employee_compensations: filteredCompensations,
              })
            }

            return HttpResponse.json({
              ...mockPayrollData,
              employee_compensations: allComps,
            })
          },
        ),
      )

      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('Skipped Person')).toBeInTheDocument()
      })

      expect(screen.getByText('Skipped')).toBeInTheDocument()
    })
  })

  describe('editing an employee', () => {
    beforeEach(() => {
      currentPayrollData = buildPayrollData({
        employeeCompensations: [createCompensation('emp-1')],
      })
      server.use(
        ...buildPayrollConfigurationHandlers({
          getPayrollData: () => currentPayrollData,
          employees: [createEmployee('emp-1', 'Alice', 'Anderson')],
        }),
      )
    })

    it('emits runPayroll/employee/edit with the selected employee', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Edit' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

      expect(onEvent).toHaveBeenCalledWith('runPayroll/employee/edit', {
        employeeId: 'emp-1',
        firstName: 'Alice',
        lastName: 'Anderson',
      })
    })
  })

  describe('skipping an employee', () => {
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      const body = (await request.json()) as {
        employee_compensations: Array<{ employee_uuid: string; excluded: boolean }>
      } | null
      return HttpResponse.json({
        ...currentPayrollData,
        employee_compensations: body?.employee_compensations ?? [],
      })
    })

    beforeEach(() => {
      updateResolver.mockClear()
      currentPayrollData = buildPayrollData({
        employeeCompensations: [createCompensation('emp-1')],
      })
      server.use(
        ...buildPayrollConfigurationHandlers({
          getPayrollData: () => currentPayrollData,
          employees: [createEmployee('emp-1', 'Alice', 'Anderson')],
        }),
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, updateResolver),
      )
    })

    it('emits skip + saved events and persists the exclusion via the update endpoint', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Edit' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Skip employee' }))

      expect(onEvent).toHaveBeenCalledWith('runPayroll/employee/skip', { employeeId: 'emp-1' })

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          'runPayroll/employee/saved',
          expect.objectContaining({ payrollPrepared: expect.anything() }),
        )
      })
    })

    it('sends the toggled excluded flag in the update body', async () => {
      let updateBody: {
        employee_compensations: Array<{ excluded: boolean }>
      } | null = null
      const capturingResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        updateBody = (await request.json()) as typeof updateBody
        return HttpResponse.json(currentPayrollData)
      })
      server.use(
        http.put(
          `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`,
          capturingResolver,
        ),
      )

      const user = userEvent.setup()
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Edit' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Skip employee' }))

      await waitFor(() => {
        expect(capturingResolver).toHaveBeenCalledTimes(1)
      })
      // emp-1 starts unexcluded, so the toggle sends excluded: true.
      expect(updateBody!.employee_compensations[0]!.excluded).toBe(true)
    })
  })

  describe('blockers', () => {
    const blockers = [
      { key: 'missing_bank_info', message: 'Company must have a bank account to run payroll.' },
      { key: 'missing_signatory', message: 'A signatory is required.' },
    ]

    beforeEach(() => {
      currentPayrollData = mockPayrollData
      server.use(
        ...buildPayrollConfigurationHandlers({
          getPayrollData: () => currentPayrollData,
          blockers,
        }),
      )
    })

    it('shows the blocker alert and disables the calculate button', async () => {
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText('2 issues are preventing you from running payroll'),
        ).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: /calculate/i })).toBeDisabled()
    })

    it('emits runPayroll/blockers/viewAll when view all is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      const viewAll = await screen.findByRole('button', { name: 'View All Blockers' })
      await user.click(viewAll)

      expect(onEvent).toHaveBeenCalledWith('runPayroll/blockers/viewAll')
    })
  })

  describe('gross-up (bonus payroll)', () => {
    const grossUpResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ gross_up: '1250.00' }),
    )
    const updateResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json(currentPayrollData))

    beforeEach(() => {
      grossUpResolver.mockClear()
      updateResolver.mockClear()
      currentPayrollData = buildPayrollData({
        offCycle: true,
        offCycleReason: 'Bonus',
        employeeCompensations: [createCompensation('emp-1')],
      })
      server.use(
        ...buildPayrollConfigurationHandlers({
          getPayrollData: () => currentPayrollData,
          employees: [createEmployee('emp-1', 'Alice', 'Anderson')],
        }),
        http.post(`${API_BASE_URL}/v1/payrolls/:payroll_uuid/gross_up`, grossUpResolver),
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, updateResolver),
      )
    })

    it('offers the set-net-earnings action and emits grossUp/selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Edit' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Set employee net earnings' }))

      expect(onEvent).toHaveBeenCalledWith('runPayroll/grossUp/selected', {
        employeeUuid: 'emp-1',
      })
      expect(await screen.findByText('Enter a net amount')).toBeInTheDocument()
    })

    it('calculates and applies a gross-up, emitting grossUp/calculated and employee/saved', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollConfiguration {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Alice Anderson')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Edit' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Set employee net earnings' }))

      const netInput = await screen.findByLabelText('Net amount')
      // Pointer-focus first so userEvent.clear's own focus() succeeds even while
      // the just-closed row menu is still restoring focus, then clear the "0.00"
      // default and type. Tab out so react-aria's NumberField commits the parsed
      // value into the form before Calculate submits; otherwise the click can run
      // handleSubmit against a stale 0 that fails zod .positive() and never fires
      // the gross-up request.
      await user.click(netInput)
      await user.clear(netInput)
      await user.type(netInput, '1000')
      await user.tab()
      await user.click(screen.getByRole('button', { name: 'Calculate' }))

      await waitFor(() => {
        expect(grossUpResolver).toHaveBeenCalledTimes(1)
      })
      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          'runPayroll/grossUp/calculated',
          expect.objectContaining({ grossUp: '1250.00', employeeUuid: 'emp-1' }),
        )
      })

      await user.click(await screen.findByRole('button', { name: 'Apply' }))

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          'runPayroll/employee/saved',
          expect.objectContaining({ payrollPrepared: expect.anything() }),
        )
      })
    })
  })
})
