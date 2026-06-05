import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { CompensationEditPendingJobForm } from './CompensationEditPendingJobForm'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import {
  handleGetEmployeeJobs,
  handleUpdateEmployeeJob,
  handleUpdateEmployeeCompensation,
} from '@/test/mocks/apis/employees'
import { handleCreateCompensation } from '@/test/mocks/apis/compensations'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { getMinimumWages } from '@/test/mocks/apis/company_locations'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { buildEmployeeWithJobs } from '@/test/factories/jobsAndCompensations'

function makeUpdateJobResponse(overrides: Record<string, unknown> = {}) {
  return HttpResponse.json({
    uuid: 'job-uuid',
    version: 'job-version-next',
    employee_uuid: 'employee-uuid',
    current_compensation_uuid: 'compensation-uuid',
    payment_unit: 'Hour',
    primary: true,
    title: 'My Job',
    hire_date: '2024-12-24',
    two_percent_shareholder: false,
    state_wc_covered: false,
    state_wc_class_code: null,
    rate: '100.00',
    compensations: [],
    ...overrides,
  })
}

function makeUpdateCompensationResponse(overrides: Record<string, unknown> = {}) {
  return HttpResponse.json({
    uuid: 'compensation-future-uuid',
    version: 'compensation-future-version-2',
    job_uuid: 'job-uuid',
    payment_unit: 'Hour',
    flsa_status: 'Nonexempt',
    adjust_for_minimum_wage: false,
    effective_date: '2099-01-01',
    rate: '125.00',
    ...overrides,
  })
}

describe('management/CompensationEditPendingJobForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getMinimumWages)
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'futureCompPending' })),
      ),
    )
  })

  it('prefills form values from the pending compensation', async () => {
    renderWithProviders(
      <CompensationEditPendingJobForm
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-future-uuid"
        isNewJob={false}
        isPrimaryJob={true}
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    // Rate pre-filled from the pending comp ($125/hr)
    expect(screen.getByLabelText('Wage')).toHaveValue('125.00')
    expect(
      screen.getByRole('button', { name: /Paid by the hour/i, expanded: false }),
    ).toBeInTheDocument()
  })

  it('prefills the effective date from the pending compensation', async () => {
    renderWithProviders(
      <CompensationEditPendingJobForm
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-future-uuid"
        isNewJob={false}
        isPrimaryJob={true}
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    // The pending comp's effective date (2099-01-01) should be pre-filled
    const dateInput = screen.getByLabelText('Effective date')
    expect(within(dateInput).getByRole('spinbutton', { name: /^year/i })).toHaveValue(2099)
  })

  it('renders exactly one Job title input (steady-state edit; title is owned by the comp form)', async () => {
    renderWithProviders(
      <CompensationEditPendingJobForm
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-future-uuid"
        isNewJob={false}
        isPrimaryJob={true}
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    // For steady-state edits, `useJobForm` runs with `withTitleField: false`
    // and `useCompensationForm` owns the title field — exactly one Job title
    // input is rendered (the comp form's).
    expect(screen.getAllByLabelText('Job title')).toHaveLength(1)
  })

  it('submits PUT /v1/jobs/:id before PUT /v1/compensations/:id (not POST)', async () => {
    const updateJobResolver = vi.fn<HttpResponseResolver>(() => makeUpdateJobResponse())
    const updateCompensationResolver = vi.fn<HttpResponseResolver>(() =>
      makeUpdateCompensationResponse(),
    )
    const createCompensationResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({}, { status: 201 }),
    )

    server.use(
      handleUpdateEmployeeJob(updateJobResolver),
      handleUpdateEmployeeCompensation(updateCompensationResolver),
      handleCreateCompensation(createCompensationResolver),
    )

    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(
      <CompensationEditPendingJobForm
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-future-uuid"
        isNewJob={false}
        isPrimaryJob={true}
        onEvent={onEvent}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    const rateInput = screen.getByLabelText('Wage')
    await user.clear(rateInput)
    await user.type(rateInput, '150')
    await user.tab()

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
    })

    expect(updateJobResolver).toHaveBeenCalledTimes(1)
    expect(createCompensationResolver).not.toHaveBeenCalled()

    // Job PUT must precede compensation PUT
    expect(updateJobResolver.mock.invocationCallOrder[0]!).toBeLessThan(
      updateCompensationResolver.mock.invocationCallOrder[0]!,
    )

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED,
        expect.objectContaining({ uuid: 'compensation-future-uuid' }),
      )
    })
  })

  it('sends the compensationId on the PUT path', async () => {
    let updateCompensationPath: string | null = null
    const updateCompensationResolver = vi.fn<HttpResponseResolver>(({ request }) => {
      updateCompensationPath = new URL(request.url).pathname
      return makeUpdateCompensationResponse()
    })

    server.use(
      handleUpdateEmployeeJob(() => makeUpdateJobResponse()),
      handleUpdateEmployeeCompensation(updateCompensationResolver),
    )

    const user = userEvent.setup()

    renderWithProviders(
      <CompensationEditPendingJobForm
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-future-uuid"
        isNewJob={false}
        isPrimaryJob={true}
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
    })

    expect(updateCompensationPath).toBe('/v1/compensations/compensation-future-uuid')
  })

  it('does not PUT compensation if the job PUT fails', async () => {
    const updateJobResolver = vi.fn<HttpResponseResolver>(
      () => new HttpResponse(null, { status: 500 }),
    )
    const updateCompensationResolver = vi.fn<HttpResponseResolver>(() =>
      makeUpdateCompensationResponse(),
    )

    server.use(
      handleUpdateEmployeeJob(updateJobResolver),
      handleUpdateEmployeeCompensation(updateCompensationResolver),
    )

    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(
      <CompensationEditPendingJobForm
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-future-uuid"
        isNewJob={false}
        isPrimaryJob={true}
        onEvent={onEvent}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateJobResolver).toHaveBeenCalledTimes(1)
    })

    expect(updateCompensationResolver).not.toHaveBeenCalled()
    expect(onEvent).not.toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_EDIT_FORM_SUBMITTED,
      expect.anything(),
    )
  })

  it('puts title on the compensation body and omits it from the job body', async () => {
    let updateJobBody: Record<string, unknown> | null = null
    const updateJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateJobBody = (await request.json()) as Record<string, unknown>
      return makeUpdateJobResponse()
    })

    let updateCompensationBody: Record<string, unknown> | null = null
    const updateCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateCompensationBody = (await request.json()) as Record<string, unknown>
      return makeUpdateCompensationResponse()
    })

    server.use(
      handleUpdateEmployeeJob(updateJobResolver),
      handleUpdateEmployeeCompensation(updateCompensationResolver),
    )

    const user = userEvent.setup()

    renderWithProviders(
      <CompensationEditPendingJobForm
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-future-uuid"
        isNewJob={false}
        isPrimaryJob={true}
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    const titleInput = screen.getByLabelText('Job title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Senior Engineer')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
    })

    expect(updateCompensationBody).toMatchObject({ title: 'Senior Engineer' })
    expect(updateJobBody).not.toHaveProperty('title')
  })
})

