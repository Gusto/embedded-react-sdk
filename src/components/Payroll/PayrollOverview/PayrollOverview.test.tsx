import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type {
  PayrollShow,
  PayrollShowEmployeeCompensations,
} from '@gusto/embedded-api/models/components/unprocessedpayroll'
import { OffCycleReasonType } from '@gusto/embedded-api/models/components/unprocessedpayroll'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import type { GetV1CompaniesCompanyIdEmployeesRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidemployees'
import type { GetV1CompaniesCompanyIdPayrollsPayrollIdRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrollspayrollid'
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
let mockShowEmployees: Pick<Employee, 'uuid' | 'jobs'>[] = []
const { mockPayrollsGetRequest, mockEmployeesListRequest } = vi.hoisted(() => ({
  mockPayrollsGetRequest:
    vi.fn<(request: GetV1CompaniesCompanyIdPayrollsPayrollIdRequest) => void>(),
  mockEmployeesListRequest: vi.fn<(request: GetV1CompaniesCompanyIdEmployeesRequest) => void>(),
}))

const buildMockPayrollQueryData = () => ({
  payrollShow: mockPayrollData,
  httpMeta: {
    response: {
      headers: new Headers({ 'x-total-pages': '1', 'x-total-count': '0' }),
    },
  },
})

vi.mock('@gusto/embedded-api/react-query/payrollsGet', () => ({
  usePayrollsGet: (request: GetV1CompaniesCompanyIdPayrollsPayrollIdRequest) => {
    mockPayrollsGetRequest(request)
    return {
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
    }
  },
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
  useEmployeesList: (request: GetV1CompaniesCompanyIdEmployeesRequest) => {
    mockEmployeesListRequest(request)
    return { data: { showEmployees: mockShowEmployees } }
  },
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

  const buildSalariedCompensation = (
    employeeUuid: string,
    lastName: string,
  ): PayrollShowEmployeeCompensations => ({
    employeeUuid,
    firstName: 'Patricia',
    lastName,
    excluded: false,
    fixedCompensations: [{ name: 'Salary', amount: '2000.0' }],
    hourlyCompensations: [],
    paidTimeOff: [],
    grossPay: '2000',
    netPay: '1600',
    checkAmount: '1600',
    paymentMethod: 'Direct Deposit',
    memo: null,
  })

  it("reads a salaried employee's compensation type from their primary job, filtering employees by payroll", async () => {
    const user = userEvent.setup()
    mockPayrollData = {
      ...basePayrollData,
      employeeCompensations: [buildSalariedCompensation('emp-salaried', 'Churchland')],
    }
    mockShowEmployees = [
      {
        uuid: 'emp-salaried',
        jobs: [
          {
            uuid: 'job-secondary',
            title: 'Tutor',
            primary: false,
            compensations: [{ uuid: 'comp-secondary', flsaStatus: 'Nonexempt' }],
          },
          {
            uuid: 'job-primary',
            title: 'Professor',
            primary: true,
            compensations: [{ uuid: 'comp-primary', flsaStatus: 'Exempt' }],
          },
        ],
      },
    ]

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    await user.click(await screen.findByRole('tab', { name: /Hours worked/i }))

    expect(await screen.findByText('Salaried / Exempt')).toBeInTheDocument()
    expect(mockEmployeesListRequest).toHaveBeenLastCalledWith({
      companyId: 'company-uuid',
      payrollUuid: 'payroll-uuid',
      page: 1,
      per: 25,
      sortBy: 'name',
    })
  })

  it('leaves compensation type blank for an employee with no jobs', async () => {
    const user = userEvent.setup()
    mockPayrollData = {
      ...basePayrollData,
      employeeCompensations: [buildSalariedCompensation('emp-no-jobs', 'Jobless')],
    }
    mockShowEmployees = [{ uuid: 'emp-no-jobs', jobs: [] }]

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    await user.click(await screen.findByRole('tab', { name: /Hours worked/i }))

    const row = await screen.findByRole('row', { name: /Jobless/ })
    const [compensationTypeCell] = within(row).getAllByRole('gridcell')
    expect(compensationTypeCell).toHaveTextContent(/^$/)
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

  it('renders a recoverable not-calculated screen on a genuinely uncalculated payroll', async () => {
    mockPayrollData = {
      ...basePayrollData,
      calculatedAt: null,
    }
    const onEvent = vi.fn()

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={onEvent} />,
    )

    expect(
      await screen.findByRole('heading', { name: 'This payroll has changed' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Review payroll/i)).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Back to payrolls' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.RUN_PAYROLL_NOT_CALCULATED_BACK_TO_LIST)
  })

  it('renders a processed tax reconciliation payroll despite a null calculatedAt', async () => {
    mockPayrollData = {
      ...basePayrollData,
      processed: true,
      calculatedAt: null,
      offCycleReason: OffCycleReasonType.TaxReconciliation,
      checkDate: '2026-09-30',
      // The real API sends explicit `null`s here, but the generated `PayrollPayPeriodType`
      // only types `startDate`/`endDate` as `string | undefined` (a separate, tracked
      // schema-nullability gap) -- `undefined` exercises the same "no pay period" branch
      // in our fallback logic without fighting that type.
      payPeriod: { startDate: undefined, endDate: undefined, payScheduleUuid: null },
    }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: /Payroll summary/i }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('internal-error-card')).toBeNull()
    // Falls back to the check date since there's no pay period to show.
    expect(screen.getAllByText(/Sep 30, 2026/i).length).toBeGreaterThan(0)
  })

  const processedWithoutCalculation: Array<[string, Partial<PayrollShow>]> = [
    ['wage correction', { offCycleReason: OffCycleReasonType.WageCorrection }],
    ['benefit reversal', { offCycleReason: OffCycleReasonType.BenefitReversal }],
    ['reversal', { offCycleReason: OffCycleReasonType.Reversal }],
    [
      'disability insurance distribution',
      { offCycleReason: OffCycleReasonType.DisabilityInsuranceDistribution },
    ],
    ['off-cycle with an unrecognized reason', { offCycleReason: null }],
    ['external', { offCycle: false, offCycleReason: null, external: true }],
  ]

  it('renders a submitted payroll that is not yet marked processed despite a null calculatedAt', async () => {
    mockPayrollData = {
      ...basePayrollData,
      processed: false,
      calculatedAt: null,
      processingRequest: { status: 'submit_success', errors: [] },
    }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: /Payroll summary/i }),
    ).toBeInTheDocument()
  })

  it('renders the not-calculated screen on an unprocessed tax reconciliation payroll with a null calculatedAt', async () => {
    mockPayrollData = {
      ...basePayrollData,
      processed: false,
      calculatedAt: null,
      offCycleReason: OffCycleReasonType.TaxReconciliation,
    }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    expect(
      await screen.findByRole('heading', { name: 'This payroll has changed' }),
    ).toBeInTheDocument()
  })

  it.each(processedWithoutCalculation)(
    'renders a processed %s payroll despite a null calculatedAt',
    async (_label, overrides) => {
      mockPayrollData = {
        ...basePayrollData,
        processed: true,
        calculatedAt: null,
        ...overrides,
      }

      renderWithProviders(
        <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
      )

      expect(
        await screen.findByRole('heading', { level: 1, name: /Payroll summary/i }),
      ).toBeInTheDocument()
    },
  )

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

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Choose check stock' }),
    ).toBeInTheDocument()
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

describe('PayrollOverview cancel action', () => {
  const processedRegularPayroll: PayrollShow = {
    ...basePayrollData,
    processed: true,
    processingRequest: { status: 'submit_success', errors: [] },
    offCycle: false,
    offCycleReason: null,
    payrollDeadline: new Date('2025-08-11T23:00:00Z'),
    payrollStatusMeta: {
      cancellable: true,
      expectedCheckDate: '2025-08-15',
      initialCheckDate: '2025-08-15',
      expectedDebitTime: '2025-08-11T23:00:00Z',
      payrollLate: false,
      initialDebitCutoffTime: '2025-08-11T23:00:00Z',
    },
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.setSystemTime(new Date('2025-08-10T18:00:00Z'))
    mockPayrollData = { ...processedRegularPayroll }
    mockIsFetching = false
    mockIsError = false
    mockError = null
    mockStaleDataPresent = false
    mockRefetchError = null
    const actualHelpers = await vi.importActual<{ canCancelPayroll: typeof canCancelPayroll }>(
      '../helpers',
    )
    vi.mocked(canCancelPayroll).mockImplementation(actualHelpers.canCancelPayroll)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('requests payroll_status_meta so the cancel decision sees the server cancellable flag', async () => {
    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    await screen.findByRole('button', { name: 'View payroll receipt' })

    expect(mockPayrollsGetRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        payrollId: 'payroll-uuid',
        include: expect.arrayContaining(['payroll_taxes', 'payroll_status_meta']),
      }),
    )
  })

  it('shows Cancel payroll for a processed regular payroll the API flags cancellable', async () => {
    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    expect(await screen.findByRole('button', { name: 'Cancel payroll' })).toBeInTheDocument()
  })

  it('hides Cancel payroll when the response carries no cancellable flag', async () => {
    mockPayrollData = { ...processedRegularPayroll, payrollStatusMeta: undefined }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    expect(await screen.findByRole('button', { name: 'View payroll receipt' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel payroll' })).toBeNull()
  })

  it('hides Cancel payroll for a disability insurance distribution even when flagged cancellable', async () => {
    mockPayrollData = {
      ...processedRegularPayroll,
      offCycle: true,
      offCycleReason: OffCycleReasonType.DisabilityInsuranceDistribution,
    }

    renderWithProviders(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={vi.fn()} />,
    )

    expect(await screen.findByRole('button', { name: 'View payroll receipt' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancel payroll' })).toBeNull()
  })
})
