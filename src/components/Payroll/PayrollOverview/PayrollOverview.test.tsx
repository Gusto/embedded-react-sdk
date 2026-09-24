import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PayrollShow } from '@gusto/embedded-api/models/components/payrollshow'
import { OffCycleReasonType } from '@gusto/embedded-api/models/components/payrollshow'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { canCancelPayroll } from '../helpers'
import { PayrollOverview } from './PayrollOverview'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

function createHttpMeta(status: number) {
  return {
    response: new Response('', { status }),
    request: new Request('https://api.gusto.com/v1/test'),
    body: '',
  }
}

const mockSubmitPayroll = vi.fn()

const basePayrollData: PayrollShow = {
  payrollDeadline: new Date('2025-08-11'),
  checkDate: '2025-08-15',
  processed: false,
  processedDate: null,
  calculatedAt: new Date('2025-08-11T12:00:00Z'),
  uuid: 'payroll-uuid',
  payrollUuid: 'payroll-uuid',
  companyUuid: 'company-uuid',
  offCycle: true,
  offCycleReason: OffCycleReasonType.DismissedEmployee,
  external: false,
  payPeriod: {
    startDate: '2025-08-01',
    endDate: '2025-08-15',
    payScheduleUuid: 'schedule-uuid',
  },
  totals: {
    companyDebit: '5000.00',
    netPayDebit: '4000.00',
    taxDebit: '1000.00',
    reimbursementDebit: '0.00',
    childSupportDebit: '0.00',
    reimbursements: '0.00',
    netPay: '4000.00',
    grossPay: '5000.00',
    employeeBonuses: '0.00',
    employeeCommissions: '0.00',
    employeeCashTips: '0.00',
    employeePaycheckTips: '0.00',
    additionalEarnings: '0.00',
    ownersDraw: '0.00',
    checkAmount: '0.00',
    employerTaxes: '500.00',
    employeeTaxes: '500.00',
    benefits: '0.00',
    employeeBenefitsDeductions: '0.00',
    imputedPay: '0.00',
    deferredPayrollTaxes: '0.00',
    otherDeductions: '0.00',
  },
  companyTaxes: [],
  payrollTaxes: [],
  createdAt: new Date('2025-08-11T12:00:00Z'),
  submissionBlockers: [],
  processingRequest: {
    status: 'calculate_success',
    errors: [],
  },
  partnerOwnedDisbursement: false,
  employeeCompensations: [],
}

let mockPayrollData = { ...basePayrollData }
let mockIsFetching = false
let mockIsError = false
let mockError: Error | null = null
// When set, `data` stays populated even while `mockIsError` is true -- simulates `keepPreviousData`
// holding the last successful page while a background refetch is erroring.
let mockStaleDataPresent = false
// When set, the poll's own `refetch` (reused from this query) rejects with this error instead of
// resolving, independent of the render-driving `mockIsError`/`mockError` above.
let mockRefetchError: unknown = null
let mockShowEmployees: { uuid: string; flsaStatus?: string }[] = []

const buildMockPayrollQueryData = () => ({
  payrollShow: mockPayrollData,
  httpMeta: {
    response: {
      headers: new Headers({ 'x-total-pages': '1', 'x-total-count': '0' }),
    },
  },
})

vi.mock('@gusto/embedded-api/react-query/payrollsGet', () => ({
  usePayrollsGet: () => ({
    data: mockIsError && !mockStaleDataPresent ? undefined : buildMockPayrollQueryData(),
    isFetching: mockIsFetching,
    isError: mockIsError,
    error: mockError,
    // The submission poll drives its reads through this `refetch`, reusing the same query
    // instead of building a second one — so it reads whatever `mockPayrollData` holds at call
    // time, same as the render-driving `data` above.
    refetch: () =>
      mockRefetchError
        ? Promise.resolve({ status: 'error', error: mockRefetchError })
        : Promise.resolve({ status: 'success', data: buildMockPayrollQueryData() }),
  }),
}))

vi.mock('@gusto/embedded-api/react-query/payrollsSubmit', () => ({
  usePayrollsSubmitMutation: () => ({
    mutateAsync: mockSubmitPayroll,
    isPending: false,
  }),
}))

