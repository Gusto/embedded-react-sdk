import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { ListView } from './ListView'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import {
  handleGetEmployeeJobs,
  handleDeleteEmployeeJob,
  handleDeleteEmployeeCompensation,
} from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { buildEmployeeWithJobs } from '@/test/factories/jobsAndCompensations'

describe('management/ListView', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('single ineligible (exempt) employee', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleExempt' })),
        ),
      )
    })

    it('renders the primary job card with compensation data', async () => {
      renderWithProviders(<ListView employeeId="employee-uuid" onEvent={() => {}} />)

      expect(await screen.findByText('Primary job')).toBeInTheDocument()
      expect(screen.getByText('My Job')).toBeInTheDocument()
      expect(screen.getByText('Salary/No overtime')).toBeInTheDocument()
    })

    it('does not render an Add another job CTA (employee is not eligible)', async () => {
      renderWithProviders(<ListView employeeId="employee-uuid" onEvent={() => {}} />)

      await screen.findByText('Primary job')
      expect(screen.queryByRole('button', { name: /add another job/i })).not.toBeInTheDocument()
    })

    it('does not render a secondary jobs table', async () => {
      renderWithProviders(<ListView employeeId="employee-uuid" onEvent={() => {}} />)

      await screen.findByText('Primary job')
      expect(screen.queryByText('Additional jobs')).not.toBeInTheDocument()
    })

    it('emits EMPLOYEE_COMPENSATION_EDIT with the current job + compensation ids when Edit is clicked', async () => {
      const onEvent = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<ListView employeeId="employee-uuid" onEvent={onEvent} />)

      await screen.findByText('Primary job')
      await user.click(screen.getByRole('button', { name: /edit/i }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_COMPENSATION_EDIT, {
        jobId: 'job-uuid',
        compensationId: 'compensation-uuid',
      })
    })
  })

  describe('single eligible (nonexempt) employee', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
      )
    })

    it('renders an Add another job CTA when the primary FLSA status is Nonexempt', async () => {
      renderWithProviders(<ListView employeeId="employee-uuid" onEvent={() => {}} />)

      await screen.findByText('Primary job')
      expect(screen.getByRole('button', { name: /add another job/i })).toBeInTheDocument()
    })

    it('emits EMPLOYEE_JOB_ADD when Add another job is clicked', async () => {
      const onEvent = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<ListView employeeId="employee-uuid" onEvent={onEvent} />)

      await screen.findByText('Primary job')
      await user.click(screen.getByRole('button', { name: /add another job/i }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_JOB_ADD)
    })
  })

  describe('multi-job employee', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
        ),
      )
    })

    it('renders the primary card without an inline Add CTA and a secondary jobs section instead', async () => {
      renderWithProviders(<ListView employeeId="employee-uuid" onEvent={() => {}} />)

      await screen.findByText('Primary job')
      expect(screen.getByText('Additional jobs')).toBeInTheDocument()
      expect(screen.getByText('An additional job')).toBeInTheDocument()
    })

    async function findSecondaryCard() {
      await screen.findByTestId('data-view')
      const cards = screen.getAllByTestId('data-card')
      const card = cards.find(c => c.textContent && c.textContent.includes('An additional job'))
      if (!card) throw new Error('Expected secondary job card')
      return card
    }

    it('emits EMPLOYEE_COMPENSATION_EDIT for a secondary job via its hamburger menu', async () => {
      const onEvent = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(<ListView employeeId="employee-uuid" onEvent={onEvent} />)

      const card = await findSecondaryCard()
      await user.click(within(card).getByRole('button', { name: 'Job actions' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_COMPENSATION_EDIT, {
        jobId: 'job-uuid-2',
        compensationId: 'compensation-uuid-2',
      })
    })

    it('deletes a secondary job and emits EMPLOYEE_JOB_DELETED', async () => {
      const onEvent = vi.fn()
      const user = userEvent.setup()

      let deletedJobPath: string | null = null
      const deleteJobResolver = vi.fn(({ request }) => {
        deletedJobPath = new URL(request.url).pathname
        return new HttpResponse(null, { status: 204 }) as never
      })
      server.use(handleDeleteEmployeeJob(deleteJobResolver))

      renderWithProviders(<ListView employeeId="employee-uuid" onEvent={onEvent} />)

      const card = await findSecondaryCard()
      await user.click(within(card).getByRole('button', { name: 'Job actions' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))

      const dialog = await screen.findByRole('dialog')
      await user.click(within(dialog).getByRole('button', { name: 'Delete job' }))

      await waitFor(() => {
        expect(deleteJobResolver).toHaveBeenCalledTimes(1)
      })
      expect(deletedJobPath).toBe('/v1/jobs/job-uuid-2')
      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_JOB_DELETED, {
        jobId: 'job-uuid-2',
      })
    })
  })

  describe('pending future-dated compensation change', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'futureCompPending' })),
        ),
      )
    })

    it('shows a banner for the pending change with its effective date', async () => {
      renderWithProviders(<ListView employeeId="employee-uuid" onEvent={() => {}} />)

      expect(
        await screen.findByText(/A change is scheduled to take effect on January 1, 2099/i),
      ).toBeInTheDocument()
    })

    it('cancels the pending change via the dialog and emits EMPLOYEE_COMPENSATION_CHANGE_CANCELLED', async () => {
      const onEvent = vi.fn()
      const user = userEvent.setup()

      let deletedCompPath: string | null = null
      const deleteCompensationResolver = vi.fn(({ request }) => {
        deletedCompPath = new URL(request.url).pathname
        return new HttpResponse(null, { status: 204 }) as never
      })
      server.use(handleDeleteEmployeeCompensation(deleteCompensationResolver))

      renderWithProviders(<ListView employeeId="employee-uuid" onEvent={onEvent} />)

      await screen.findByText(/A change is scheduled/i)
      await user.click(screen.getByRole('button', { name: 'Cancel change' }))

      const dialog = await screen.findByRole('dialog')
      await user.click(within(dialog).getByRole('button', { name: 'Cancel change' }))

      await waitFor(() => {
        expect(deleteCompensationResolver).toHaveBeenCalledTimes(1)
      })
      expect(deletedCompPath).toBe('/v1/compensations/compensation-future-uuid')
      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_COMPENSATION_CHANGE_CANCELLED, {
        jobId: 'job-uuid',
        compensationId: 'compensation-future-uuid',
      })
    })
  })
})
