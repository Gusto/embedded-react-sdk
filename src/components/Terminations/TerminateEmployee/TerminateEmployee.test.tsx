import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { TerminateEmployee } from './TerminateEmployee'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

const mockEmployee = {
  uuid: 'employee-123',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  company_uuid: 'company-123',
  terminated: false,
  onboarded: true,
}

const mockTermination = {
  uuid: 'termination-123',
  employee_uuid: 'employee-123',
  effective_date: '2025-01-15',
  run_termination_payroll: true,
  active: false,
  cancelable: true,
}

const mockTerminationPayPeriods = [
  {
    employee_uuid: 'employee-123',
    employee_name: 'John Doe',
    start_date: '2025-01-01',
    end_date: '2025-01-15',
    check_date: '2025-01-20',
    pay_schedule_uuid: 'pay-schedule-123',
  },
]

const mockPayrollPrepared = {
  payroll_uuid: 'payroll-123',
  company_uuid: 'company-123',
  off_cycle: true,
  off_cycle_reason: 'Dismissed employee',
}

describe('TerminateEmployee', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    employeeId: 'employee-123',
    companyId: 'company-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id`, () => {
        return HttpResponse.json(mockEmployee)
      }),
      http.post(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
        return HttpResponse.json(mockTermination)
      }),
      http.get(
        `${API_BASE_URL}/v1/companies/:company_id/pay_periods/unprocessed_termination_pay_periods`,
        () => {
          return HttpResponse.json(mockTerminationPayPeriods)
        },
      ),
      http.post(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
        return HttpResponse.json(mockPayrollPrepared)
      }),
    )
  })

  describe('rendering', () => {
    it('renders the termination form with employee name', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })

      expect(
        screen.getByText(/Set their last day of work and choose how to handle their final payroll/),
      ).toBeInTheDocument()
    })

    it('renders the date picker for last day of work', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Last day of work')).toBeInTheDocument()
      })
    })

    it('renders all payroll options', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Dismissal payroll')).toBeInTheDocument()
      })

      expect(screen.getByText('Regular payroll')).toBeInTheDocument()
      expect(screen.getByText('Another way')).toBeInTheDocument()
    })

    it('renders submit and cancel buttons', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Terminate employee' })).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('shows validation error when submitting without date', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Terminate employee' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Terminate employee' }))

      await waitFor(() => {
        expect(screen.getByText('Last day of work is required')).toBeInTheDocument()
      })
    })

    it('has dismissal payroll selected by default', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Dismissal payroll')).toBeChecked()
      })
    })
  })

  describe('cancel action', () => {
    it('emits CANCEL event when cancel button is clicked', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
    })
  })

  describe('payroll option selection', () => {
    it('allows selecting dismissal payroll option', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Dismissal payroll')).toBeInTheDocument()
      })

      const dismissalRadio = screen.getByLabelText('Dismissal payroll')
      await user.click(dismissalRadio)

      expect(dismissalRadio).toBeChecked()
    })

    it('allows selecting regular payroll option', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Regular payroll')).toBeInTheDocument()
      })

      const regularRadio = screen.getByLabelText('Regular payroll')
      await user.click(regularRadio)

      expect(regularRadio).toBeChecked()
    })

    it('allows selecting another way option', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Another way')).toBeInTheDocument()
      })

      const anotherWayRadio = screen.getByLabelText('Another way')
      await user.click(anotherWayRadio)

      expect(anotherWayRadio).toBeChecked()
    })

    it('shows option descriptions', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            /Run an off-cycle payroll to pay the employee their final wages immediately/,
          ),
        ).toBeInTheDocument()
      })

      expect(
        screen.getByText(
          /The employee will receive their final wages on their current pay schedule/,
        ),
      ).toBeInTheDocument()

      expect(screen.getByText(/Handle the final payment manually/)).toBeInTheDocument()
    })
  })
})