vi.mock('@gusto/embedded-api/react-query/payrollsCancel', () => ({
  usePayrollsCancelMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@gusto/embedded-api/react-query/bankAccountsGet', () => ({
  useBankAccountsGetSuspense: () => ({
    data: { companyBankAccounts: [{ hiddenAccountNumber: '****1234' }] },
  }),
}))

vi.mock('@gusto/embedded-api/react-query/wireInRequestsGet', () => ({
  useWireInRequestsGet: () => ({ data: undefined }),
}))

vi.mock('@gusto/embedded-api/react-query/employeesList', () => ({
  useEmployeesList: () => ({
    data: { showEmployees: mockShowEmployees },
  }),
}))

vi.mock('@/hooks/useCompanyPaymentSpeed', () => ({
  useCompanyPaymentSpeed: () => ({
    paymentSpeed: undefined,
    paymentSpeedDays: 2,
  }),
}))

vi.mock('@gusto/embedded-api/react-query/_context', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...(actual as Record<string, unknown>),
    useGustoEmbeddedContext: () => ({}),
  }
})

vi.mock('@gusto/embedded-api/funcs/payrollsGetPayStub', () => ({
  payrollsGetPayStub: vi.fn(),
}))

vi.mock('../helpers', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...(actual as Record<string, unknown>),
    canCancelPayroll: vi.fn(),
  }
})

describe('PayrollOverview polling', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockPayrollData = { ...basePayrollData }
    mockIsFetching = false
    mockIsError = false
    mockError = null
    mockStaleDataPresent = false
    mockRefetchError = null
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stops polling and emits RUN_PAYROLL_PROCESSED when processed is true even without submit_success status', async () => {
    mockPayrollData = {
      ...basePayrollData,
      processed: false,
      processingRequest: { status: 'submitting', errors: [] },
    }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={mockOnEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText(/Review payroll/i)).toBeInTheDocument()
    })

    mockPayrollData = {
      ...basePayrollData,
      processed: true,
      processingRequest: { status: 'submitting', errors: [] },
    }

    // The poll reads through `buildPayrollsGetQuery` directly, independent of any render — advance
    // its own timer past one interval so the next tick picks up the mutated mock data above.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6_000)
    })

    await waitFor(() => {
      expect(mockOnEvent).toHaveBeenCalledWith(
        componentEvents.RUN_PAYROLL_PROCESSED,
        expect.objectContaining({ payPeriod: basePayrollData.payPeriod }),
      )
    })
  })

  it('stops polling and emits RUN_PAYROLL_PROCESSED when processed is true and processingRequest is null', async () => {
    mockPayrollData = {
      ...basePayrollData,
      processed: false,
      processingRequest: { status: 'submitting', errors: [] },
    }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={mockOnEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText(/Review payroll/i)).toBeInTheDocument()
    })

    mockPayrollData = {
      ...basePayrollData,
      processed: true,
      processingRequest: null as unknown as PayrollShow['processingRequest'],
    }

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6_000)
    })

    await waitFor(() => {
      expect(mockOnEvent).toHaveBeenCalledWith(
        componentEvents.RUN_PAYROLL_PROCESSED,
        expect.objectContaining({ payPeriod: basePayrollData.payPeriod }),
      )
    })
  })

  it('keeps polling after Submit when the first read is inconclusive, instead of getting stuck on "Submitting payroll..."', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockSubmitPayroll.mockResolvedValue({ payrollUuid: 'payroll-uuid' })
    mockPayrollData = {
      ...basePayrollData,
      processed: false,
      processingRequest: { status: 'calculate_success', errors: [] },
    }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={mockOnEvent} />,
    )

    await user.click(await screen.findByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(mockSubmitPayroll).toHaveBeenCalled()
    })

    // Simulates the race the fix targets: this read still matches the pre-submit baseline,
    // which used to terminate the poll permanently as `{type: 'loaded'}`.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6_000)
    })

    expect(mockOnEvent).not.toHaveBeenCalledWith(
      componentEvents.RUN_PAYROLL_PROCESSED,
      expect.anything(),
    )
    expect(screen.getByText(/Submitting payroll/i)).toBeInTheDocument()

    mockPayrollData = {
      ...basePayrollData,
      processed: true,
      processingRequest: { status: 'submit_success', errors: [] },
    }

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6_000)
    })

    await waitFor(() => {
      expect(mockOnEvent).toHaveBeenCalledWith(
        componentEvents.RUN_PAYROLL_PROCESSED,
        expect.objectContaining({ payPeriod: basePayrollData.payPeriod }),
      )
    })
  })

  it('does not emit RUN_PAYROLL_PROCESSING_FAILED when the baseline-less mount poll hits a non-retryable read error', async () => {
    mockPayrollData = {
      ...basePayrollData,
      processed: false,
      processingRequest: { status: 'calculate_success', errors: [] },
    }
    mockRefetchError = new APIError('session expired', createHttpMeta(401))

    // Real timers here: the mount poll's first read rejects immediately (no interval to advance
    // past), and `waitFor` below needs real elapsed time to give that promise chain room to settle.
    vi.useRealTimers()

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={mockOnEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText(/Review payroll/i)).toBeInTheDocument()
    })

    // The deadline alert is suppressed while `isPolling` is true (see `deadlineAlert` in
    // PayrollOverview.tsx), so waiting for it is a deterministic signal that the mount poll's
    // rejecting first read has already settled -- more reliable than a fixed real-time sleep.
    await screen.findByText(/Make sure to submit before the deadline/i)

    expect(mockOnEvent).not.toHaveBeenCalledWith(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
  })

  it('still emits RUN_PAYROLL_PROCESSING_FAILED when a post-Submit poll hits a non-retryable read error', async () => {
    mockSubmitPayroll.mockResolvedValue({ payrollUuid: 'payroll-uuid' })
    mockPayrollData = {
      ...basePayrollData,
      processed: false,
      processingRequest: { status: 'calculate_success', errors: [] },
    }

    // Real timers: the mount poll's first (successful) read needs to fully settle -- as its own
    // independent promise chain, not gated by any timer -- before Submit starts a tracked run.
    vi.useRealTimers()
    const user = userEvent.setup()

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={mockOnEvent} />,
    )

    await waitFor(() => {
      expect(screen.getByText(/Review payroll/i)).toBeInTheDocument()
    })
    await new Promise(resolve => setTimeout(resolve, 50))

    mockRefetchError = new APIError('session expired', createHttpMeta(401))
    await user.click(await screen.findByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
    })
  })

  it('emits RUN_PAYROLL_PROCESSING_FAILED when a baseline-less poll has already observed a submitting status before a non-retryable error', async () => {
    mockPayrollData = {
      ...basePayrollData,
      processed: false,
      processingRequest: { status: 'submitting', errors: [] },
    }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={mockOnEvent} />,
    )

    // No local Submit click happened, so this still renders the ordinary review UI (per the
    // "submit-in-progress overlay" tests below) -- but the mount poll's first tick already read
    // the submitting status above and recorded `sawSubmitting`.
    await waitFor(() => {
      expect(screen.getByText(/Review payroll/i)).toBeInTheDocument()
    })

    mockRefetchError = new APIError('session expired', createHttpMeta(401))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6_000)
    })

    await waitFor(() => {
      expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
    })
  })
})

