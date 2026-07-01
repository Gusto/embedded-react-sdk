import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PayrollShow } from '@gusto/embedded-api-v-2026-02-01/models/components/payroll'
import { OffCycleReasonType } from '@gusto/embedded-api-v-2026-02-01/models/components/payroll'
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

vi.mock('@gusto/embedded-api-v-2026-02-01/react-query/payrollsGet', () => ({
  usePayrollsGet: () => ({
    data: {
      payrollShow: mockPayrollData,
      httpMeta: {
        response: {
          headers: new Headers({ 'x-total-pages': '1', 'x-total-count': '0' }),
        },
      },
    },
    isFetching: false,
  }),
}))

vi.mock('@gusto/embedded-api-v-2026-02-01/react-query/payrollsSubmit', () => ({
  usePayrollsSubmitMutation: () => ({
    mutateAsync: mockSubmitPayroll,
    isPending: false,
  }),
}))

vi.mock('@gusto/embedded-api-v-2026-02-01/react-query/payrollsCancel', () => ({
  usePayrollsCancelMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('@gusto/embedded-api-v-2026-02-01/react-query/bankAccountsGet', () => ({
  useBankAccountsGetSuspense: () => ({
    data: { companyBankAccounts: [{ hiddenAccountNumber: '****1234' }] },
  }),
}))

vi.mock('@gusto/embedded-api-v-2026-02-01/react-query/wireInRequestsGet', () => ({
  useWireInRequestsGet: () => ({ data: undefined }),
}))

vi.mock('@/hooks/useCompanyPaymentSpeed', () => ({
  useCompanyPaymentSpeed: () => ({
    paymentSpeed: undefined,
    paymentSpeedDays: 2,
  }),
}))

vi.mock('@gusto/embedded-api-v-2026-02-01/react-query/_context', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...(actual as Record<string, unknown>),
    useGustoEmbeddedContext: () => ({}),
  }
})

vi.mock('@gusto/embedded-api-v-2026-02-01/funcs/payrollsGetPayStub', () => ({
  payrollsGetPayStub: vi.fn(),
}))

describe('PayrollOverview polling', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockPayrollData = { ...basePayrollData }
  })

  it('stops polling and emits RUN_PAYROLL_PROCESSED when processed is true even without submit_success status', async () => {
    mockPayrollData = {
      ...basePayrollData,
      processed: false,
      processingRequest: { status: 'submitting', errors: [] },
    }

    const { rerender } = renderWithProviders(
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

    rerender(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={mockOnEvent} />,
    )

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

    const { rerender } = renderWithProviders(
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

    rerender(
      <PayrollOverview companyId="company-uuid" payrollId="payroll-uuid" onEvent={mockOnEvent} />,
    )

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
          taxes: [{ name: 'Social Security', employer: false, amount: 1 }],
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
