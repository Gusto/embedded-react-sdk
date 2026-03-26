import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import type { PayrollShow } from '@gusto/embedded-api/models/components/payroll'
import { OffCycleReasonType } from '@gusto/embedded-api/models/components/payroll'
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
  autoPilot: false,
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

vi.mock('@gusto/embedded-api/react-query/payrollsGet', () => ({
  usePayrollsGetSuspense: () => ({
    data: { payrollShow: mockPayrollData },
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

vi.mock('@gusto/embedded-api/react-query/employeesList', () => ({
  useEmployeesListSuspense: () => ({
    data: { showEmployees: [] },
  }),
}))

vi.mock('@gusto/embedded-api/react-query/wireInRequestsGet', () => ({
  useWireInRequestsGet: () => ({ data: undefined }),
}))

vi.mock('@gusto/embedded-api/react-query/paymentConfigsGet', () => ({
  usePaymentConfigsGet: () => ({ data: undefined }),
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