describe('PayrollOverview submit-in-progress overlay', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockPayrollData = { ...basePayrollData }
    mockIsFetching = false
    mockIsError = false
    mockError = null
    mockStaleDataPresent = false
    mockRefetchError = null
  })

  it('renders the review UI with active Submit and Edit controls when loading a payroll whose server-side status is already submitting', async () => {
    mockPayrollData = {
      ...basePayrollData,
      processed: false,
      processingRequest: { status: 'submitting', errors: [] },
    }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={mockOnEvent} />,
    )

    // The "Submitting payroll" overlay is only correct when the current user
    // just clicked Submit. A page load against an already-processing payroll
    // must keep the interactive review UI on screen — the Edit/Submit
    // action buttons are the load-bearing controls that the overlay would
    // otherwise replace.
    expect(await screen.findByRole('button', { name: 'Submit' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
  })
})

describe('PayrollOverview className', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPayrollData = { ...basePayrollData }
    mockIsFetching = false
    mockIsError = false
    mockError = null
    mockStaleDataPresent = false
    mockRefetchError = null
  })

  it('applies custom className', async () => {
    const { container } = renderWithProviders(
      <PayrollOverview
        companyId="company-uuid"
        payrollId="payroll-uuid"
        onEvent={vi.fn()}
        className="custom-class"
      />,
    )

    await screen.findByText(/Review payroll/i)
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})

