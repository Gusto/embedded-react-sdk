import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { TerminationFlow } from './TerminationFlow'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import {
  handleGetEmployee,
  handleCreateTermination,
  handleGetTerminations,
  handleDeleteTermination,
  handleGetUnprocessedTerminationPeriods,
  handleCreateOffCyclePayroll,
  mockEmployee,
  mockTerminationCancelable,
  mockTerminationWithPayroll,
  mockTerminationPayPeriods,
  mockPayrollPrepared,
} from '@/test/mocks/apis/terminations'

async function fillLastDayOfWork(
  date: { month: number; day: number; year: number },
  userInstance: UserEvent,
) {
  const dateInput = await screen.findByRole('group', { name: 'Last day of work' })
  const segments = within(dateInput).getAllByRole('spinbutton')
  const [monthSegment, daySegment, yearSegment] = segments
  await userInstance.type(monthSegment!, String(date.month))
  await userInstance.type(daySegment!, String(date.day))
  await userInstance.type(yearSegment!, String(date.year))
}

describe('TerminationFlow', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    companyId: 'company-123',
    employeeId: 'employee-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      handleGetEmployee(() => HttpResponse.json(mockEmployee)),
      handleCreateTermination(() => HttpResponse.json(mockTerminationCancelable, { status: 201 })),
      handleGetTerminations(() => HttpResponse.json([mockTerminationCancelable])),
      handleDeleteTermination(() => new HttpResponse(null, { status: 204 })),
      handleGetUnprocessedTerminationPeriods(() => HttpResponse.json(mockTerminationPayPeriods)),
      handleCreateOffCyclePayroll(() => HttpResponse.json(mockPayrollPrepared)),
    )
  })

  async function submitTerminationForm() {
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
    })

    await fillLastDayOfWork({ month: 3, day: 15, year: 2026 }, user)

    await user.click(screen.getByRole('button', { name: 'Terminate employee' }))
  }

  async function waitForSummary() {
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Termination summary' })).toBeInTheDocument()
    })
  }

  describe('initial render', () => {
    it('renders the termination form as the initial state', async () => {
      renderWithProviders(<TerminationFlow {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })

      expect(screen.getByText('Last day of work')).toBeInTheDocument()
      expect(screen.getByText('Dismissal payroll')).toBeInTheDocument()
    })
  })

  describe('form to summary transition', () => {
    it('transitions to summary after successful termination submission', async () => {
      renderWithProviders(<TerminationFlow {...defaultProps} />)

      await submitTerminationForm()
      await waitForSummary()

      expect(screen.getByText('John Doe has been successfully terminated')).toBeInTheDocument()
      expect(screen.getByText('Last day of work')).toBeInTheDocument()
      expect(screen.getByText('Last pay day')).toBeInTheDocument()
    })

    it('emits EMPLOYEE_TERMINATION_DONE after submission', async () => {
      renderWithProviders(<TerminationFlow {...defaultProps} />)

      await submitTerminationForm()
      await waitForSummary()

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_TERMINATION_DONE,
          expect.objectContaining({
            employeeId: 'employee-123',
            payrollOption: 'dismissalPayroll',
          }),
        )
      })
    })
  })

  describe('summary to form via edit', () => {
    it('returns to form when edit button is clicked, then back to summary on re-submit', async () => {
      renderWithProviders(<TerminationFlow {...defaultProps} />)

      await submitTerminationForm()
      await waitForSummary()

      await user.click(screen.getByRole('button', { name: 'Edit termination' }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })

      await fillLastDayOfWork({ month: 4, day: 1, year: 2026 }, user)

      await user.click(screen.getByRole('button', { name: 'Terminate employee' }))

      await waitForSummary()
    })
  })

  describe('summary to form via cancel', () => {
    it('returns to form with success alert after cancelling termination', async () => {
      renderWithProviders(<TerminationFlow {...defaultProps} />)

      await submitTerminationForm()
      await waitForSummary()

      await user.click(screen.getByRole('button', { name: 'Cancel termination' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Yes, cancel termination' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Yes, cancel termination' }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })

      expect(screen.getByText('Termination has been cancelled successfully')).toBeInTheDocument()
    })

    it('emits EMPLOYEE_TERMINATION_CANCELLED after cancellation', async () => {
      renderWithProviders(<TerminationFlow {...defaultProps} />)

      await submitTerminationForm()
      await waitForSummary()

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
  })

  describe('summary to execution via run payroll', () => {
    it('emits EMPLOYEE_TERMINATION_RUN_PAYROLL when run payroll is clicked', async () => {
      server.use(handleGetTerminations(() => HttpResponse.json([mockTerminationWithPayroll])))

      renderWithProviders(<TerminationFlow {...defaultProps} />)

      await submitTerminationForm()
      await waitForSummary()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run termination payroll' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Run termination payroll' }))

      await waitFor(() => {
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

  describe('payroll option variations', () => {
    it('submits with regular payroll option', async () => {
      renderWithProviders(<TerminationFlow {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })

      await fillLastDayOfWork({ month: 3, day: 15, year: 2026 }, user)

      await user.click(screen.getByLabelText('Regular payroll'))

      await user.click(screen.getByRole('button', { name: 'Terminate employee' }))

      await waitForSummary()

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_TERMINATION_DONE,
          expect.objectContaining({
            payrollOption: 'regularPayroll',
          }),
        )
      })
    })

    it('submits with another way option and shows off-cycle button on summary', async () => {
      server.use(
        handleCreateTermination(() =>
          HttpResponse.json(
            { ...mockTerminationCancelable, run_termination_payroll: false },
            { status: 201 },
          ),
        ),
      )

      renderWithProviders(<TerminationFlow {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })

      await fillLastDayOfWork({ month: 3, day: 15, year: 2026 }, user)

      await user.click(screen.getByLabelText('Another way'))

      await user.click(screen.getByRole('button', { name: 'Terminate employee' }))

      await waitForSummary()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run off-cycle payroll' })).toBeInTheDocument()
      })
    })
  })

  describe('summary to createOffCyclePayroll via run off-cycle payroll', () => {
    it('transitions to createOffCyclePayroll state and emits OFF_CYCLE_CREATED', async () => {
      server.use(
        handleCreateTermination(() =>
          HttpResponse.json(
            { ...mockTerminationCancelable, run_termination_payroll: false },
            { status: 201 },
          ),
        ),
        handleGetTerminations(() =>
          HttpResponse.json([{ ...mockTerminationCancelable, run_termination_payroll: false }]),
        ),
      )

      renderWithProviders(<TerminationFlow {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })

      await fillLastDayOfWork({ month: 3, day: 15, year: 2026 }, user)

      await user.click(screen.getByLabelText('Another way'))

      await user.click(screen.getByRole('button', { name: 'Terminate employee' }))

      await waitForSummary()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Run off-cycle payroll' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Run off-cycle payroll' }))

      await waitFor(
        () => {
          expect(onEvent).toHaveBeenCalledWith(
            componentEvents.OFF_CYCLE_CREATED,
            expect.objectContaining({
              payrollUuid: expect.any(String),
            }),
          )
        },
        { timeout: 5000 },
      )
    })
  })

  describe('accessibility', () => {
    it('should not have any accessibility violations on form state', async () => {
      const { container } = renderWithProviders(<TerminationFlow {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Terminate John Doe' })).toBeInTheDocument()
      })

      await expectNoAxeViolations(container, { isIntegrationTest: true })
    })

    it('should not have any accessibility violations on summary state', async () => {
      const { container } = renderWithProviders(<TerminationFlow {...defaultProps} />)

      await submitTerminationForm()
      await waitForSummary()

      await expectNoAxeViolations(container, { isIntegrationTest: true })
    })
  })
})
