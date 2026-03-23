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
import {
  mockEmployee,
  mockTerminatedEmployee,
  mockTerminationCancelable,
  mockTerminationWithPayroll,
  mockTerminationRegularPayroll,
  mockTerminationPast,
} from '@/test/mocks/apis/terminations'

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
        return HttpResponse.json(mockTerminatedEmployee)
      }),
    )
  })

  describe('rendering', () => {
    it('renders success alert with employee name when payrollOption is provided', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} payrollOption="regularPayroll" />)

      await waitFor(() => {
        expect(screen.getByText('John Doe has been successfully terminated')).toBeInTheDocument()
      })
    })

    it('does not render success alert when viewing existing termination', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Termination summary')).toBeInTheDocument()
      })

      expect(
        screen.queryByText('John Doe has been successfully terminated'),
      ).not.toBeInTheDocument()
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

  describe('accessibility', () => {
    it('should not have any accessibility violations', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      const { container } = renderWithProviders(
        <TerminationSummary {...defaultProps} payrollOption="regularPayroll" />,
      )

      await waitFor(() => {
        expect(screen.getByText('John Doe has been successfully terminated')).toBeInTheDocument()
      })

      await expectNoAxeViolations(container, { isIntegrationTest: true })
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
        http.get(`${API_BASE_URL}/v1/employees/:employee_id`, () => {
          return HttpResponse.json(mockEmployee)
        }),
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Edit termination' })).toBeInTheDocument()
      })
    })

    it('hides edit button when effective date is in the past', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationPast])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} payrollOption="regularPayroll" />)

      await waitFor(() => {
        expect(screen.getByText('John Doe has been successfully terminated')).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: 'Edit termination' })).not.toBeInTheDocument()
    })

    it('hides edit button when employee is terminated', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id`, () => {
          return HttpResponse.json(mockTerminatedEmployee)
        }),
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Termination summary')).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: 'Edit termination' })).not.toBeInTheDocument()
    })

    it('shows cancel and edit buttons for regular payroll terminations', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id`, () => {
          return HttpResponse.json(mockEmployee)
        }),
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationRegularPayroll])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} payrollOption="regularPayroll" />)

      await waitFor(() => {
        expect(screen.getByText('John Doe has been successfully terminated')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: 'Cancel termination' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit termination' })).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Run termination payroll' }),
      ).not.toBeInTheDocument()
    })

    it('shows run payroll button when dismissal payroll was selected', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationWithPayroll])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run termination payroll' })).toBeInTheDocument()
      })
    })

    it('shows run off-cycle payroll button when anotherWay was selected', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} payrollOption="anotherWay" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run off-cycle payroll' })).toBeInTheDocument()
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
        expect(screen.getByText('Termination summary')).toBeInTheDocument()
      })

      expect(
        screen.queryByRole('button', { name: 'Run termination payroll' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('emits EMPLOYEE_TERMINATION_CANCELLED event when cancel is confirmed', async () => {
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
        expect(screen.getByRole('button', { name: 'Yes, cancel termination' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Yes, cancel termination' }))

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
        http.get(`${API_BASE_URL}/v1/employees/:employee_id`, () => {
          return HttpResponse.json(mockEmployee)
        }),
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Edit termination' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Edit termination' }))

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
        expect(screen.getByRole('button', { name: 'Run termination payroll' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Run termination payroll' }))

      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL,
        expect.objectContaining({
          employeeId: 'employee-123',
          companyId: 'company-123',
        }),
      )
    })

    it('includes payrollUuid in EMPLOYEE_TERMINATION_RUN_PAYROLL event when provided', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationWithPayroll])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} payrollUuid="payroll-456" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run termination payroll' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Run termination payroll' }))

      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL,
        expect.objectContaining({
          employeeId: 'employee-123',
          companyId: 'company-123',
          payrollUuid: 'payroll-456',
        }),
      )
    })

    it('emits EMPLOYEE_TERMINATION_RUN_PAYROLL with undefined payrollUuid when not provided', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationWithPayroll])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run termination payroll' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Run termination payroll' }))

      const runPayrollCall = onEvent.mock.calls.find(
        (call: unknown[]) => call[0] === componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL,
      )

      expect(runPayrollCall).toBeDefined()
      expect(runPayrollCall![1]).toEqual(
        expect.objectContaining({
          payrollUuid: undefined,
        }),
      )
    })

    it('emits EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL event when off-cycle button is clicked', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} payrollOption="anotherWay" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run off-cycle payroll' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Run off-cycle payroll' }))

      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL,
        expect.objectContaining({
          employeeId: 'employee-123',
          companyId: 'company-123',
        }),
      )
    })
  })

  describe('API error handling', () => {
    it('handles API error when cancelling termination', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json([mockTerminationCancelable])
        }),
        http.delete(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json(
            { errors: [{ message: 'Cannot cancel termination' }] },
            { status: 422 },
          )
        }),
      )

      renderWithProviders(<TerminationSummary {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel termination' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel termination' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Yes, cancel termination' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Yes, cancel termination' }))

      await waitFor(() => {
        expect(onEvent).not.toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_TERMINATION_CANCELLED,
          expect.anything(),
        )
      })
    })
  })
})
