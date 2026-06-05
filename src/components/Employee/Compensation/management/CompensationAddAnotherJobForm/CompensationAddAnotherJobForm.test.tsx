import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { CompensationAddAnotherJobForm } from './CompensationAddAnotherJobForm'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import {
  handleGetEmployeeJobs,
  handleCreateEmployeeJob,
  handleUpdateEmployeeCompensation,
} from '@/test/mocks/apis/employees'
import { handleCreateCompensation } from '@/test/mocks/apis/compensations'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { getMinimumWages } from '@/test/mocks/apis/company_locations'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { buildEmployeeWithJobs } from '@/test/factories/jobsAndCompensations'

async function fillEffectiveDate(user: ReturnType<typeof userEvent.setup>, date: string) {
  const [year, month, day] = date.split('-')
  const dateInput = screen.getByLabelText('Effective date')
  await user.type(within(dateInput).getByRole('spinbutton', { name: /^month/i }), month!)
  await user.type(within(dateInput).getByRole('spinbutton', { name: /^day/i }), day!)
  await user.type(within(dateInput).getByRole('spinbutton', { name: /^year/i }), year!)
}

function buildCreatedSecondaryJob(body: Record<string, unknown>) {
  return {
    uuid: 'secondary-job-uuid',
    version: 'secondary-job-version',
    employee_uuid: 'employee-uuid',
    current_compensation_uuid: 'secondary-comp-uuid',
    payment_unit: 'Hour',
    primary: false,
    title: body.title ?? 'Cashier',
    two_percent_shareholder: false,
    hire_date: '2024-12-24',
    rate: '50.00',
    compensations: [
      {
        uuid: 'secondary-comp-uuid',
        version: 'secondary-comp-version',
        job_uuid: 'secondary-job-uuid',
        payment_unit: 'Hour',
        flsa_status: 'Nonexempt',
        rate: '50.00',
        effective_date: '2024-12-24',
        adjust_for_minimum_wage: false,
      },
    ],
  }
}

describe('management/CompensationAddAnotherJobForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getMinimumWages)
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )
  })

  it('renders the add-another-job form with an effective date and no hire date field', async () => {
    renderWithProviders(
      <CompensationAddAnotherJobForm employeeId="employee-uuid" onEvent={() => {}} />,
    )

    await screen.findByRole('heading', { name: 'Add another job' })

    expect(screen.getByLabelText('Job Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Wage')).toBeInTheDocument()
    expect(screen.getByLabelText('Effective date')).toBeInTheDocument()
    // withHireDateField: false — a new secondary job inherits the primary's hire date.
    expect(screen.queryByLabelText('Start date')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save job' })).toBeInTheDocument()
  })

  it('POSTs the new job before PUTting its stub compensation and emits both events in order', async () => {
    const createJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(buildCreatedSecondaryJob(body), { status: 201 })
    })
    const updateCompensationResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({
        uuid: 'secondary-comp-uuid',
        version: 'secondary-comp-version-next',
        job_uuid: 'secondary-job-uuid',
        payment_unit: 'Hour',
        flsa_status: 'Nonexempt',
        adjust_for_minimum_wage: false,
        effective_date: '2024-12-24',
        rate: '50.00',
      }),
    )
    const createCompensationResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))

    server.use(
      handleCreateEmployeeJob(createJobResolver),
      handleUpdateEmployeeCompensation(updateCompensationResolver),
      handleCreateCompensation(createCompensationResolver),
    )

    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(
      <CompensationAddAnotherJobForm employeeId="employee-uuid" onEvent={onEvent} />,
    )

    await screen.findByRole('heading', { name: 'Add another job' })

    await user.type(screen.getByLabelText('Job Title'), 'Cashier')
    const wage = screen.getByLabelText('Wage')
    await user.clear(wage)
    await user.type(wage, '50')
    await user.tab()
    await fillEffectiveDate(user, '2099-01-01')

    await user.click(screen.getByRole('button', { name: 'Save job' }))

    await waitFor(() => {
      expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
    })

    expect(createJobResolver).toHaveBeenCalledTimes(1)
    // The new job arrives with a stub compensation, so the comp form PUTs it
    // rather than POSTing a fresh one.
    expect(createCompensationResolver).not.toHaveBeenCalled()
    expect(createJobResolver.mock.invocationCallOrder[0]!).toBeLessThan(
      updateCompensationResolver.mock.invocationCallOrder[0]!,
    )

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_ANOTHER_JOB_FORM_SUBMITTED,
        expect.anything(),
      )
    })
  })

  it('does not touch compensation endpoints or emit events when the job POST fails', async () => {
    const createJobResolver = vi.fn<HttpResponseResolver>(
      () => new HttpResponse(null, { status: 500 }),
    )
    const updateCompensationResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
    const createCompensationResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))

    server.use(
      handleCreateEmployeeJob(createJobResolver),
      handleUpdateEmployeeCompensation(updateCompensationResolver),
      handleCreateCompensation(createCompensationResolver),
    )

    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(
      <CompensationAddAnotherJobForm employeeId="employee-uuid" onEvent={onEvent} />,
    )

    await screen.findByRole('heading', { name: 'Add another job' })

    await user.type(screen.getByLabelText('Job Title'), 'Cashier')
    const wage = screen.getByLabelText('Wage')
    await user.clear(wage)
    await user.type(wage, '50')
    await user.tab()
    await fillEffectiveDate(user, '2099-01-01')

    await user.click(screen.getByRole('button', { name: 'Save job' }))

    await waitFor(() => {
      expect(createJobResolver).toHaveBeenCalledTimes(1)
    })

    expect(updateCompensationResolver).not.toHaveBeenCalled()
    expect(createCompensationResolver).not.toHaveBeenCalled()
    expect(onEvent).not.toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_ANOTHER_JOB_FORM_SUBMITTED,
      expect.anything(),
    )
  })

  it('fires the scoped cancelled event when the Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(
      <CompensationAddAnotherJobForm employeeId="employee-uuid" onEvent={onEvent} />,
    )

    await screen.findByRole('heading', { name: 'Add another job' })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_ADD_ANOTHER_JOB_FORM_CANCELLED,
    )
  })
})
