import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { TerminateEmployee } from './TerminateEmployee'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import {
  mockEmployee,
  mockTerminationCancelable,
  mockTerminationPayPeriods,
} from '@/test/mocks/apis/terminations'
import payrollFixture from '@/test/mocks/fixtures/post-v1-companies-company_id-payrolls.json'

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
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
        return HttpResponse.json([])
      }),
      http.post(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
        return HttpResponse.json(mockTerminationCancelable, { status: 201 })
      }),
      http.get(
        `${API_BASE_URL}/v1/companies/:company_id/pay_periods/unprocessed_termination_pay_periods`,
        () => {
          return HttpResponse.json(mockTerminationPayPeriods)
        },
      ),
      http.post(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () => {
        return HttpResponse.json(payrollFixture)
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

  describe('accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })

      await expectNoAxeViolations(container, { isIntegrationTest: true })
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
          screen.getByText(/Runs a final payroll that automatically pays out unused PTO/),
        ).toBeInTheDocument()
      })

      expect(
        screen.getByText(/Same as dismissal payrolls, except there won.t be a separate record/),
      ).toBeInTheDocument()

      expect(
        screen.getByText(/You can run an off-cycle payroll to manually calculate/),
      ).toBeInTheDocument()
    })
  })

  describe('successful submission', () => {
    async function fillDateAndSubmit() {
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })

      const dateInput = screen.getByRole('group', { name: /last day of work/i })
      await user.type(within(dateInput).getByRole('spinbutton', { name: /^month/i }), '06')
      await user.type(within(dateInput).getByRole('spinbutton', { name: /^day/i }), '15')
      await user.type(within(dateInput).getByRole('spinbutton', { name: /^year/i }), '2026')

      await user.click(screen.getByRole('button', { name: 'Terminate employee' }))
    }

    it('emits EMPLOYEE_TERMINATION_DONE with payrollUuid when dismissal payroll is selected', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await fillDateAndSubmit()

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_TERMINATION_DONE,
          expect.objectContaining({
            employeeId: 'employee-123',
            payrollOption: 'dismissalPayroll',
            payrollUuid: expect.any(String),
          }),
        )
      })
    })

    it('emits EMPLOYEE_TERMINATION_PAYROLL_CREATED when off-cycle payroll is created', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await fillDateAndSubmit()

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_TERMINATION_PAYROLL_CREATED,
          expect.objectContaining({
            payrolls: expect.any(Array),
          }),
        )
      })
    })

    it('emits EMPLOYEE_TERMINATION_CREATED for new terminations', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await fillDateAndSubmit()

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_TERMINATION_CREATED,
          expect.objectContaining({
            payrollOption: 'dismissalPayroll',
            runTerminationPayroll: true,
          }),
        )
      })
    })

    it('emits EMPLOYEE_TERMINATION_DONE without payrollUuid when regular payroll is selected', async () => {
      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Regular payroll')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Regular payroll'))

      const dateInput = screen.getByRole('group', { name: /last day of work/i })
      await user.type(within(dateInput).getByRole('spinbutton', { name: /^month/i }), '06')
      await user.type(within(dateInput).getByRole('spinbutton', { name: /^day/i }), '15')
      await user.type(within(dateInput).getByRole('spinbutton', { name: /^year/i }), '2026')

      await user.click(screen.getByRole('button', { name: 'Terminate employee' }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_TERMINATION_DONE,
          expect.objectContaining({
            employeeId: 'employee-123',
            payrollOption: 'regularPayroll',
            payrollUuid: undefined,
          }),
        )
      })
    })
  })

  describe('API error handling', () => {
    it('handles API error when creating termination', async () => {
      server.use(
        http.post(`${API_BASE_URL}/v1/employees/:employee_id/terminations`, () => {
          return HttpResponse.json(
            { errors: [{ message: 'Employee cannot be terminated' }] },
            { status: 422 },
          )
        }),
      )

      renderWithProviders(<TerminateEmployee {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Terminate employee' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Terminate employee' }))

      await waitFor(() => {
        expect(onEvent).not.toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_TERMINATION_DONE,
          expect.anything(),
        )
      })
    })
  })
})
