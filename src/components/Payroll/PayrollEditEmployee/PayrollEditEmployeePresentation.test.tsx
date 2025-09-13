import { expect, describe, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import userEvent from '@testing-library/user-event'
import { PayrollEditEmployeePresentation } from './PayrollEditEmployeePresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockEmployee: Employee = {
  uuid: 'emp-1',
  firstName: 'John',
  lastName: 'Doe',
  jobs: [
    {
      uuid: 'job-1',
      title: 'Software Engineer',
      primary: true,
      compensations: [
        {
          uuid: 'comp-1',
          rate: '25.00',
          paymentUnit: 'Hour',
          flsaStatus: 'Nonexempt',
        },
      ],
    },
    {
      uuid: 'job-2',
      title: 'Senior Developer',
      primary: false,
      compensations: [
        {
          uuid: 'comp-2',
          rate: '30.00',
          paymentUnit: 'Hour',
          flsaStatus: 'Nonexempt',
        },
      ],
    },
  ],
}

const mockEmployeeCompensation: PayrollEmployeeCompensationsType = {
  employeeUuid: 'emp-1',
  hourlyCompensations: [
    {
      name: 'Regular Hours',
      hours: '40.000',
      flsaStatus: 'Nonexempt',
      jobUuid: 'job-1',
      amount: '1000.0',
      compensationMultiplier: 1.0,
    },
    {
      name: 'Overtime',
      hours: '5.000',
      flsaStatus: 'Nonexempt',
      jobUuid: 'job-1',
      amount: '187.5',
      compensationMultiplier: 1.5,
    },
    {
      name: 'Regular Hours',
      hours: '20.000',
      flsaStatus: 'Nonexempt',
      jobUuid: 'job-2',
      amount: '600.0',
      compensationMultiplier: 1.0,
    },
  ],
  fixedCompensations: [],
  paidTimeOff: [],
  grossPay: 1787.5,
  netPay: 1500.0,
  checkAmount: 1500.0,
  paymentMethod: 'Direct Deposit',
  memo: null,
  version: 'v1',
}

const expectedUpdatedCompensation = {
  ...mockEmployeeCompensation,
  hourlyCompensations: [
    {
      name: 'Regular Hours',
      hours: '40',
      flsaStatus: 'Nonexempt',
      jobUuid: 'job-1',
      amount: '1000.0',
      compensationMultiplier: 1.0,
    },
    {
      name: 'Overtime',
      hours: '5',
      flsaStatus: 'Nonexempt',
      jobUuid: 'job-1',
      amount: '187.5',
      compensationMultiplier: 1.5,
    },
    {
      name: 'Regular Hours',
      hours: '20',
      flsaStatus: 'Nonexempt',
      jobUuid: 'job-2',
      amount: '600.0',
      compensationMultiplier: 1.0,
    },
  ],
}

const defaultProps = {
  onSave: vi.fn(),
  onCancel: vi.fn(),
  employee: mockEmployee,
  grossPay: 1787.5,
  employeeCompensation: mockEmployeeCompensation,
  isPending: false,
}

