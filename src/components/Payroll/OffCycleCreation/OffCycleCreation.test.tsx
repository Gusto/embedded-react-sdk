import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OffCycleCreation } from './OffCycleCreation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

vi.mock('@gusto/embedded-api/react-query/employeesList', () => ({
  useEmployeesListSuspense: () => ({
    data: {
      showEmployees: [
        { uuid: 'emp-1', firstName: 'Jane', lastName: 'Doe', department: 'Engineering' },
        { uuid: 'emp-2', firstName: 'John', lastName: 'Smith', department: 'Sales' },
      ],
    },
    isLoading: false,
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
    it('hides start and end date fields when check-only is selected', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument()
      })

      const checkOnlyCheckbox = screen.getByRole('checkbox', { name: /check-only payroll/i })
      await user.click(checkOnlyCheckbox)

      await waitFor(() => {
        expect(screen.queryByRole('group', { name: 'Start date' })).not.toBeInTheDocument()
      })
      expect(screen.queryByRole('group', { name: 'End date' })).not.toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'Payment date' })).toBeInTheDocument()
    })

    it('shows start and end date fields when check-only is deselected', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /check-only payroll/i })).toBeInTheDocument()
      })

      const checkOnlyCheckbox = screen.getByRole('checkbox', { name: /check-only payroll/i })

      await user.click(checkOnlyCheckbox)
      await waitFor(() => {
        expect(screen.queryByRole('group', { name: 'Start date' })).not.toBeInTheDocument()
      })

      await user.click(checkOnlyCheckbox)
      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument()
      })
      expect(screen.getByRole('group', { name: 'End date' })).toBeInTheDocument()
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

    it('shows payment date required error when submitting check-only without payment date', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /check-only payroll/i })).toBeInTheDocument()
      })

      const checkOnlyCheckbox = screen.getByRole('checkbox', { name: /check-only payroll/i })
      await user.click(checkOnlyCheckbox)

      await waitFor(() => {
        expect(screen.queryByRole('group', { name: 'Start date' })).not.toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/payment date is required/i)).toBeInTheDocument()
      })
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
    it('renders the include all employees switch defaulted to on', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('switch', { name: /include all employees/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('switch', { name: /include all employees/i })).toBeChecked()
    })

    it('shows the employee picker when include all is toggled off', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('switch', { name: /include all employees/i })).toBeInTheDocument()
      })

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()

      await user.click(screen.getByRole('switch', { name: /include all employees/i }))

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })
    })

    it('hides the employee picker when include all is toggled back on', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('switch', { name: /include all employees/i })).toBeInTheDocument()
      })

      const toggle = screen.getByRole('switch', { name: /include all employees/i })

      await user.click(toggle)
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })

      await user.click(toggle)
      await waitFor(() => {
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
      })
    })

    it('shows validation error when submitting with no employees selected', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('switch', { name: /include all employees/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('switch', { name: /include all employees/i }))

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/at least one employee must be selected/i)).toBeInTheDocument()
      })
    })
  })
})
