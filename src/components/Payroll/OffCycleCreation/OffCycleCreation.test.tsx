import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createOffCyclePayPeriodDateFormSchema } from '../OffCyclePayPeriodDateForm/OffCyclePayPeriodDateFormTypes'
import { OffCycleCreation } from './OffCycleCreation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockCreateOffCyclePayroll = vi.fn()

vi.mock('@gusto/embedded-api/react-query/employeesList', () => ({
  useEmployeesListSuspense: () => ({
    data: {
      showEmployees: [
        { uuid: 'emp-1', firstName: 'John', lastName: 'Smith', department: 'Sales' },
        { uuid: 'emp-2', firstName: 'Jane', lastName: 'Doe', department: 'Engineering' },
        { uuid: 'emp-3', firstName: 'Alice', lastName: 'Smith', department: 'Marketing' },
        { uuid: 'emp-4', firstName: 'Bob', lastName: 'Adams', department: 'Engineering' },
      ],
    },
    isLoading: false,
  }),
}))

vi.mock('@gusto/embedded-api/react-query/payrollsCreateOffCycle', () => ({
  usePayrollsCreateOffCycleMutation: () => ({
    mutateAsync: mockCreateOffCyclePayroll,
    isPending: false,
  }),
}))

const defaultProps = {
  companyId: 'company-123',
  onEvent: vi.fn(),
}

function renderComponent(props = {}) {
  return renderWithProviders(<OffCycleCreation {...defaultProps} {...props} />)
}