describe('PayrollEditEmployeePresentation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the component with employee data', async () => {
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })
    expect(screen.getByText("Edit John Doe's payroll")).toBeInTheDocument()
  })

  it('displays gross pay correctly', async () => {
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('$1,787.50')).toBeInTheDocument()
    })
    expect(screen.getByText('Gross pay (excluding reimbursements)')).toBeInTheDocument()
  })

  it('renders job titles as headings', async () => {
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    })
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
  })

  it('renders form fields for existing compensations', async () => {
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getAllByLabelText('Regular Hours')).toHaveLength(2) // One for each job
    })
    expect(screen.getByLabelText('Overtime')).toBeInTheDocument()
  })

  it('pre-fills form fields with existing compensation hours', async () => {
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

    const regularHoursInputs = await screen.findAllByLabelText('Regular Hours')

    expect(regularHoursInputs).toHaveLength(2)
    expect(regularHoursInputs[0]).toHaveValue(40) // First job (Software Engineer)
    expect(regularHoursInputs[1]).toHaveValue(20) // Second job (Senior Developer)

    const overtimeInput = screen.getByLabelText('Overtime')
    expect(overtimeInput).toHaveValue(5)
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} onCancel={onCancel} />)

    const cancelButton = await waitFor(() => screen.getByText('Cancel'))
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onSave when save button is clicked with form data', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} onSave={onSave} />)

    const saveButton = await waitFor(() => screen.getByText('Save'))
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith(expectedUpdatedCompensation)
  })

  it('updates compensation hours when form values change', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} onSave={onSave} />)

    // Get the first Regular Hours input (job-1) and update it
    const regularHoursInputs = await screen.findAllByLabelText('Regular Hours')
    const regularHoursJob1Input = regularHoursInputs[0]! // First job's Regular Hours input
    await user.clear(regularHoursJob1Input)
    await user.type(regularHoursJob1Input, '45')

    const saveButton = screen.getByText('Save')
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        hourlyCompensations: expect.arrayContaining([
          expect.objectContaining({
            name: 'Regular Hours',
            hours: '45',
            jobUuid: 'job-1',
          }),
        ]),
      }),
    )
  })

  it('shows loading state on save button when isPending is true', async () => {
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} isPending={true} />)

    const saveButton = await screen.findByText('Save')
    expect(saveButton).toHaveAttribute('data-loading', 'true')
  })

  it('filters compensations by job UUID correctly', async () => {
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

    const regularHoursInputs = await screen.findAllByLabelText('Regular Hours')
    expect(regularHoursInputs[0]).toHaveValue(40) // Regular Hours for job-1

    const overtimeInput = screen.getByLabelText('Overtime')
    expect(overtimeInput).toHaveValue(5) // Overtime for job-1

    expect(regularHoursInputs[1]).toHaveValue(20) // Regular Hours for job-2
  })

  it('handles case-insensitive compensation name matching', async () => {
    const compensationWithDifferentCase = {
      ...mockEmployeeCompensation,
      hourlyCompensations: [
        {
          ...mockEmployeeCompensation.hourlyCompensations![0],
          name: 'regular hours',
        },
      ],
    }

    renderWithProviders(
      <PayrollEditEmployeePresentation
        {...defaultProps}
        employeeCompensation={compensationWithDifferentCase}
      />,
    )

    const regularHoursInputs = await screen.findAllByLabelText('Regular Hours')
    expect(regularHoursInputs[0]).toHaveValue(40)
  })

  it('handles missing compensation hours gracefully', async () => {
    const compensationWithoutHours = {
      ...mockEmployeeCompensation,
      hourlyCompensations: [
        {
          ...mockEmployeeCompensation.hourlyCompensations![0],
          hours: undefined,
        },
      ],
    }

    renderWithProviders(
      <PayrollEditEmployeePresentation
        {...defaultProps}
        employeeCompensation={compensationWithoutHours}
      />,
    )

    const regularHoursInputs = await screen.findAllByLabelText('Regular Hours')
    expect(regularHoursInputs[0]).toHaveValue(null) // Should be null when hours is undefined
  })

  it('preserves existing compensation data when updating hours', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} onSave={onSave} />)

    // Get the first Regular Hours input (job-1) and update it
    const regularHoursInputs = await waitFor(() => screen.getAllByLabelText('Regular Hours'))
    const regularHoursJob1Input = regularHoursInputs[0]! // First job's Regular Hours input
    await user.clear(regularHoursJob1Input)
    await user.type(regularHoursJob1Input, '42')

    const saveButton = screen.getByText('Save')
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeUuid: 'emp-1',
        grossPay: 1787.5,
        netPay: 1500.0,
        checkAmount: 1500.0,
        paymentMethod: 'Direct Deposit',
        version: 'v1',
        hourlyCompensations: expect.arrayContaining([
          expect.objectContaining({
            name: 'Regular Hours',
            hours: '42',
            jobUuid: 'job-1',
            amount: '1000.0',
            compensationMultiplier: 1.0,
          }),
        ]),
      }),
    )
  })
})
