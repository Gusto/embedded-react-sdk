import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { TerminationSummary } from './TerminationSummary'
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
  terminated: true,
  onboarded: true,
}

const getFutureDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().split('T')[0]
}

const getPastDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return date.toISOString().split('T')[0]
}

const mockTerminationCancelable = {
  uuid: 'termination-123',
  employee_uuid: 'employee-123',
  effective_date: getFutureDate(),
  run_termination_payroll: false,
  active: true,
  cancelable: true,
}

const mockTerminationWithPayroll = {
  uuid: 'termination-456',
  employee_uuid: 'employee-123',
  effective_date: getFutureDate(),
  run_termination_payroll: true,
  active: true,
  cancelable: false,
}

const mockTerminationPast = {
  uuid: 'termination-789',
  employee_uuid: 'employee-123',
  effective_date: getPastDate(),
  run_termination_payroll: false,
  active: true,
  cancelable: false,
}

describe('TerminationSummary', () => {
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
    )
  })

  describe('rendering', () => {
    it('renders success alert with employee name', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('John Doe has been successfully terminated')).toBeInTheDocument()
      })
    })

    it('displays termination dates correctly', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Last day of work')).toBeInTheDocument()
      })

      expect(screen.getByText('Last pay day')).toBeInTheDocument()
    })
  })

  describe('conditional buttons', () => {
    it('shows cancel button when termination is cancelable', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel termination' })).toBeInTheDocument()
      })
    })

    it('shows edit button when effective date is in the future', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Edit dismissal' })).toBeInTheDocument()
      })
    })

    it('hides edit button when effective date is in the past', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationPast])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('John Doe has been successfully terminated')).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: 'Edit dismissal' })).not.toBeInTheDocument()
    })

    it('shows run payroll button when dismissal payroll was selected', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationWithPayroll])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run dismissal payroll' })).toBeInTheDocument()
      })
    })

    it('hides run payroll button when dismissal payroll was not selected', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('John Doe has been successfully terminated')).toBeInTheDocument()
      })

      expect(
        screen.queryByRole('button', { name: 'Run dismissal payroll' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('emits EMPLOYEE_TERMINATION_CANCELLED event when cancel button is clicked', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
        http.delete(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return new HttpResponse(null, { status: 204 })
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel termination' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel termination' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_TERMINATION_CANCELLED,
          expect.objectContaining({
            employeeId: 'employee-123',
          }),
        )
      })
    })

    it('emits EMPLOYEE_TERMINATION_EDIT event when edit button is clicked', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Edit dismissal' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Edit dismissal' }))

      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_TERMINATION_EDIT,
        expect.objectContaining({
          employeeId: 'employee-123',
        }),
      )
    })

    it('emits EMPLOYEE_TERMINATION_RUN_PAYROLL event when run payroll button is clicked', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationWithPayroll])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run dismissal payroll' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Run dismissal payroll' }))

      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL,
        expect.objectContaining({
          employeeId: 'employee-123',
          companyId: 'company-123',
        }),
      )
    })
  })
})
