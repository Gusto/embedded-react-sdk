import { expect, describe, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PayrollShow } from '@gusto/embedded-api/models/components/payrollshow'
import type { PayrollSubmissionBlockersType } from '@gusto/embedded-api/models/components/payrollsubmissionblockerstype'
import { PayrollOverviewPresentation } from './PayrollOverviewPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockPayrollData: PayrollShow = {
  payrollDeadline: new Date('2025-08-11'),
  checkDate: '2025-08-15',
  processed: false,
  processedDate: null,
  calculatedAt: new Date('2025-08-11T12:00:00Z'),
  uuid: 'payroll-uuid',
  payrollUuid: 'payroll-uuid',
  companyUuid: 'company-uuid',
  offCycle: false,
  autoPilot: false,
  external: false,
  payPeriod: {
    startDate: '2025-08-01',
    endDate: '2025-08-15',
    payScheduleUuid: 'schedule-uuid',
  },
  totals: {
    companyDebit: '10000.00',
    netPayDebit: '8000.00',
    taxDebit: '2000.00',
    reimbursementDebit: '0.00',
    childSupportDebit: '0.00',
    reimbursements: '0.00',
    netPay: '8000.00',
    grossPay: '10000.00',
    employeeBonuses: '0.00',
    employeeCommissions: '0.00',
    employeeCashTips: '0.00',
    employeePaycheckTips: '0.00',
    additionalEarnings: '0.00',
    ownersDraw: '0.00',
    checkAmount: '0.00',
    employerTaxes: '1000.00',
    employeeTaxes: '1000.00',
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

const mockFastAchBlocker: PayrollSubmissionBlockersType = {
  blockerType: 'fast_ach_threshold_exceeded',
  blockerName: 'Fast ACH Threshold Exceeded',
  status: 'unresolved',
  unblockOptions: [
    {
      unblockType: 'wire_in',
      checkDate: '2025-08-13',
    },
    {
      unblockType: 'move_to_four_day',
      checkDate: '2025-08-15',
    },
  ],
}

const defaultProps = {
  payrollData: mockPayrollData,
  employeeDetails: [],
  taxes: {},
  isSubmitting: false,
  isProcessed: false,
  onEdit: vi.fn(),
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  onPayrollReceipt: vi.fn(),
  onPaystubDownload: vi.fn(),
}

describe('PayrollOverviewPresentation', () => {
  it('renders without fast ACH blocker', async () => {
    renderWithProviders(<PayrollOverviewPresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/Review payroll/i)).toBeInTheDocument()
    })
    expect(
      screen.queryByText(/You have exceeded the limit at which you can process 2-day payroll/i),
    ).not.toBeInTheDocument()
  })

  it('renders banner with error status when fast ACH blocker exists', async () => {
    renderWithProviders(
      <PayrollOverviewPresentation
        {...defaultProps}
        submissionBlockers={[mockFastAchBlocker]}
        onUnblockOptionChange={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(
        screen.getByText(/You have exceeded the limit at which you can process 2-day payroll/i),
      ).toBeInTheDocument()
    })
    expect(
      screen.getByText(/Payroll can still be funded by selecting one of the options below/i),
    ).toBeInTheDocument()
  })

  it('displays correct blocker title and description', async () => {
    renderWithProviders(
      <PayrollOverviewPresentation
        {...defaultProps}
        submissionBlockers={[mockFastAchBlocker]}
        onUnblockOptionChange={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(
        screen.getByText(/You have exceeded the limit at which you can process 2-day payroll/i),
      ).toBeInTheDocument()
    })
    expect(
      screen.getByText(
        /The selected funding method will only be used for this cycle and will not apply to future payroll/i,
      ),
    ).toBeInTheDocument()
  })

  it('renders radio options from unblockOptions', async () => {
    renderWithProviders(
      <PayrollOverviewPresentation
        {...defaultProps}
        submissionBlockers={[mockFastAchBlocker]}
        onUnblockOptionChange={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText(/Wire funds/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/Switch to 4-day direct deposit/i)).toBeInTheDocument()
  })

  it('shows wire option with "Fastest" badge', async () => {
    renderWithProviders(
      <PayrollOverviewPresentation
        {...defaultProps}
        submissionBlockers={[mockFastAchBlocker]}
        onUnblockOptionChange={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText(/Fastest/i)).toBeInTheDocument()
    })
  })

  it('displays employee pay dates from checkDate', async () => {
    renderWithProviders(
      <PayrollOverviewPresentation
        {...defaultProps}
        submissionBlockers={[mockFastAchBlocker]}
        onUnblockOptionChange={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText(/Employee pay date: Aug 13, 2025/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/Employee pay date: Aug 15, 2025/i)).toBeInTheDocument()
  })

  it('submit button is disabled when blocker exists and no option selected', async () => {
    renderWithProviders(
      <PayrollOverviewPresentation
        {...defaultProps}
        submissionBlockers={[mockFastAchBlocker]}
        onUnblockOptionChange={vi.fn()}
      />,
    )

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      expect(submitButton).toBeDisabled()
    })
  })

  it('submit button is enabled when option is selected', async () => {
    renderWithProviders(
      <PayrollOverviewPresentation
        {...defaultProps}
        submissionBlockers={[mockFastAchBlocker]}
        selectedUnblockOptions={{ fast_ach_threshold_exceeded: 'wire_in' }}
        onUnblockOptionChange={vi.fn()}
      />,
    )

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('calls onUnblockOptionChange when radio selection changes', async () => {
    const user = userEvent.setup()
    const onUnblockOptionChange = vi.fn()

    renderWithProviders(
      <PayrollOverviewPresentation
        {...defaultProps}
        submissionBlockers={[mockFastAchBlocker]}
        onUnblockOptionChange={onUnblockOptionChange}
      />,
    )

    const wireOption = await waitFor(() => screen.getByRole('radio', { name: /Wire funds/i }))
    await user.click(wireOption)

    expect(onUnblockOptionChange).toHaveBeenCalledWith('fast_ach_threshold_exceeded', 'wire_in')
  })

  it('renders multiple submission blockers simultaneously', async () => {
    const secondBlocker: PayrollSubmissionBlockersType = {
      blockerType: 'another_blocker_type',
      blockerName: 'Another Blocker',
      status: 'unresolved',
      unblockOptions: [
        {
          unblockType: 'option_a',
          checkDate: '2025-08-20',
        },
      ],
    }

    renderWithProviders(
      <PayrollOverviewPresentation
        {...defaultProps}
        submissionBlockers={[mockFastAchBlocker, secondBlocker]}
        onUnblockOptionChange={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(
        screen.getByText(/You have exceeded the limit at which you can process 2-day payroll/i),
      ).toBeInTheDocument()
    })
    const anotherBlockerElements = screen.getAllByText('Another Blocker')
    expect(anotherBlockerElements.length).toBeGreaterThan(0)
  })

  it('submit button works normally when no blocker exists', async () => {
    renderWithProviders(<PayrollOverviewPresentation {...defaultProps} />)

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Submit/i })
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Payroll summary table', () => {
    it('displays default payroll summary when no option is selected', async () => {
      renderWithProviders(
        <PayrollOverviewPresentation
          {...defaultProps}
          submissionBlockers={[mockFastAchBlocker]}
          onUnblockOptionChange={vi.fn()}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText(/Payroll Summary/i)).toBeInTheDocument()
      })
      expect(screen.getByText(/Debit amount/i)).toBeInTheDocument()
      expect(screen.getByText(/Debit account/i)).toBeInTheDocument()
      expect(screen.getByText(/Debit date/i)).toBeInTheDocument()
    })

    it('displays wire funds payroll summary when wire_in is selected', async () => {
      renderWithProviders(
        <PayrollOverviewPresentation
          {...defaultProps}
          submissionBlockers={[mockFastAchBlocker]}
          selectedUnblockOptions={{ fast_ach_threshold_exceeded: 'wire_in' }}
          onUnblockOptionChange={vi.fn()}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText(/Payroll summary \(Wire funds\)/i)).toBeInTheDocument()
      })
      expect(screen.getByText(/Wire amount/i)).toBeInTheDocument()
      expect(screen.getByText(/Wire transfer deadline/i)).toBeInTheDocument()
      expect(screen.queryByText(/Debit account/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Debit date/i)).not.toBeInTheDocument()
    })

    it('displays 4-day direct deposit payroll summary when move_to_four_day is selected', async () => {
      renderWithProviders(
        <PayrollOverviewPresentation
          {...defaultProps}
          submissionBlockers={[mockFastAchBlocker]}
          selectedUnblockOptions={{ fast_ach_threshold_exceeded: 'move_to_four_day' }}
          onUnblockOptionChange={vi.fn()}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText(/Payroll summary \(4-day direct deposit\)/i)).toBeInTheDocument()
      })
      expect(screen.getByText(/Debit amount/i)).toBeInTheDocument()
      expect(screen.getByText(/Debit account/i)).toBeInTheDocument()
      expect(screen.getByText(/Debit date/i)).toBeInTheDocument()
    })

    it('displays correct employee pay date from unblock option for wire funds', async () => {
      renderWithProviders(
        <PayrollOverviewPresentation
          {...defaultProps}
          submissionBlockers={[mockFastAchBlocker]}
          selectedUnblockOptions={{ fast_ach_threshold_exceeded: 'wire_in' }}
          onUnblockOptionChange={vi.fn()}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText(/Payroll summary \(Wire funds\)/i)).toBeInTheDocument()
      })
      const employeePayDateCells = screen.getAllByText(/Aug 13, 2025/i)
      expect(employeePayDateCells.length).toBeGreaterThan(0)
    })

    it('displays correct employee pay date from unblock option for 4-day direct deposit', async () => {
      renderWithProviders(
        <PayrollOverviewPresentation
          {...defaultProps}
          submissionBlockers={[mockFastAchBlocker]}
          selectedUnblockOptions={{ fast_ach_threshold_exceeded: 'move_to_four_day' }}
          onUnblockOptionChange={vi.fn()}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText(/Payroll summary \(4-day direct deposit\)/i)).toBeInTheDocument()
      })
      const employeePayDateCells = screen.getAllByText(/Aug 15, 2025/i)
      expect(employeePayDateCells.length).toBeGreaterThan(0)
    })
  })
})