describe('OffCycleCreation', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    Object.defineProperty(HTMLDialogElement.prototype, 'open', {
      get: vi.fn(() => false),
      set: vi.fn(),
      configurable: true,
    })
  })

  describe('rendering', () => {
    it('renders the page title and description', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /new off-cycle payroll/i })).toBeInTheDocument()
      })

      expect(
        screen.getByText(/configure your off-cycle payroll details below/i),
      ).toBeInTheDocument()
    })

    it('renders the reason selection radio group', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Reason')).toBeInTheDocument()
      })

      expect(screen.getByText('Bonus')).toBeInTheDocument()
      expect(screen.getByText('Correction payment')).toBeInTheDocument()
    })

    it('renders the pay period date fields', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument()
      })

      expect(screen.getByRole('group', { name: 'End date' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'Payment date' })).toBeInTheDocument()
    })

    it('renders the check-only payroll checkbox', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /check-only payroll/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('checkbox', { name: /check-only payroll/i })).not.toBeChecked()
    })

    it('renders the continue button', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })
    })
  })

  describe('payrollType initialization', () => {
    it('defaults to bonus reason when no payrollType is provided', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByLabelText('Bonus')).toBeChecked()
      })
    })

    it('initializes with correction reason when payrollType is correction', async () => {
      renderComponent({ payrollType: 'correction' })

      await waitFor(() => {
        expect(screen.getByLabelText('Correction payment')).toBeChecked()
      })

      expect(screen.getByLabelText('Bonus')).not.toBeChecked()
    })
  })

  describe('reason selection', () => {
    it('allows selecting a reason', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Bonus')).toBeInTheDocument()
      })

      const bonusRadio = screen.getByLabelText('Bonus')
      await user.click(bonusRadio)

      expect(bonusRadio).toBeChecked()
    })

    it('allows changing selection between reasons', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Bonus')).toBeInTheDocument()
      })

      const bonusRadio = screen.getByLabelText('Bonus')
      const correctionRadio = screen.getByLabelText('Correction payment')

      await user.click(bonusRadio)
      expect(bonusRadio).toBeChecked()

      await user.click(correctionRadio)
      expect(correctionRadio).toBeChecked()
      expect(bonusRadio).not.toBeChecked()
    })
  })

  describe('check-only payroll toggle', () => {
    it('keeps start and end date fields visible when check-only is selected', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument()
      })

      const checkOnlyCheckbox = screen.getByRole('checkbox', { name: /check-only payroll/i })
      await user.click(checkOnlyCheckbox)

      expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'End date' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'Payment date' })).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('shows validation errors when submitting without required dates', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/start date is required/i)).toBeInTheDocument()
      })
    })

    it('shows date validation errors when submitting check-only without dates', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /check-only payroll/i })).toBeInTheDocument()
      })

      const checkOnlyCheckbox = screen.getByRole('checkbox', { name: /check-only payroll/i })
      await user.click(checkOnlyCheckbox)

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/start date is required/i)).toBeInTheDocument()
      })
      expect(screen.getByText(/payment date is required/i)).toBeInTheDocument()
    })

    it('validates that check-only payrolls cannot have a past payment date (schema)', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const pastDate = new Date('2020-01-01')
      const schema = createOffCyclePayPeriodDateFormSchema((key: string) => key, 'bonus', today)

      const result = schema.safeParse({
        isCheckOnly: true,
        startDate: null,
        endDate: null,
        checkDate: pastDate,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const checkDateErrors = result.error.issues.filter(issue =>
          issue.path.includes('checkDate'),
        )
        expect(checkDateErrors.length).toBeGreaterThan(0)
      }
    })

    it('does not emit an event when form has validation errors', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/start date is required/i)).toBeInTheDocument()
      })

      expect(defaultProps.onEvent).not.toHaveBeenCalled()
    })
  })

  describe('employee selection', () => {
    it('sorts employee dropdown options alphabetically by last name, then first name', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })

      const combobox = screen.getByRole('combobox')
      await user.click(combobox)

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })

      const options = screen.getAllByRole('option')
      const optionLabels = options.map(option => option.textContent)

      expect(optionLabels).toEqual(['Bob Adams', 'Jane Doe', 'Alice Smith', 'John Smith'])
    })

    it('renders the include all employees switch defaulted to off with picker visible', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('switch', { name: /include all employees/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('switch', { name: /include all employees/i })).not.toBeChecked()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('hides the employee picker when include all is toggled on', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('switch', { name: /include all employees/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('combobox')).toBeInTheDocument()

      await user.click(screen.getByRole('switch', { name: /include all employees/i }))

      await waitFor(() => {
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
      })
    })

    it('shows the employee picker when include all is toggled back off', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('switch', { name: /include all employees/i })).toBeInTheDocument()
      })

      const toggle = screen.getByRole('switch', { name: /include all employees/i })

      await user.click(toggle)
      await waitFor(() => {
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
      })

      await user.click(toggle)
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })
    })

    it('sends all employee UUIDs when include all employees is toggled on', async () => {
      mockCreateOffCyclePayroll.mockResolvedValueOnce({
        payrollUnprocessed: { payrollUuid: 'new-payroll-uuid' },
      })

      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('switch', { name: /include all employees/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('switch', { name: /include all employees/i }))

      const startDateGroup = screen.getByRole('group', { name: 'Start date' })
      await user.type(within(startDateGroup).getByRole('spinbutton', { name: /month/i }), '12')
      await user.type(within(startDateGroup).getByRole('spinbutton', { name: /day/i }), '01')
      await user.type(within(startDateGroup).getByRole('spinbutton', { name: /year/i }), '2026')

      const endDateGroup = screen.getByRole('group', { name: 'End date' })
      await user.type(within(endDateGroup).getByRole('spinbutton', { name: /month/i }), '12')
      await user.type(within(endDateGroup).getByRole('spinbutton', { name: /day/i }), '15')
      await user.type(within(endDateGroup).getByRole('spinbutton', { name: /year/i }), '2026')

      const paymentDateGroup = screen.getByRole('group', { name: 'Payment date' })
      await user.type(within(paymentDateGroup).getByRole('spinbutton', { name: /month/i }), '12')
      await user.type(within(paymentDateGroup).getByRole('spinbutton', { name: /day/i }), '15')
      await user.type(within(paymentDateGroup).getByRole('spinbutton', { name: /year/i }), '2026')

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(mockCreateOffCyclePayroll).toHaveBeenCalled()
      })

      const callArgs = mockCreateOffCyclePayroll.mock.calls[0]![0]
      expect(callArgs.request.requestBody.employeeUuids).toEqual([
        'emp-4',
        'emp-2',
        'emp-3',
        'emp-1',
      ])
    })

    it('shows validation error when submitting with no employees selected', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/at least one employee must be selected/i)).toBeInTheDocument()
      })
    })
  })

  describe('tax withholding rates', () => {
    it('renders the tax withholding rates table', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      expect(screen.getByText('Regular hours, regular wages, tips')).toBeInTheDocument()
      expect(screen.getByText('Supplemental wages, bonus wages, commission')).toBeInTheDocument()
      expect(screen.getByText('Reimbursements')).toBeInTheDocument()
    })

    it('opens the modal when Edit is clicked', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByText('Rate for regular wages and earnings')).toBeInTheDocument()
      })
    })

    it('preserves config values when modal Done is clicked without changes', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      expect(screen.getByText(/regular wages, paid every other week/i)).toBeInTheDocument()
      expect(screen.getByText(/supplemental 22%/i)).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByText('Rate for regular wages and earnings')).toBeInTheDocument()
      })

      const doneButton = screen.getByRole('button', { name: /done/i, hidden: true })
      await user.click(doneButton)

      await waitFor(() => {
        expect(screen.queryByText('Rate for regular wages and earnings')).not.toBeInTheDocument()
      })

      expect(screen.getByText(/regular wages, paid every other week/i)).toBeInTheDocument()
      expect(screen.getByText(/supplemental 22%/i)).toBeInTheDocument()
    })

    it('does not change config when modal Cancel is clicked', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      expect(screen.getByText(/regular wages, paid every other week/i)).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByText('Rate for regular wages and earnings')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i, hidden: true })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Rate for regular wages and earnings')).not.toBeInTheDocument()
      })

      expect(screen.getByText(/regular wages, paid every other week/i)).toBeInTheDocument()
    })

    it('shows supplemental tax rate text for bonus payroll by default', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      expect(screen.getByText(/supplemental 22%/i)).toBeInTheDocument()
    })

    it('resets withholding rate when switching from bonus to correction', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      expect(screen.getByText(/supplemental 22%/i)).toBeInTheDocument()

      await user.click(screen.getByLabelText('Correction payment'))

      await waitFor(() => {
        expect(screen.queryByText(/supplemental 22%/i)).not.toBeInTheDocument()
      })
    })

    it('updates supplemental row when changing from supplemental to regular rate', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      expect(screen.getByText(/supplemental 22%/i)).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /rate for supplemental wages/i, hidden: true }),
        ).toBeInTheDocument()
      })

      const regularRateRadio = screen.getByLabelText(/use rate for regular wages/i)
      await user.click(regularRateRadio)

      const doneButton = screen.getByRole('button', { name: /done/i, hidden: true })
      await user.click(doneButton)

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: /rate for supplemental wages/i, hidden: true }),
        ).not.toBeInTheDocument()
      })

      expect(screen.queryByText(/supplemental 22%/i)).not.toBeInTheDocument()
      const regularWagesTexts = screen.getAllByText(/regular wages, paid every other week/i)
      expect(regularWagesTexts).toHaveLength(2)
    })
  })
})
