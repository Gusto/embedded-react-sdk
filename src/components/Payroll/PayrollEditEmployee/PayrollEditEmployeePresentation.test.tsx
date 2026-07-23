import { expect, describe, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import {
  type Employee,
  EmployeePaymentMethod1,
} from '@gusto/embedded-api/models/components/employee'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import { PayrollEmployeeCompensationsTypePaymentMethod as PaymentMethods } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import { FlsaStatusType } from '@gusto/embedded-api/models/components/flsastatustype'
import userEvent from '@testing-library/user-event'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { PayrollEditEmployeePresentation } from './PayrollEditEmployeePresentation'
import { PayrollCategory } from '@/components/Payroll/payrollTypes'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { mockUseContainerBreakpoints } from '@/test/setup'

const mockEmployee: Employee = {
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
  ],
  reimbursements: [
    {
      uuid: 'reimb-1',
      description: 'Travel expenses',
      amount: '100.00',
      recurring: false,
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
  grossPay: '1787.50',
  netPay: '1500.00',
  checkAmount: '1500.00',
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
  ],
  reimbursements: [
    {
      uuid: 'reimb-1',
      description: 'Travel expenses',
      amount: '100.00',
      recurring: false,
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
  payPeriodStartDate: '2024-01-15',
  paySchedule: {
    uuid: 'pay-schedule-123',
    frequency: 'Every week' as const,
    anchorPayDate: new RFCDate('2022-01-01'),
    anchorEndOfPayPeriod: new RFCDate('2022-01-07'),
    version: '2024-04-01',
  },
}

describe('PayrollEditEmployeePresentation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseContainerBreakpoints.mockReturnValue(['base'])
  })

  it('renders the component with employee data', async () => {
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
    expect(screen.getByText('Edit payroll for John Doe')).toBeInTheDocument()
  })

  it('displays gross pay correctly', async () => {
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

    await waitFor(() => {
      expect(
        screen.getByText('Gross pay: $2,691.35 (excluding reimbursements)'),
      ).toBeInTheDocument()
    })
  })

  it('renders job titles when employee has multiple jobs', async () => {
    const employee: Employee = {
      uuid: 'emp-1',
      firstName: 'Jane',
      lastName: 'Smith',
      paymentMethod: EmployeePaymentMethod1.DirectDeposit,
      jobs: [
        { uuid: 'job-1', title: 'Designer', primary: true },
        { uuid: 'job-2', title: 'Manager', primary: false },
      ],
    }
    const compensation: PayrollEmployeeCompensationsType = {
      employeeUuid: 'emp-1',
      hourlyCompensations: [
        { name: 'Regular Hours', hours: '40', jobUuid: 'job-1' },
        { name: 'Regular Hours', hours: '20', jobUuid: 'job-2' },
      ],
    }

    renderWithProviders(
      <PayrollEditEmployeePresentation
        {...defaultProps}
        employee={employee}
        employeeCompensation={compensation}
      />,
    )

    expect(await screen.findByText('Designer')).toBeInTheDocument()
    expect(await screen.findByText('Manager')).toBeInTheDocument()
  })

  it('does not render job title when employee has only one job', async () => {
    const employee: Employee = {
      uuid: 'emp-1',
      firstName: 'Jane',
      lastName: 'Smith',
      paymentMethod: EmployeePaymentMethod1.DirectDeposit,
      jobs: [{ uuid: 'job-1', title: 'Designer', primary: true }],
    }
    const compensation: PayrollEmployeeCompensationsType = {
      employeeUuid: 'emp-1',
      hourlyCompensations: [{ name: 'Regular Hours', hours: '40', jobUuid: 'job-1' }],
    }

    renderWithProviders(
      <PayrollEditEmployeePresentation
        {...defaultProps}
        employee={employee}
        employeeCompensation={compensation}
      />,
    )

    expect(await screen.findByLabelText('Regular Hours')).toBeInTheDocument()
    expect(screen.queryByText('Designer')).not.toBeInTheDocument()
  })

  it('renders form fields for existing compensations', async () => {
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getAllByLabelText('Regular Hours')).toHaveLength(2)
    })
    expect(screen.getByLabelText('Overtime')).toBeInTheDocument()
  })

  it('pre-fills form fields with existing compensation hours', async () => {
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

    const regularHoursInputs = await screen.findAllByLabelText('Regular Hours')

    expect(regularHoursInputs).toHaveLength(2)
    expect(regularHoursInputs[0]).toHaveValue(40)
    expect(regularHoursInputs[1]).toHaveValue(20)

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

    const regularHoursInputs = await screen.findAllByLabelText('Regular Hours')
    const regularHoursJob1Input = regularHoursInputs[0]!
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
    expect(regularHoursInputs[0]).toHaveValue(40)

    const overtimeInput = screen.getByLabelText('Overtime')
    expect(overtimeInput).toHaveValue(5)

    expect(regularHoursInputs[1]).toHaveValue(20)
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
    expect(regularHoursInputs[0]).toHaveValue(null)
  })

  it('preserves existing compensation data when updating hours', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} onSave={onSave} />)

    const regularHoursInputs = await screen.findAllByLabelText('Regular Hours')
    const regularHoursJob1Input = regularHoursInputs[0]!
    await user.clear(regularHoursJob1Input)
    await user.type(regularHoursJob1Input, '42')

    const saveButton = screen.getByText('Save')
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeUuid: 'emp-1',
        grossPay: '1787.50',
        netPay: '1500.00',
        checkAmount: '1500.00',
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
        expect(screen.getByText(/32\.0.*remaining/)).toBeInTheDocument()
      })
    })

    it('does not show balance for unlimited policies', async () => {
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Sick Hours')).toBeInTheDocument()
      })

      const remainingTexts = screen.queryAllByText(/remaining/)
      expect(remainingTexts).toHaveLength(1)
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

      await waitFor(() => {
        expect(screen.getByText(/32\.0.*remaining/)).toBeInTheDocument()
      })

      await user.clear(vacationInput)
      await user.type(vacationInput, '10')

      await waitFor(() => {
        expect(screen.getByText(/30\.0.*remaining/)).toBeInTheDocument()
      })
    })

    it('coerces blank time off values to zero on save', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} onSave={onSave} />)

      const vacationInput = await screen.findByLabelText('Vacation Hours')
      await user.clear(vacationInput)

      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          paidTimeOff: expect.arrayContaining([
            expect.objectContaining({
              name: 'Vacation Hours',
              hours: '0',
            }),
          ]),
        }),
      )
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

      expect(screen.queryByText('Time off')).not.toBeInTheDocument()
    })

    it('renders unused time off payout section for dismissal payrolls', async () => {
      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          payrollCategory={PayrollCategory.Dismissal}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Unused time off payout')).toBeInTheDocument()
      })
    })

    it('shows remaining balance in unused time off payout section for dismissal payrolls', async () => {
      const compensationWithPayout: PayrollEmployeeCompensationsType = {
        ...mockEmployeeCompensation,
        paidTimeOff: [
          { name: 'Vacation Hours', hours: '8.0', finalPayoutUnusedHoursInput: '10' },
          { name: 'Sick Hours', hours: '0.0', finalPayoutUnusedHoursInput: '0' },
        ],
      }

      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          payrollCategory={PayrollCategory.Dismissal}
          employeeCompensation={compensationWithPayout}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Unused time off payout')).toBeInTheDocument()
      })

      const remainingTexts = screen.getAllByText(/remaining/)
      expect(remainingTexts.length).toBeGreaterThanOrEqual(2)
    })

    it('does not render unused time off payout section for regular payrolls', async () => {
      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          payrollCategory={PayrollCategory.Regular}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Time off')).toBeInTheDocument()
      })
      expect(screen.queryByText('Unused time off payout')).not.toBeInTheDocument()
    })

    it('submits finalPayoutUnusedHoursInput when editing payout hours on a termination payroll', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()

      const compensationWithPayout: PayrollEmployeeCompensationsType = {
        ...mockEmployeeCompensation,
        paidTimeOff: [
          { name: 'Vacation Hours', hours: '8.0', finalPayoutUnusedHoursInput: '10' },
          { name: 'Sick Hours', hours: '0.0', finalPayoutUnusedHoursInput: '0' },
        ],
      }

      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          onSave={onSave}
          payrollCategory={PayrollCategory.Dismissal}
          employeeCompensation={compensationWithPayout}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Unused time off payout')).toBeInTheDocument()
      })

      const payoutBox = screen
        .getAllByTestId('data-box')
        .find(box => box.textContent.includes('Unused time off payout'))
      const vacationPayoutInput = payoutBox
        ? within(payoutBox).getByRole('spinbutton', { name: /Vacation Hours/ })
        : undefined

      if (vacationPayoutInput) {
        await user.clear(vacationPayoutInput)
        await user.type(vacationPayoutInput, '20')
      }

      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          paidTimeOff: expect.arrayContaining([
            expect.objectContaining({
              name: 'Vacation Hours',
              finalPayoutUnusedHoursInput: expect.any(String),
            }),
          ]),
        }),
      )
    })

    it('coerces blank final payout values to zero on save for dismissal payrolls', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()

      const compensationWithPayout: PayrollEmployeeCompensationsType = {
        ...mockEmployeeCompensation,
        paidTimeOff: [
          { name: 'Vacation Hours', hours: '8.0', finalPayoutUnusedHoursInput: '10' },
          { name: 'Sick Hours', hours: '0.0', finalPayoutUnusedHoursInput: '5' },
        ],
      }

      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          onSave={onSave}
          payrollCategory={PayrollCategory.Dismissal}
          employeeCompensation={compensationWithPayout}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Unused time off payout')).toBeInTheDocument()
      })

      const payoutBox = screen
        .getAllByTestId('data-box')
        .find(box => box.textContent.includes('Unused time off payout'))
      const vacationPayoutInput = payoutBox
        ? within(payoutBox).getByRole('spinbutton', { name: /Vacation Hours/ })
        : undefined

      if (vacationPayoutInput) {
        await user.clear(vacationPayoutInput)
      }

      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          paidTimeOff: expect.arrayContaining([
            expect.objectContaining({
              name: 'Vacation Hours',
              finalPayoutUnusedHoursInput: '0',
            }),
          ]),
        }),
      )
    })

    it('does not include finalPayoutUnusedHoursInput for non-dismissal payrolls', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()

      const compensationWithPto: PayrollEmployeeCompensationsType = {
        ...mockEmployeeCompensation,
        paidTimeOff: [
          { name: 'Vacation Hours', hours: '8.0', finalPayoutUnusedHoursInput: '10' },
          { name: 'Sick Hours', hours: '0.0' },
        ],
      }

      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          onSave={onSave}
          payrollCategory={PayrollCategory.Bonus}
          employeeCompensation={compensationWithPto}
        />,
      )

      const saveButton = await screen.findByText('Save')
      await user.click(saveButton)

      const savedCompensation = onSave.mock.calls[0]![0] as PayrollEmployeeCompensationsType
      for (const pto of savedCompensation.paidTimeOff ?? []) {
        expect(pto).not.toHaveProperty('finalPayoutUnusedHoursInput')
      }
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
              hours: '8',
            }),
            expect.objectContaining({
              name: 'Sick Hours',
              hours: '4',
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

    it('renders reimbursement rows when present', async () => {
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Reimbursements' })).toBeInTheDocument()
      })
      expect(screen.getByText('Travel expenses')).toBeInTheDocument()
      expect(screen.getByText('$100.00')).toBeInTheDocument()
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
          fixedCompensations: [],
          reimbursements: [
            {
              uuid: 'reimb-1',
              description: 'Travel expenses',
              amount: '100.00',
              recurring: false,
            },
          ],
        },
        fixedCompensationTypes: [],
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...ownerProps} />)

      expect(screen.queryByText('Additional earnings')).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Reimbursements' })).toBeInTheDocument()
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
          ]),
        }),
      )
    })
  })

  describe('Additional Earnings updates', () => {
    const defaultPropsWithAdditionalEarnings = {
      ...defaultProps,
      employeeCompensation: {
        ...defaultProps.employeeCompensation,
        fixedCompensations: [
          { name: 'Bonus', amount: '100.00', jobUuid: 'job-1' },
          { name: 'Commission', amount: '50.00', jobUuid: 'job-1' },
        ],
        reimbursements: [
          {
            uuid: 'reimb-1',
            description: 'Travel expenses',
            amount: '25.00',
            recurring: false,
          },
        ],
      },
      fixedCompensationTypes: [
        { name: 'Bonus' },
        { name: 'Commission' },
        { name: 'Paycheck Tips' },
        { name: 'Cash Tips' },
        { name: 'Correction Payment' },
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

    it('renders reimbursement rows when employee has reimbursements', () => {
      renderWithProviders(
        <PayrollEditEmployeePresentation {...defaultPropsWithAdditionalEarnings} />,
      )

      expect(screen.getByRole('heading', { name: 'Reimbursements' })).toBeInTheDocument()
      expect(screen.getByText('Travel expenses')).toBeInTheDocument()
      expect(screen.getByText('$25.00')).toBeInTheDocument()
    })

    it('always renders the reimbursements section header and empty-state Add button when withReimbursements is true', () => {
      const propsWithoutReimbursements = {
        ...defaultPropsWithAdditionalEarnings,
        employeeCompensation: {
          ...defaultPropsWithAdditionalEarnings.employeeCompensation,
          reimbursements: [],
        },
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...propsWithoutReimbursements} />)

      expect(screen.getByRole('heading', { name: 'Reimbursements' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add one-time reimbursement' })).toBeInTheDocument()
    })

    it('does not render reimbursement section when withReimbursements is false', () => {
      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultPropsWithAdditionalEarnings}
          withReimbursements={false}
        />,
      )

      expect(screen.queryByRole('heading', { name: 'Reimbursements' })).not.toBeInTheDocument()
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
          reimbursements: [],
        },
        fixedCompensationTypes: [{ name: 'Bonus' }, { name: 'Commission' }, { name: 'Cash Tips' }],
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...propsForSubmitTest} />)

      const commissionInput = await screen.findByLabelText('Commission')
      await user.clear(commissionInput)
      await user.type(commissionInput, '75.50')

      const cashTipsInput = screen.getByLabelText('Cash tips')
      await user.clear(cashTipsInput)
      await user.type(cashTipsInput, '0')

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          fixedCompensations: expect.arrayContaining([
            expect.objectContaining({ name: 'Bonus', amount: '100.00', jobUuid: 'job-1' }),
            expect.objectContaining({ name: 'Commission', amount: '75.5', jobUuid: 'job-1' }),
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

  describe('Dynamic Gross Pay Calculation', () => {
    it('calculates gross pay correctly with simple inputs', async () => {
      const user = userEvent.setup()

      const simpleEmployee: Employee = {
        ...defaultProps.employee,
        jobs: [
          {
            uuid: 'job-1',
            title: 'Test Job',
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
        ],
      }

      const simpleCompensation: PayrollEmployeeCompensationsType = {
        employeeUuid: 'emp-1',
        hourlyCompensations: [
          {
            name: 'Regular Hours',
            hours: '10.000',
            jobUuid: 'job-1',
            flsaStatus: 'Nonexempt',
          },
        ],
        fixedCompensations: [],
        paidTimeOff: [],
        paymentMethod: 'Direct Deposit',
      }

      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          employee={simpleEmployee}
          employeeCompensation={simpleCompensation}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText('Gross pay: $250.00 (excluding reimbursements)'),
        ).toBeInTheDocument()
      })

      const regularHoursInput = await screen.findByLabelText('Regular Hours')
      await user.clear(regularHoursInput)
      await user.type(regularHoursInput, '8')

      await waitFor(() => {
        expect(
          screen.getByText('Gross pay: $200.00 (excluding reimbursements)'),
        ).toBeInTheDocument()
      })
    })

    it('includes bonus amount in gross pay for off-cycle bonus payroll', async () => {
      const user = userEvent.setup()

      const bonusEmployee: Employee = {
        ...defaultProps.employee,
        jobs: [
          {
            uuid: 'job-1',
            title: 'Test Job',
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
        ],
      }

      const bonusCompensation: PayrollEmployeeCompensationsType = {
        employeeUuid: 'emp-1',
        hourlyCompensations: [],
        fixedCompensations: [{ name: 'Bonus', amount: '0.00', jobUuid: 'job-1' }],
        paidTimeOff: [],
        paymentMethod: 'Direct Deposit',
      }

      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          employee={bonusEmployee}
          employeeCompensation={bonusCompensation}
          payrollCategory={PayrollCategory.Bonus}
          fixedCompensationTypes={[{ name: 'Bonus' }]}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Gross pay: $0.00 (excluding reimbursements)')).toBeInTheDocument()
      })

      const bonusInput = await screen.findByLabelText('Bonus')
      await user.clear(bonusInput)
      await user.type(bonusInput, '500')

      await waitFor(() => {
        expect(
          screen.getByText('Gross pay: $500.00 (excluding reimbursements)'),
        ).toBeInTheDocument()
      })
    })

    it('displays zero gross pay when no compensation provided', async () => {
      renderWithProviders(
        <PayrollEditEmployeePresentation {...defaultProps} employeeCompensation={undefined} />,
      )

      await waitFor(() => {
        expect(screen.getByText('Gross pay: $0.00 (excluding reimbursements)')).toBeInTheDocument()
      })
    })
  })

  describe('Payment Method Visibility Based on Direct Deposit Setup', () => {
    it('shows payment method control when employee has direct deposit set up', () => {
      renderWithProviders(
        <PayrollEditEmployeePresentation {...defaultProps} hasDirectDepositSetup={true} />,
      )

      expect(screen.getByText('Payment method')).toBeInTheDocument()
      expect(screen.getByLabelText('Direct deposit')).toBeInTheDocument()
      expect(screen.getByLabelText('Check')).toBeInTheDocument()
    })

    it('hides payment method control when employee does not have direct deposit set up', () => {
      renderWithProviders(
        <PayrollEditEmployeePresentation {...defaultProps} hasDirectDepositSetup={false} />,
      )

      expect(screen.queryByText('Payment method')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Direct deposit')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Check')).not.toBeInTheDocument()
    })

    it('shows payment method control by default when hasDirectDepositSetup is not provided', () => {
      const propsWithoutDirectDepositFlag = {
        ...defaultProps,
        hasDirectDepositSetup: undefined,
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...propsWithoutDirectDepositFlag} />)

      expect(screen.getByText('Payment method')).toBeInTheDocument()
      expect(screen.getByLabelText('Direct deposit')).toBeInTheDocument()
      expect(screen.getByLabelText('Check')).toBeInTheDocument()
    })

    it('allows form submission without payment method when employee has no direct deposit', async () => {
      const compensationWithCheckPayment = {
        ...mockEmployeeCompensation,
        paymentMethod: PaymentMethods.Check,
      }

      renderWithProviders(
        <PayrollEditEmployeePresentation
          {...defaultProps}
          hasDirectDepositSetup={false}
          employeeCompensation={compensationWithCheckPayment}
        />,
      )

      const user = userEvent.setup()
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalled()
      })

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: PaymentMethods.Check,
        }),
      )
    })
  })

  describe('Itemized Reimbursements', () => {
    const propsWithNoReimbursements = {
      ...defaultProps,
      employeeCompensation: {
        ...mockEmployeeCompensation,
        reimbursements: [],
      },
    }

    it('renders the empty-state Add reimbursement button when no reimbursements exist', async () => {
      renderWithProviders(<PayrollEditEmployeePresentation {...propsWithNoReimbursements} />)

      expect(
        await screen.findByRole('button', { name: 'Add one-time reimbursement' }),
      ).toBeInTheDocument()
    })

    it('appends a new editable row when Add is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayrollEditEmployeePresentation {...propsWithNoReimbursements} />)

      const addButton = await screen.findByRole('button', { name: 'Add one-time reimbursement' })
      await user.click(addButton)

      expect(await screen.findByLabelText(/Description/i)).toBeInTheDocument()
      expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    })

    it('submits a newly added reimbursement row', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <PayrollEditEmployeePresentation {...propsWithNoReimbursements} onSave={onSave} />,
      )

      const addButton = await screen.findByRole('button', { name: 'Add one-time reimbursement' })
      await user.click(addButton)

      const descriptionInput = await screen.findByLabelText(/Description/i)
      await user.type(descriptionInput, 'Office supplies')

      const amountInput = screen.getByLabelText('Amount')
      await user.clear(amountInput)
      await user.type(amountInput, '42.50')

      await user.click(screen.getByRole('button', { name: 'Save reimbursement' }))

      expect(await screen.findByText('Office supplies')).toBeInTheDocument()
      expect(screen.getByText('$42.50')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          reimbursements: [
            expect.objectContaining({
              description: 'Office supplies',
              amount: '42.50',
              uuid: null,
              recurring: false,
            }),
          ],
        }),
      )
    })

    it('cancels the inline add form without appending a row', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <PayrollEditEmployeePresentation {...propsWithNoReimbursements} onSave={onSave} />,
      )

      const addButton = await screen.findByRole('button', { name: 'Add one-time reimbursement' })
      await user.click(addButton)

      const descriptionInput = await screen.findByLabelText(/Description/i)
      await user.type(descriptionInput, 'Office supplies')

      await user.click(screen.getByRole('button', { name: 'Cancel reimbursement' }))

      expect(screen.queryByLabelText(/Description/i)).not.toBeInTheDocument()
      expect(screen.queryByText('Office supplies')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          reimbursements: [],
        }),
      )
    })

    it('does not append a zero-amount draft when Save reimbursement is clicked', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <PayrollEditEmployeePresentation {...propsWithNoReimbursements} onSave={onSave} />,
      )

      const addButton = await screen.findByRole('button', { name: 'Add one-time reimbursement' })
      await user.click(addButton)

      const descriptionInput = await screen.findByLabelText(/Description/i)
      await user.type(descriptionInput, 'Office supplies')

      await user.click(screen.getByRole('button', { name: 'Save reimbursement' }))

      expect(screen.queryByText('Office supplies')).not.toBeInTheDocument()
    })

    it('soft-deletes an existing reimbursement on Remove (keeps uuid, sets amount to 0)', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<PayrollEditEmployeePresentation {...defaultProps} onSave={onSave} />)

      const removeButton = await screen.findByRole('button', { name: /Remove Travel expenses/i })
      await user.click(removeButton)

      expect(screen.queryByText('Travel expenses')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          reimbursements: [
            expect.objectContaining({
              uuid: 'reimb-1',
              description: 'Travel expenses',
              amount: '0',
            }),
          ],
        }),
      )
    })

    it('removes a server-returned unnamed orphan reimbursement (no uuid) on Save', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()

      const propsWithUnnamedOrphan = {
        ...defaultProps,
        employeeCompensation: {
          ...mockEmployeeCompensation,
          reimbursements: [
            {
              uuid: null,
              description: null,
              amount: '45.00',
              recurring: false,
            },
          ],
        },
      }

      renderWithProviders(
        <PayrollEditEmployeePresentation {...propsWithUnnamedOrphan} onSave={onSave} />,
      )

      const removeButton = await screen.findByRole('button', { name: /Remove Reimbursement/i })
      await user.click(removeButton)

      expect(screen.queryByText('$45.00')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Save' }))

      const savedCompensation = onSave.mock.calls[0]![0] as PayrollEmployeeCompensationsType
      expect(savedCompensation.reimbursements).toEqual([])
    })

    it('renders recurring reimbursements as read-only (no Remove button, no editable fields)', async () => {
      const propsWithRecurring = {
        ...defaultProps,
        employeeCompensation: {
          ...mockEmployeeCompensation,
          reimbursements: [
            {
              uuid: 'reimb-recurring-1',
              description: 'Phone stipend',
              amount: '50.00',
              recurring: true,
            },
          ],
        },
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...propsWithRecurring} />)

      expect(await screen.findByText('Phone stipend')).toBeInTheDocument()
      expect(screen.getByText('$50.00')).toBeInTheDocument()
      expect(screen.getByText('Recurring')).toBeInTheDocument()
      expect(screen.queryByLabelText(/Description/i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Remove/i })).not.toBeInTheDocument()
    })

    it('hides the entire section when withReimbursements is false', async () => {
      renderWithProviders(
        <PayrollEditEmployeePresentation {...defaultProps} withReimbursements={false} />,
      )

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'Reimbursements' })).not.toBeInTheDocument()
      })
      expect(
        screen.queryByRole('button', { name: 'Add one-time reimbursement' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('Off-Cycle Reimbursements', () => {
    const offCycleEmployeeCompensation: PayrollEmployeeCompensationsType = {
      employeeUuid: 'emp-1',
      hourlyCompensations: [],
      fixedCompensations: [
        { name: 'Bonus', amount: '0.00', jobUuid: 'job-1' },
        { name: 'Reimbursement', amount: '75.50', jobUuid: 'job-1' },
      ],
      paidTimeOff: [],
      paymentMethod: 'Direct Deposit',
      version: 'v1',
    }

    const offCycleProps = {
      ...defaultProps,
      employeeCompensation: offCycleEmployeeCompensation,
      payrollCategory: PayrollCategory.Bonus,
      fixedCompensationTypes: [{ name: 'Bonus' }, { name: 'Reimbursement' }],
    }

    it('renders a single Reimbursement input pre-filled from fixed_compensations on off-cycle', async () => {
      renderWithProviders(<PayrollEditEmployeePresentation {...offCycleProps} />)

      const reimbursementInput = await screen.findByLabelText('Reimbursement')
      expect(reimbursementInput).toHaveValue(75.5)
    })

    it('does not render the itemized Add link on off-cycle', async () => {
      renderWithProviders(<PayrollEditEmployeePresentation {...offCycleProps} />)

      await screen.findByLabelText('Reimbursement')
      expect(
        screen.queryByRole('button', { name: 'Add one-time reimbursement' }),
      ).not.toBeInTheDocument()
    })

    it('defaults the single field to 0.00 when no Reimbursement entry exists yet', async () => {
      const propsWithoutReimbursement = {
        ...offCycleProps,
        employeeCompensation: {
          ...offCycleEmployeeCompensation,
          fixedCompensations: [{ name: 'Bonus', amount: '0.00', jobUuid: 'job-1' }],
        },
      }

      renderWithProviders(<PayrollEditEmployeePresentation {...propsWithoutReimbursement} />)

      const reimbursementInput = await screen.findByLabelText('Reimbursement')
      expect(reimbursementInput).toHaveValue(0)
    })

    it('submits the updated Reimbursement in fixed_compensations on off-cycle', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<PayrollEditEmployeePresentation {...offCycleProps} onSave={onSave} />)

      const reimbursementInput = await screen.findByLabelText('Reimbursement')
      await user.clear(reimbursementInput)
      await user.type(reimbursementInput, '125')

      await user.click(screen.getByRole('button', { name: 'Save' }))

      const savedCompensation = onSave.mock.calls[0]![0] as PayrollEmployeeCompensationsType
      expect(savedCompensation.fixedCompensations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Reimbursement',
            amount: '125',
            jobUuid: 'job-1',
          }),
        ]),
      )
      expect(savedCompensation.reimbursements).toEqual([])
    })

    it('hides the reimbursement section entirely when withReimbursements is false on off-cycle', async () => {
      renderWithProviders(
        <PayrollEditEmployeePresentation {...offCycleProps} withReimbursements={false} />,
      )

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'Reimbursements' })).not.toBeInTheDocument()
      })
      expect(screen.queryByLabelText('Reimbursement')).not.toBeInTheDocument()
    })
  })
})
