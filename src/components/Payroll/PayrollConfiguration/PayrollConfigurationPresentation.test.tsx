import { expect, describe, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payrollshow'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import userEvent from '@testing-library/user-event'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockEmployeeCompensations: EmployeeCompensations[] = [
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
    grossPay: 880.0,
    fixedCompensations: [],
    paymentMethod: 'Direct Deposit',
    memo: null,
    version: 'v1',
    netPay: 767.99,
    checkAmount: 767.99,
  },
]

const mockEmployeeDetails: Employee[] = [
  {
    uuid: 'emp-1',
    firstName: 'John',
    lastName: 'Doe',
    jobs: [
      {
        uuid: 'job-1',
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
}

describe('PayrollConfigurationPresentation', () => {
  it('renders the component with employee data', async () => {
    renderWithProviders(<PayrollConfigurationPresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
    expect(screen.getByText(/Run payroll for/)).toBeInTheDocument()
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

    const calculateButton = await waitFor(() => screen.getByText('Calculate payroll'))
    await user.click(calculateButton)

    expect(onCalculatePayroll).toHaveBeenCalled()
  })

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<PayrollConfigurationPresentation {...defaultProps} onBack={onBack} />)

    const backButton = await waitFor(() => screen.getByText('Back'))
    await user.click(backButton)

    expect(onBack).toHaveBeenCalled()
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
})