describe('PayrollOverview tax totals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPayrollData = { ...basePayrollData }
    mockIsFetching = false
    mockIsError = false
    mockError = null
    mockStaleDataPresent = false
    mockRefetchError = null
  })

  it('derives the per-tax breakdown from the payrollTaxes aggregate, not the paginated compensations', async () => {
    const user = userEvent.setup()
    mockPayrollData = {
      ...basePayrollData,
      // Payroll-level aggregate (full payroll) — the source of truth.
      payrollTaxes: [
        { name: 'Social Security', employer: false, amount: 100 },
        { name: 'Social Security', employer: true, amount: 100 },
      ],
      // The single loaded page sums to a different (smaller) number; if the table read
      // from here instead of the aggregate, it would show $1.00 and be wrong.
      employeeCompensations: [
        {
          employeeUuid: 'emp-1',
          firstName: 'Jane',
          lastName: 'Doe',
          excluded: false,
          fixedCompensations: [],
          hourlyCompensations: [],
          paidTimeOff: [],
          taxes: [{ name: 'Social Security', employer: false, amount: '1' }],
        },
      ],
    }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    await user.click(await screen.findByRole('tab', { name: /Taxed and debited/i }))

    expect(await screen.findByText('Social Security')).toBeInTheDocument()
    // Aggregate amount ($100.00) is shown; the page-level sum ($1.00) is not.
    expect(screen.getAllByText('$100.00').length).toBeGreaterThan(0)
    expect(screen.queryByText('$1.00')).not.toBeInTheDocument()
  })
})

describe('PayrollOverview compensation type', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPayrollData = { ...basePayrollData }
    mockIsFetching = false
    mockIsError = false
    mockError = null
    mockStaleDataPresent = false
    mockRefetchError = null
    mockShowEmployees = []
  })

  it('populates compensation type for a salaried employee with no hourlyCompensations entry', async () => {
    const user = userEvent.setup()
    mockPayrollData = {
      ...basePayrollData,
      employeeCompensations: [
        {
          employeeUuid: 'emp-salaried',
          firstName: 'Patricia',
          lastName: 'Churchland',
          excluded: false,
          fixedCompensations: [{ name: 'Salary', amount: '2000.0' }],
          hourlyCompensations: [],
          paidTimeOff: [],
          grossPay: '2000',
          netPay: '1600',
          checkAmount: '1600',
          paymentMethod: 'Direct Deposit',
          memo: null,
        },
      ],
    }
    mockShowEmployees = [{ uuid: 'emp-salaried', flsaStatus: 'Exempt' }]

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    await user.click(await screen.findByRole('tab', { name: /Hours worked/i }))

    expect(await screen.findByText('Salaried / Exempt')).toBeInTheDocument()
  })
})

describe('PayrollOverview calculatedAt guard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPayrollData = { ...basePayrollData }
    mockIsFetching = false
    mockIsError = false
    mockError = null
    mockStaleDataPresent = false
    mockRefetchError = null
  })

  it('recovers with a recalculate action instead of dead-ending when the payroll settles uncalculated', async () => {
    const mockOnEvent = vi.fn()
    mockPayrollData = {
      ...basePayrollData,
      calculatedAt: null,
    }
    mockIsFetching = false
    mockIsError = false
    mockError = null
    mockStaleDataPresent = false
    mockRefetchError = null

    const user = userEvent.setup()
    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={mockOnEvent} />,
    )

    // No dead-end: the error-boundary card never renders, and the recovery copy shows instead.
    expect(await screen.findByText(/isn't calculated yet/i)).toBeInTheDocument()
    expect(screen.queryByTestId('internal-error-card')).toBeNull()
    expect(screen.queryByText(/Review payroll/i)).toBeNull()

    // The recalculate action routes back to configuration to fix the payroll.
    await user.click(screen.getByRole('button', { name: /Recalculate payroll/i }))
    expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.RUN_PAYROLL_EDIT)
  })

  it('shows the loader instead of an error while a fresh read is still in flight', async () => {
    mockPayrollData = {
      ...basePayrollData,
      calculatedAt: null,
    }
    mockIsFetching = true
    mockIsError = false
    mockError = null
    mockStaleDataPresent = false
    mockRefetchError = null

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    expect(await screen.findByText(/Loading payroll/i)).toBeInTheDocument()
    expect(screen.queryByTestId('internal-error-card')).toBeNull()
    expect(screen.queryByText(/isn't calculated yet/i)).toBeNull()
  })

  it('throws to the error boundary instead of loading forever when the payroll query itself errors', async () => {
    mockIsError = true
    mockError = new Error('network error')

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()
    expect(screen.queryByText(/Loading payroll/i)).toBeNull()
    // The boundary must show our own copy, not whatever raw message the query error carries --
    // that message isn't translated or guaranteed end-user-appropriate.
    expect(screen.getByText(/There was an issue loading this payroll/i)).toBeInTheDocument()
    expect(screen.queryByText(/network error/i)).toBeNull()
  })

  it('keeps rendering stale data through a retryable background error, once placeholder data exists', async () => {
    mockStaleDataPresent = true
    mockIsError = true
    mockError = new Error('transient network blip')

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    expect(await screen.findByText(/Review payroll/i)).toBeInTheDocument()
    expect(screen.queryByTestId('internal-error-card')).toBeNull()
  })

  it('throws to the error boundary on a non-retryable error even when stale placeholder data exists', async () => {
    mockStaleDataPresent = true
    mockIsError = true
    mockError = new APIError('session expired', createHttpMeta(401))

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()
    expect(screen.queryByText(/Review payroll/i)).toBeNull()
  })
})

