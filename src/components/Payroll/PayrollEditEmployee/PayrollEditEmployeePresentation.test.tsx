import { expect, describe, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import { PayrollEmployeeCompensationsTypePaymentMethod as PaymentMethods } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
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
  eligiblePaidTimeOff: [
    {
      name: 'Vacation Hours',
      policyName: 'Vacation Policy',
      policyUuid: 'vacation-policy-uuid',
      accrualUnit: 'Hour',
      accrualRate: '208.0',
      accrualMethod: 'per_hour_worked',
      accrualPeriod: 'Year',
      accrualBalance: '40.0',
      maximumAccrualBalance: '240.0',
      paidAtTermination: true,
    },
    {
      name: 'Sick Hours',
      policyName: 'Sick Policy',
      policyUuid: 'sick-policy-uuid',
      accrualUnit: 'Hour',
      accrualRate: '104.0',
      accrualMethod: 'unlimited',
      accrualPeriod: 'Year',
      accrualBalance: '0.0',
      maximumAccrualBalance: '0.0',
      paidAtTermination: false,
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
  fixedCompensations: [
    {
      name: 'Bonus',
      amount: '500.00',
      jobUuid: 'job-1',
    },
    {
      name: 'Commission',
      amount: '200.00',
      jobUuid: 'job-1',
    },
    {
      name: 'Reimbursement',
      amount: '100.00',
      jobUuid: 'job-1',
    },
  ],
  paidTimeOff: [
    {
      name: 'Vacation Hours',
      hours: '8.0',
    },
    {
      name: 'Sick Hours',
      hours: '0.0',
    },
  ],
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
  paidTimeOff: [
    {
      name: 'Vacation Hours',
      hours: '8',
    },
    {
      name: 'Sick Hours',
      hours: '0',
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
  fixedCompensationTypes: [
    { name: 'Bonus' },
    { name: 'Commission' },
    { name: 'Paycheck Tips' },
    { name: 'Cash Tips' },
    { name: 'Correction Payment' },
    { name: 'Reimbursement' },
  ],
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

    const regularHoursInputs = await screen.findAllByLabelText('Regular Hours')
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

  describe('Time Off', () => {
    it('renders time off section when employee has time off data', async () => {
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Time off')).toBeInTheDocument()
      })
      expect(screen.getByLabelText('Vacation Hours')).toBeInTheDocument()
      expect(screen.getByLabelText('Sick Hours')).toBeInTheDocument()
    })

    it('pre-fills time off fields with existing hours', async () => {
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

      const vacationInput = await screen.findByLabelText('Vacation Hours')
      const sickInput = await screen.findByLabelText('Sick Hours')

      expect(vacationInput).toHaveValue(8)
      expect(sickInput).toHaveValue(0)
    })

    it('shows remaining balance for accrual-based policies', async () => {
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

      await waitFor(() => {
        // Vacation Hours: 40.0 balance - 8.0 hours = 32.0 remaining
        expect(screen.getByText(/32\.0.*remaining/)).toBeInTheDocument()
      })
    })

    it('does not show balance for unlimited policies', async () => {
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Sick Hours')).toBeInTheDocument()
      })

      // Should not show remaining balance for sick hours (unlimited policy)
      const remainingTexts = screen.queryAllByText(/remaining/)
      expect(remainingTexts).toHaveLength(1) // Only vacation hours should show remaining
    })

    it('updates time off hours when form values change', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} onSave={onSave} />)

      const vacationInput = await screen.findByLabelText('Vacation Hours')
      await user.clear(vacationInput)
      await user.type(vacationInput, '16')

      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          paidTimeOff: expect.arrayContaining([
            expect.objectContaining({
              name: 'Vacation Hours',
              hours: '16',
            }),
            expect.objectContaining({
              name: 'Sick Hours',
              hours: '0',
            }),
          ]),
        }),
      )
    })

    it('updates remaining balance when time off hours change', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

      const vacationInput = await screen.findByLabelText('Vacation Hours')

      // Initially should show 32.0 remaining (40.0 - 8.0)
      await waitFor(() => {
        expect(screen.getByText(/32\.0.*remaining/)).toBeInTheDocument()
      })

      // Change to 10 hours
      await user.clear(vacationInput)
      await user.type(vacationInput, '10')

      // Should now show 30.0 remaining (40.0 - 10.0)
      await waitFor(() => {
        expect(screen.getByText(/30\.0.*remaining/)).toBeInTheDocument()
      })
    })

    it('handles time off with no existing data', () => {
      const propsWithoutTimeOff = {
        ...defaultProps,
        employeeCompensation: {
          ...mockEmployeeCompensation,
          paidTimeOff: [],
        },
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...propsWithoutTimeOff} />)

      // Should not render time off section if no time off data
      expect(screen.queryByText('Time off')).not.toBeInTheDocument()
    })

    it('preserves existing time off data when updating other time off hours', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} onSave={onSave} />)

      const sickInput = await screen.findByLabelText('Sick Hours')
      await user.clear(sickInput)
      await user.type(sickInput, '4')

      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          paidTimeOff: expect.arrayContaining([
            expect.objectContaining({
              name: 'Vacation Hours',
              hours: '8', // Should preserve existing vacation hours
            }),
            expect.objectContaining({
              name: 'Sick Hours',
              hours: '4', // Should update sick hours
            }),
          ]),
        }),
      )
    })
  })

  describe('Additional Earnings', () => {
    it('renders additional earnings fields when fixedCompensations are present', async () => {
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Additional earnings')).toBeInTheDocument()
        expect(screen.getByLabelText('Bonus')).toBeInTheDocument()
        expect(screen.getByLabelText('Commission')).toBeInTheDocument()
      })
    })

    it('renders reimbursement field separately when present', async () => {
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Reimbursement' })).toBeInTheDocument()
        expect(screen.getByLabelText('Reimbursement')).toBeInTheDocument()
      })
    })

    it('does not render additional earnings section for owners if they have no existing fixed compensations', () => {
      const ownerProps = {
        ...defaultProps,
        employee: {
          ...defaultProps.employee,
          jobs: [
            {
              ...defaultProps.employee.jobs![0]!,
              compensations: [
                {
                  ...defaultProps.employee.jobs![0]!.compensations![0]!,
                  flsaStatus: FlsaStatusType.Owner,
                },
              ],
            },
          ],
        },
        employeeCompensation: {
          ...mockEmployeeCompensation,
          fixedCompensations: [
            {
              name: 'Reimbursement',
              amount: '100.00',
              jobUuid: 'job-1',
            },
          ],
        },
        fixedCompensationTypes: [], // No types available
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...ownerProps} />)

      expect(screen.queryByText('Additional earnings')).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Reimbursement' })).toBeInTheDocument()
    })

    it('updates fixed compensations when form values change', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} onSave={onSave} />)

      const bonusInput = await screen.findByLabelText('Bonus')
      await user.clear(bonusInput)
      await user.type(bonusInput, '750')

      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          fixedCompensations: expect.arrayContaining([
            expect.objectContaining({
              name: 'Bonus',
              amount: '750',
              jobUuid: 'job-1',
            }),
            expect.objectContaining({
              name: 'Commission',
              amount: '200.00',
              jobUuid: 'job-1',
            }),
            expect.objectContaining({
              name: 'Reimbursement',
              amount: '100.00',
              jobUuid: 'job-1',
            }),
          ]),
        }),
      )
    })
  })

  describe('Additional earnings functionality', () => {
    const defaultPropsWithAdditionalEarnings = {
      ...defaultProps,
      employeeCompensation: {
        ...defaultProps.employeeCompensation,
        fixedCompensations: [
          { name: 'Bonus', amount: '100.00', jobUuid: 'job-1' },
          { name: 'Commission', amount: '50.00', jobUuid: 'job-1' },
          { name: 'Reimbursement', amount: '25.00', jobUuid: 'job-1' },
        ],
      },
      fixedCompensationTypes: [
        { name: 'Bonus' },
        { name: 'Commission' },
        { name: 'Paycheck Tips' },
        { name: 'Cash Tips' },
        { name: 'Correction Payment' },
        { name: 'Reimbursement' },
      ],
    }

    it('renders additional earnings section when employee has fixed compensations', () => {
      renderWithProviders(
        <PayrollEditEmployeePresentation {...defaultPropsWithAdditionalEarnings} />,
      )

      expect(screen.getByText('Additional earnings')).toBeInTheDocument()

      const bonusInput = screen.getByLabelText('Bonus')
      expect(bonusInput).toHaveValue(100)

      const commissionInput = screen.getByLabelText('Commission')
      expect(commissionInput).toHaveValue(50)
    })

    it('renders reimbursement section separately when employee has reimbursement', () => {
      renderWithProviders(
        <PayrollEditEmployeePresentation {...defaultPropsWithAdditionalEarnings} />,
      )

      expect(screen.getByRole('heading', { name: 'Reimbursement' })).toBeInTheDocument()

      const reimbursementInput = screen.getByLabelText('Reimbursement')
      expect(reimbursementInput).toHaveValue(25)
    })

    it('renders reimbursement section when reimbursement is available in compensation types', () => {
      const propsWithReimbursementType = {
        ...defaultPropsWithAdditionalEarnings,
        employeeCompensation: {
          ...defaultPropsWithAdditionalEarnings.employeeCompensation,
          fixedCompensations: [
            { name: 'Bonus', amount: '100.00', jobUuid: 'job-1' },
            { name: 'Commission', amount: '50.00', jobUuid: 'job-1' },
          ],
        },
        fixedCompensationTypes: [
          { name: 'Bonus' },
          { name: 'Commission' },
          { name: 'Reimbursement' },
        ],
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...propsWithReimbursementType} />)

      expect(screen.getByRole('heading', { name: 'Reimbursement' })).toBeInTheDocument()

      const reimbursementInput = screen.getByLabelText('Reimbursement')
      expect(reimbursementInput).toHaveValue(0)
    })

    it('does not render reimbursement section when employee has no reimbursement and it is not available', () => {
      const propsWithoutReimbursement = {
        ...defaultPropsWithAdditionalEarnings,
        employeeCompensation: {
          ...defaultPropsWithAdditionalEarnings.employeeCompensation,
          fixedCompensations: [
            { name: 'Bonus', amount: '100.00', jobUuid: 'job-1' },
            { name: 'Commission', amount: '50.00', jobUuid: 'job-1' },
          ],
        },
        fixedCompensationTypes: [{ name: 'Bonus' }, { name: 'Commission' }],
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...propsWithoutReimbursement} />)

      expect(screen.queryByRole('heading', { name: 'Reimbursement' })).not.toBeInTheDocument()
    })

    it('creates missing additional earnings for non-owner employees', () => {
      const propsWithMissingCompensations = {
        ...defaultProps,
        employee: {
          ...defaultProps.employee,
          jobs: [
            {
              ...defaultProps.employee.jobs![0]!,
              compensations: [
                {
                  ...defaultProps.employee.jobs![0]!.compensations![0]!,
                  flsaStatus: FlsaStatusType.Nonexempt,
                },
              ],
            },
          ],
        },
        employeeCompensation: {
          ...defaultProps.employeeCompensation,
          fixedCompensations: [],
        },
        fixedCompensationTypes: [{ name: 'Bonus' }, { name: 'Commission' }],
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...propsWithMissingCompensations} />)

      expect(screen.getByText('Additional earnings')).toBeInTheDocument()

      expect(screen.getByLabelText('Bonus')).toBeInTheDocument()
      expect(screen.getByLabelText('Commission')).toBeInTheDocument()

      expect(screen.getByLabelText('Bonus')).toHaveValue(0)
      expect(screen.getByLabelText('Commission')).toHaveValue(0)
    })

    it('does not create missing compensations for owner employees', () => {
      const ownerProps = {
        ...defaultProps,
        employee: {
          ...defaultProps.employee,
          jobs: [
            {
              ...defaultProps.employee.jobs![0]!,
              compensations: [
                {
                  ...defaultProps.employee.jobs![0]!.compensations![0]!,
                  flsaStatus: FlsaStatusType.Owner,
                },
              ],
            },
          ],
        },
        employeeCompensation: {
          ...defaultProps.employeeCompensation,
          fixedCompensations: [],
        },
        fixedCompensationTypes: [{ name: 'Bonus' }, { name: 'Commission' }],
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...ownerProps} />)

      // Should not show additional earnings section for owners with no existing compensations
      expect(screen.queryByText('Additional earnings')).not.toBeInTheDocument()
    })

    it('submits only non-zero additional earnings for new compensations', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()

      const propsForSubmitTest = {
        ...defaultProps,
        onSave,
        employee: {
          ...defaultProps.employee,
          jobs: [
            {
              ...defaultProps.employee.jobs![0]!,
              compensations: [
                {
                  ...defaultProps.employee.jobs![0]!.compensations![0]!,
                  flsaStatus: FlsaStatusType.Nonexempt,
                },
              ],
            },
          ],
        },
        employeeCompensation: {
          ...defaultProps.employeeCompensation,
          fixedCompensations: [{ name: 'Bonus', amount: '100.00', jobUuid: 'job-1' }],
        },
        fixedCompensationTypes: [
          { name: 'Bonus' },
          { name: 'Commission' },
          { name: 'Cash Tips' },
          { name: 'Reimbursement' },
        ],
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...propsForSubmitTest} />)

      const commissionInput = screen.getByLabelText('Commission')
      await user.clear(commissionInput)
      await user.type(commissionInput, '75.50')

      const cashTipsInput = screen.getByLabelText('Cash tips')
      await user.clear(cashTipsInput)
      await user.type(cashTipsInput, '0')

      const reimbursementInput = screen.getByLabelText('Reimbursement')
      await user.clear(reimbursementInput)
      await user.type(reimbursementInput, '25.00')

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          fixedCompensations: expect.arrayContaining([
            expect.objectContaining({ name: 'Bonus', amount: '100.00', jobUuid: 'job-1' }), // Existing compensation kept
            expect.objectContaining({ name: 'Commission', amount: '75.5', jobUuid: 'job-1' }), // New non-zero compensation added
            expect.objectContaining({ name: 'Reimbursement', amount: '25', jobUuid: 'job-1' }), // New non-zero reimbursement added
            // Cash Tips not included because it's 0 and doesn't exist originally
          ]),
        }),
      )
    })

    it('submits existing compensations even when set to zero', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()

      const propsForZeroTest = {
        ...defaultPropsWithAdditionalEarnings,
        onSave,
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...propsForZeroTest} />)

      const bonusInput = screen.getByLabelText('Bonus')
      await user.clear(bonusInput)
      await user.type(bonusInput, '0')

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          fixedCompensations: expect.arrayContaining([
            expect.objectContaining({ name: 'Bonus', amount: '0', jobUuid: 'job-1' }),
            expect.objectContaining({ name: 'Commission', amount: '50.00', jobUuid: 'job-1' }),
            expect.objectContaining({ name: 'Reimbursement', amount: '25.00', jobUuid: 'job-1' }),
          ]),
        }),
      )
    })
  })

  describe('Payment Method', () => {
    it('pre-selects the correct payment method', () => {
      const compensationWithCheckPayment = {
        ...mockEmployeeCompensation,
        paymentMethod: PaymentMethods.Check,
      }

      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          employeeCompensation={compensationWithCheckPayment}
        />,
      )

      expect(screen.getByLabelText('Check')).toBeChecked()
      expect(screen.getByLabelText('Direct deposit')).not.toBeChecked()
    })

    it('defaults to Direct Deposit when no payment method is specified', () => {
      const compensationWithoutPaymentMethod = {
        ...mockEmployeeCompensation,
        paymentMethod: undefined,
      }

      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          employeeCompensation={compensationWithoutPaymentMethod}
        />,
      )

      expect(screen.getByLabelText('Direct deposit')).toBeChecked()
      expect(screen.getByLabelText('Check')).not.toBeChecked()
    })

    it('updates payment method when form is submitted', async () => {
      const compensationWithDirectDeposit = {
        ...mockEmployeeCompensation,
        paymentMethod: PaymentMethods.DirectDeposit,
      }

      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          employeeCompensation={compensationWithDirectDeposit}
        />,
      )

      const user = userEvent.setup()
      const checkRadio = screen.getByLabelText('Check')
      await user.click(checkRadio)

      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: PaymentMethods.Check,
        }),
      )
    })

    it('includes default Direct Deposit payment method in submission when no existing payment method', async () => {
      const compensationWithoutPaymentMethod = {
        ...mockEmployeeCompensation,
        paymentMethod: undefined,
      }

      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          employeeCompensation={compensationWithoutPaymentMethod}
        />,
      )

      const user = userEvent.setup()
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: PaymentMethods.DirectDeposit,
        }),
      )
    })
  })
})
