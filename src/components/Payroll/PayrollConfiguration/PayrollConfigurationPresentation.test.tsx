import { expect, describe, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import {
  type Employee,
  EmployeePaymentMethod1,
} from '@gusto/embedded-api/models/components/employee'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import userEvent from '@testing-library/user-event'
import type { ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { PayrollCategory } from '../payrollTypes'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { getCellByColumnHeader } from '@/test-utils/tableQueries'

const mockEmployeeCompensations: PayrollEmployeeCompensationsType[] = [
  {
    excluded: false,
    employeeUuid: 'emp-1',
    hourlyCompensations: [
      {
        name: 'Regular Hours',
        hours: '40.000',
        flsaStatus: 'Nonexempt',
        jobUuid: 'job-1',
        amount: '880.0',
        compensationMultiplier: 1.0,
      },
    ],
    paidTimeOff: [
      {
        name: 'Vacation Hours',
        hours: '8.0',
      },
    ],
    grossPay: '880.00',
    fixedCompensations: [],
    paymentMethod: 'Direct Deposit',
    memo: null,
    version: 'v1',
    netPay: '767.99',
    checkAmount: '767.99',
  },
]

const mockEmployeeDetails: Employee[] = [
  {
    uuid: 'emp-1',
    firstName: 'John',
    lastName: 'Doe',
    paymentMethod: EmployeePaymentMethod1.DirectDeposit,
    jobs: [
      {
        uuid: 'job-1',
        title: 'Software Engineer',
        primary: true,
        compensations: [
          {
            uuid: 'comp-1',
            rate: '22.00',
            paymentUnit: 'Hour',
            flsaStatus: 'Nonexempt',
          },
        ],
      },
    ],
  },
]

const mockPayPeriod: PayrollPayPeriodType = {
  startDate: '2025-07-30',
  endDate: '2025-08-13',
  payScheduleUuid: 'schedule-1',
}

const defaultProps = {
  employeeCompensations: mockEmployeeCompensations,
  employeeDetails: mockEmployeeDetails,
  payPeriod: mockPayPeriod,
  onBack: vi.fn(),
  onCalculatePayroll: vi.fn(),
  onEdit: vi.fn(),
  onToggleExclude: vi.fn(),
  onViewBlockers: vi.fn(),
}

const mockBlockers: ApiPayrollBlocker[] = [
  {
    key: 'missing_bank_info',
    message: 'Company must have a bank account in order to run payroll.',
  },
  {
    key: 'missing_signatory',
    message:
      'A signatory who is authorized to sign documents on behalf of your company is required.',
  },
]

describe('PayrollConfigurationPresentation', () => {
  it('renders the component with employee data', async () => {
    renderWithProviders(<PayrollConfigurationPresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
    expect(screen.getByText(/Regular payroll for/)).toBeInTheDocument()
  })

  it('displays the payroll category in the description for bonus payrolls', async () => {
    renderWithProviders(
      <PayrollConfigurationPresentation
        {...defaultProps}
        payrollCategory={PayrollCategory.Bonus}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText(/Bonus payroll for/)).toBeInTheDocument()
    })
  })

  it('displays employee information correctly', async () => {
    renderWithProviders(<PayrollConfigurationPresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('shows excluded badge when employee is excluded', async () => {
    const excludedCompensation = {
      ...mockEmployeeCompensations[0],
      excluded: true,
    }

    renderWithProviders(
      <PayrollConfigurationPresentation
        {...defaultProps}
        employeeCompensations={[excludedCompensation]}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Skipped')).toBeInTheDocument()
    })
  })

  it('filters out compensations without matching employee details', () => {
    const compensationWithoutEmployee = {
      ...mockEmployeeCompensations[0],
      employeeUuid: 'non-existent-emp',
    }

    renderWithProviders(
      <PayrollConfigurationPresentation
        {...defaultProps}
        employeeCompensations={[compensationWithoutEmployee]}
      />,
    )

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('renders employee data in the table', async () => {
    renderWithProviders(<PayrollConfigurationPresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('calls onCalculatePayroll when calculate button is clicked', async () => {
    const onCalculatePayroll = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <PayrollConfigurationPresentation
        {...defaultProps}
        onCalculatePayroll={onCalculatePayroll}
      />,
    )

    const calculateButton = await waitFor(() => screen.getByText('Calculate and review'))
    await user.click(calculateButton)

    expect(onCalculatePayroll).toHaveBeenCalled()
  })

  it('configures onEdit callback correctly for DataView interaction', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(<PayrollConfigurationPresentation {...defaultProps} onEdit={onEdit} />)

    const button = await screen.findByRole('button', { name: 'Edit' })
    await user.click(button)

    const menuItem = await screen.findByRole('menuitem', { name: 'Edit' })

    await user.click(menuItem)

    expect(onEdit).toHaveBeenCalledWith(mockEmployeeDetails[0])
  })

  it('disables calculate button when isCalculateDisabled is true', async () => {
    renderWithProviders(
      <PayrollConfigurationPresentation
        {...defaultProps}
        payrollBlockers={mockBlockers}
        isCalculateDisabled={true}
      />,
    )

    const calculateButton = await waitFor(() => screen.getByText('Calculate and review'))

    expect(calculateButton).toBeDisabled()
  })

  it('enables calculate button when isCalculateDisabled is false', async () => {
    renderWithProviders(
      <PayrollConfigurationPresentation
        {...defaultProps}
        isCalculateDisabled={false}
        payrollBlockers={[]}
      />,
    )

    const calculateButton = await waitFor(() => screen.getByText('Calculate and review'))

    expect(calculateButton).toBeEnabled()
  })

  it('displays blocker alerts when blockers are present', async () => {
    renderWithProviders(
      <PayrollConfigurationPresentation {...defaultProps} payrollBlockers={mockBlockers} />,
    )

    await waitFor(() => {
      expect(
        screen.getByText(/2 issues are preventing you from running payroll/),
      ).toBeInTheDocument()
    })
  })

  it('does not display blocker alerts when no blockers are present', () => {
    renderWithProviders(<PayrollConfigurationPresentation {...defaultProps} payrollBlockers={[]} />)

    expect(
      screen.queryByText(/issues are preventing you from running payroll/),
    ).not.toBeInTheDocument()
  })

  it('calls onViewBlockers when view all button is clicked with multiple blockers', async () => {
    const onViewBlockers = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <PayrollConfigurationPresentation
        {...defaultProps}
        payrollBlockers={mockBlockers}
        onViewBlockers={onViewBlockers}
      />,
    )

    const viewAllButton = await waitFor(() => screen.getByText('View All Blockers'))
    await user.click(viewAllButton)

    expect(onViewBlockers).toHaveBeenCalled()
  })

  it('disables calculate button when isPending is true', async () => {
    renderWithProviders(<PayrollConfigurationPresentation {...defaultProps} isPending={true} />)

    const calculateButton = await waitFor(() => screen.getByText('Calculate and review'))

    expect(calculateButton).toBeDisabled()
  })

  it('shows calculating state when isCalculating is true', async () => {
    renderWithProviders(
      <PayrollConfigurationPresentation {...defaultProps} isCalculating={true} isPending={true} />,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Calculating payroll...' })).toBeInTheDocument()
    })

    const calculateButton = screen.getByRole('button', { name: 'Calculating payroll...' })
    expect(calculateButton).toBeDisabled()
  })

  it('displays late payroll warning banner when provided', async () => {
    const payrollAlert = {
      label: 'Your original pay date was Fri, Dec 19',
      content:
        'Run payroll before 4:00 PM PST on Fri, Jan 16 to pay your employees on Wed, Jan 21.',
      variant: 'warning' as const,
    }

    renderWithProviders(
      <PayrollConfigurationPresentation {...defaultProps} payrollAlert={payrollAlert} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Your original pay date was Fri, Dec 19')).toBeInTheDocument()
    })

    expect(
      screen.getByText(
        'Run payroll before 4:00 PM PST on Fri, Jan 16 to pay your employees on Wed, Jan 21.',
      ),
    ).toBeInTheDocument()
  })

  it('does not display late payroll banner when not provided', () => {
    renderWithProviders(<PayrollConfigurationPresentation {...defaultProps} />)

    expect(screen.queryByText(/Your original pay date was/)).not.toBeInTheDocument()
  })

  it('only displays late banner when only late banner is provided', async () => {
    const payrollAlert = {
      label: 'Your original pay date was Fri, Dec 19',
      content:
        'Run payroll before 4:00 PM PST on Fri, Jan 16 to pay your employees on Wed, Jan 21.',
      variant: 'warning' as const,
    }

    renderWithProviders(
      <PayrollConfigurationPresentation {...defaultProps} payrollAlert={payrollAlert} />,
    )

    await waitFor(() => {
      expect(screen.getByText('Your original pay date was Fri, Dec 19')).toBeInTheDocument()
    })

    expect(
      screen.queryByText(/To pay your employees with direct deposit by/),
    ).not.toBeInTheDocument()
  })

  it('includes reimbursements in the estimated Total pay column when regularRateOfPay is opted out', async () => {
    const compensationWithReimbursement: PayrollEmployeeCompensationsType = {
      ...mockEmployeeCompensations[0],
      reimbursements: [{ description: null, amount: '2000.00' }],
    }

    renderWithProviders(
      <PayrollConfigurationPresentation
        {...defaultProps}
        employeeCompensations={[compensationWithReimbursement]}
      />,
      { features: { regularRateOfPay: false } },
    )

    const table = await screen.findByRole('grid', { name: 'Employee compensations' })
    const row = within(table).getByRole('row', { name: /John Doe/i })
    expect(getCellByColumnHeader(table, row, 'Reimbursements')).toHaveTextContent('$2,000.00')
    // calculateGrossPay for this fixture (40hrs regular + 8hrs PTO, both @ $22/hr) is $1,056;
    // total pay should add the $2,000 reimbursement on top.
    expect(getCellByColumnHeader(table, row, 'Total pay')).toHaveTextContent('$3,056.00')
  })

  it('includes reimbursements in the Total pay column by default', async () => {
    const compensationWithReimbursement: PayrollEmployeeCompensationsType = {
      ...mockEmployeeCompensations[0],
      grossPay: '880.00',
      reimbursements: [{ description: null, amount: '2000.00' }],
    }

    renderWithProviders(
      <PayrollConfigurationPresentation
        {...defaultProps}
        employeeCompensations={[compensationWithReimbursement]}
      />,
    )

    const table = await screen.findByRole('grid', { name: 'Employee compensations' })
    const row = within(table).getByRole('row', { name: /John Doe/i })
    expect(getCellByColumnHeader(table, row, 'Total pay')).toHaveTextContent('$2,880.00')
  })

  it('falls back to the estimated Total pay when the API leaves out the grossPay key', async () => {
    const compensationWithoutGrossPay: PayrollEmployeeCompensationsType = {
      ...mockEmployeeCompensations[0],
    }
    delete compensationWithoutGrossPay.grossPay

    renderWithProviders(
      <PayrollConfigurationPresentation
        {...defaultProps}
        employeeCompensations={[compensationWithoutGrossPay]}
      />,
    )

    const table = await screen.findByRole('grid', { name: 'Employee compensations' })
    const row = within(table).getByRole('row', { name: /John Doe/i })
    // calculateGrossPay for this fixture (40hrs regular + 8hrs PTO, both @ $22/hr) is $1,056.
    expect(getCellByColumnHeader(table, row, 'Total pay')).toHaveTextContent('$1,056.00')
  })

  it('shows $0.00 Total pay when the API sends a null grossPay', async () => {
    const compensationWithNullGrossPay: PayrollEmployeeCompensationsType = {
      ...mockEmployeeCompensations[0],
      grossPay: null,
    }

    renderWithProviders(
      <PayrollConfigurationPresentation
        {...defaultProps}
        employeeCompensations={[compensationWithNullGrossPay]}
      />,
    )

    const table = await screen.findByRole('grid', { name: 'Employee compensations' })
    const row = within(table).getByRole('row', { name: /John Doe/i })
    expect(getCellByColumnHeader(table, row, 'Total pay')).toHaveTextContent('$0.00')
  })
})
