import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PayrollShow } from '@gusto/embedded-api/models/components/payrollshow'
import { OffCycleReasonType } from '@gusto/embedded-api/models/components/payrollshow'
import { canCancelPayroll } from '../helpers'
import { PayrollOverview } from './PayrollOverview'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

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

vi.mock('@gusto/embedded-api/react-query/payrollsGet', () => ({
  usePayrollsGet: () => ({
    data: {
      payrollShow: mockPayrollData,
      httpMeta: {
        response: {
          headers: new Headers({ 'x-total-pages': '1', 'x-total-count': '0' }),
        },
      },
    },
    isFetching: mockIsFetching,
  }),
  // The submission poll reads through this directly (`queryClient.fetchQuery`), bypassing the
  // `usePayrollsGet` mock above — mirror the same mutable `mockPayrollData` so a test can drive
  // the poll by mutating that variable, same as it already does for the rendered hook.
  buildPayrollsGetQuery: () => ({
    queryKey: ['test', 'Payrolls', 'get', 'poll'],
    queryFn: () =>
      Promise.resolve({
        payrollShow: mockPayrollData,
        httpMeta: {
          response: {
            headers: new Headers({ 'x-total-pages': '1', 'x-total-count': '0' }),
          },
        },
      }),
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
})

describe('PayrollOverview submit-in-progress overlay', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockPayrollData = { ...basePayrollData }
    mockIsFetching = false
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

describe('PayrollOverview tax totals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPayrollData = { ...basePayrollData }
    mockIsFetching = false
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

describe('PayrollOverview calculatedAt guard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPayrollData = { ...basePayrollData }
    mockIsFetching = false
  })

  it('throws to the error boundary on a genuinely uncalculated payroll', async () => {
    mockPayrollData = {
      ...basePayrollData,
      calculatedAt: null,
    }
    mockIsFetching = false

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