describe('management/CompensationEditPendingJobForm — primary new job (isNewJob + isPrimaryJob)', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getMinimumWages)
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'newPrimaryJob' })),
      ),
    )
  })

  it('shows Hire date field and hides Effective date field', async () => {
    renderWithProviders(
      <CompensationEditPendingJobForm
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-uuid"
        isNewJob={true}
        isPrimaryJob={true}
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    expect(screen.getByLabelText('Hire date')).toBeInTheDocument()
    expect(screen.queryByLabelText('Effective date')).toBeNull()
  })

  it('prefills the Hire date field from the job hire_date', async () => {
    renderWithProviders(
      <CompensationEditPendingJobForm
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-uuid"
        isNewJob={true}
        isPrimaryJob={true}
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    const dateInput = screen.getByLabelText('Hire date')
    expect(within(dateInput).getByRole('spinbutton', { name: /^year/i })).toHaveValue(2099)
    expect(within(dateInput).getByRole('spinbutton', { name: /^month/i })).toHaveValue(6)
    expect(within(dateInput).getByRole('spinbutton', { name: /^day/i })).toHaveValue(1)
  })

  it('sends the same date to PUT /v1/jobs hire_date and PUT /v1/compensations effective_date', async () => {
    let updateJobBody: Record<string, unknown> | null = null
    const updateJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateJobBody = (await request.json()) as Record<string, unknown>
      return makeUpdateJobResponse({ hire_date: '2099-06-01' })
    })

    let updateCompensationBody: Record<string, unknown> | null = null
    const updateCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateCompensationBody = (await request.json()) as Record<string, unknown>
      return makeUpdateCompensationResponse({ effective_date: '2099-06-01' })
    })

    server.use(
      handleUpdateEmployeeJob(updateJobResolver),
      handleUpdateEmployeeCompensation(updateCompensationResolver),
    )

    const user = userEvent.setup()

    renderWithProviders(
      <CompensationEditPendingJobForm
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-uuid"
        isNewJob={true}
        isPrimaryJob={true}
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
    })

    expect(updateJobResolver).toHaveBeenCalledTimes(1)
    expect(updateJobBody).toMatchObject({ hire_date: '2099-06-01' })
    expect(updateCompensationBody).toMatchObject({ effective_date: '2099-06-01' })
  })
})

describe('management/CompensationEditPendingJobForm — secondary new job (isNewJob, not primary)', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getMinimumWages)
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'newSecondaryJob' })),
      ),
    )
  })

  it('shows Effective date and hides Hire date', async () => {
    renderWithProviders(
      <CompensationEditPendingJobForm
        employeeId="employee-uuid"
        jobId="secondary-job-uuid"
        compensationId="secondary-compensation-uuid"
        isNewJob={true}
        isPrimaryJob={false}
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    expect(screen.getByLabelText('Effective date')).toBeInTheDocument()
    expect(screen.queryByLabelText('Hire date')).toBeNull()
  })

  it('prefills the Job title from the loaded compensation and the wage from the pending compensation', async () => {
    renderWithProviders(
      <CompensationEditPendingJobForm
        employeeId="employee-uuid"
        jobId="secondary-job-uuid"
        compensationId="secondary-compensation-uuid"
        isNewJob={true}
        isPrimaryJob={false}
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    expect(screen.getByLabelText('Job title')).toHaveValue('My Secondary Job')
    expect(screen.getByLabelText('Wage')).toHaveValue('50.00')
  })
})