describe('PayrollOverview print checks modal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPayrollData = {
      ...basePayrollData,
      employeeCompensations: [
        {
          employeeUuid: 'emp-check-1',
          firstName: 'Isaiah',
          lastName: 'Berlin',
          excluded: false,
          version: 'v1',
          grossPay: '4000',
          netPay: '3200',
          checkAmount: '3200',
          paymentMethod: 'Check',
          memo: null,
          fixedCompensations: [],
          hourlyCompensations: [],
          paidTimeOff: [],
          taxes: [],
          benefits: [],
          deductions: [],
        },
      ],
    }
    mockIsFetching = false
    mockIsError = false
    mockError = null
    mockStaleDataPresent = false
    mockRefetchError = null
  })

  it('hides the View and print checks button until the payroll is processed', async () => {
    mockPayrollData = { ...mockPayrollData, processed: false }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    expect(await screen.findByText(/noted 1 employee/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View and print checks' })).toBeNull()
  })

  it('opens the print checks modal from the alert once the payroll is processed', async () => {
    const user = userEvent.setup()
    mockPayrollData = {
      ...mockPayrollData,
      processed: true,
      processingRequest: { status: 'submit_success', errors: [] },
    }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    await user.click(await screen.findByRole('button', { name: 'View and print checks' }))

    expect(await screen.findByText('Choose check stock')).toBeInTheDocument()
  })
})

describe('PayrollOverview readOnly mode', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockPayrollData = { ...basePayrollData }
    mockIsFetching = false
    mockIsError = false
    mockError = null
    mockStaleDataPresent = false
    mockRefetchError = null
    vi.mocked(canCancelPayroll).mockReturnValue(false)
  })

  it('hides Edit but keeps Submit enabled and functional on an unprocessed payroll', async () => {
    const user = userEvent.setup()
    mockSubmitPayroll.mockResolvedValue({ payrollUuid: 'payroll-uuid' })

    renderWithProviders(
      <PayrollOverview
        companyId="company-uuid"
        payrollId="payroll-uuid"
        onEvent={mockOnEvent}
        readOnly
      />,
    )

    expect(await screen.findByRole('button', { name: 'Submit' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(mockSubmitPayroll).toHaveBeenCalled()
      expect(mockOnEvent).toHaveBeenCalledWith(
        componentEvents.RUN_PAYROLL_SUBMITTED,
        expect.anything(),
      )
    })
  })

  it('hides Cancel on a processed payroll even when the payroll is otherwise cancellable', async () => {
    vi.mocked(canCancelPayroll).mockReturnValue(true)
    mockPayrollData = {
      ...basePayrollData,
      processed: true,
      processingRequest: { status: 'submit_success', errors: [] },
    }

    renderWithProviders(
      <PayrollOverview
        companyId="company-uuid"
        payrollId="payroll-uuid"
        onEvent={mockOnEvent}
        readOnly
      />,
    )

    expect(await screen.findByRole('button', { name: 'View payroll receipt' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel payroll' })).toBeNull()
  })
})
