import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { EditCompensation } from './EditCompensation'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { handleGetEmployeeJobs, handleUpdateEmployeeJob } from '@/test/mocks/apis/employees'
import { handleCreateCompensation } from '@/test/mocks/apis/compensations'
import { handleGetCompanyFederalTaxes } from '@/test/mocks/apis/company_federal_taxes'
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

describe('management/EditCompensation', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getMinimumWages)
  })

  it('prefills form values from the current job and compensation', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )

    renderWithProviders(
      <EditCompensation employeeId="employee-uuid" jobId="job-uuid" onEvent={() => {}} />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    expect(screen.getByLabelText('Job title')).toHaveValue('My Job')
    expect(screen.getByLabelText('Wage')).toHaveValue('100.00')
    expect(
      screen.getByRole('button', { name: /Paid by the hour/i, expanded: false }),
    ).toBeInTheDocument()
  })

  it('leaves the effective date blank so the user must choose a future date', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )

    renderWithProviders(
      <EditCompensation employeeId="employee-uuid" jobId="job-uuid" onEvent={() => {}} />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    // An empty date spinbutton reports value 0 (no year selected).
    const dateInput = screen.getByLabelText('Effective date')
    expect(within(dateInput).getByRole('spinbutton', { name: /^year/i })).toHaveValue(0)
  })

  it('does not expose the job title field (title belongs on the compensation form)', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )

    renderWithProviders(
      <EditCompensation employeeId="employee-uuid" jobId="job-uuid" onEvent={() => {}} />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    // Only the compensation-form title field is rendered, never the job-form one.
    // useJobForm with withTitleField:false produces undefined for Fields.Title,
    // so just one labelled input should exist.
    expect(screen.getAllByLabelText('Job title')).toHaveLength(1)
  })

  it('submits PUT /v1/jobs/:id before POST /v1/jobs/:jobId/compensations', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )

    const updateJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      await request.json()
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
      })
    })

    const createCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(
        {
          uuid: 'new-compensation-uuid',
          version: 'compensation-version-next',
          job_uuid: 'job-uuid',
          payment_unit: body.payment_unit ?? 'Hour',
          flsa_status: body.flsa_status ?? 'Nonexempt',
          adjust_for_minimum_wage: false,
          effective_date: body.effective_date ?? '2099-01-01',
          rate: body.rate ?? '100.00',
        },
        { status: 201 },
      )
    })

    server.use(
      handleUpdateEmployeeJob(updateJobResolver),
      handleCreateCompensation(createCompensationResolver),
    )

    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(
      <EditCompensation employeeId="employee-uuid" jobId="job-uuid" onEvent={onEvent} />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    const rateInput = screen.getByLabelText('Wage')
    await user.clear(rateInput)
    await user.type(rateInput, '125')
    await user.tab()

    await fillEffectiveDate(user, '2099-01-01')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(createCompensationResolver).toHaveBeenCalledTimes(1)
    })

    expect(updateJobResolver).toHaveBeenCalledTimes(1)
    expect(updateJobResolver.mock.invocationCallOrder[0]!).toBeLessThan(
      createCompensationResolver.mock.invocationCallOrder[0]!,
    )

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_COMPENSATION_UPDATED,
        expect.objectContaining({ uuid: 'new-compensation-uuid' }),
      )
    })
  })

  it('does not POST compensation if the job PUT fails', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )

    const updateJobResolver = vi.fn<HttpResponseResolver>(
      () => new HttpResponse(null, { status: 500 }),
    )
    const createCompensationResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(
        {
          uuid: 'new-compensation-uuid',
          version: 'compensation-version-next',
          job_uuid: 'job-uuid',
          payment_unit: 'Hour',
          flsa_status: 'Nonexempt',
          adjust_for_minimum_wage: false,
          effective_date: '2099-01-01',
          rate: '100.00',
        },
        { status: 201 },
      ),
    )

    server.use(
      handleUpdateEmployeeJob(updateJobResolver),
      handleCreateCompensation(createCompensationResolver),
    )

    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(
      <EditCompensation employeeId="employee-uuid" jobId="job-uuid" onEvent={onEvent} />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    const rateInput = screen.getByLabelText('Wage')
    await user.clear(rateInput)
    await user.type(rateInput, '125')
    await user.tab()

    await fillEffectiveDate(user, '2099-01-01')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateJobResolver).toHaveBeenCalledTimes(1)
    })

    expect(createCompensationResolver).not.toHaveBeenCalled()
    expect(onEvent).not.toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_JOB_UPDATED,
      expect.anything(),
    )
    expect(onEvent).not.toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_COMPENSATION_UPDATED,
      expect.anything(),
    )
  })

  it('puts 2% shareholder on the job body, not the compensation body', async () => {
    server.use(
      handleGetCompanyFederalTaxes(() =>
        HttpResponse.json({
          version: 'federal-tax-version-1',
          tax_payer_type: 'C-Corporation',
          taxable_as_scorp: true,
          filing_form: '944',
          has_ein: true,
          ein_verified: false,
          legal_name: 'Acme Inc',
        }),
      ),
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )

    let updateJobBody: Record<string, unknown> | null = null
    const updateJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateJobBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        uuid: 'job-uuid',
        version: 'job-version-next',
        employee_uuid: 'employee-uuid',
        current_compensation_uuid: 'compensation-uuid',
        payment_unit: 'Hour',
        primary: true,
        title: 'My Job',
        hire_date: '2024-12-24',
        two_percent_shareholder: true,
        state_wc_covered: false,
        state_wc_class_code: null,
        rate: '100.00',
        compensations: [],
      })
    })

    let createCompensationBody: Record<string, unknown> | null = null
    const createCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      createCompensationBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(
        {
          uuid: 'new-compensation-uuid',
          version: 'compensation-version-next',
          job_uuid: 'job-uuid',
          payment_unit: 'Hour',
          flsa_status: 'Nonexempt',
          adjust_for_minimum_wage: false,
          effective_date: '2099-01-01',
          rate: '100.00',
        },
        { status: 201 },
      )
    })

    server.use(
      handleUpdateEmployeeJob(updateJobResolver),
      handleCreateCompensation(createCompensationResolver),
    )

    const user = userEvent.setup()

    renderWithProviders(
      <EditCompensation employeeId="employee-uuid" jobId="job-uuid" onEvent={() => {}} />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    await fillEffectiveDate(user, '2099-01-01')
    await user.click(screen.getByLabelText('This employee is a 2% shareholder'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateJobResolver).toHaveBeenCalledTimes(1)
    })

    expect(updateJobBody).toMatchObject({ two_percent_shareholder: true })
    expect(createCompensationBody).not.toHaveProperty('two_percent_shareholder')
  })

  it('puts title on the compensation body and omits it from the job body', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )

    let updateJobBody: Record<string, unknown> | null = null
    const updateJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateJobBody = (await request.json()) as Record<string, unknown>
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
      })
    })

    let createCompensationBody: Record<string, unknown> | null = null
    const createCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      createCompensationBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(
        {
          uuid: 'new-compensation-uuid',
          version: 'compensation-version-next',
          job_uuid: 'job-uuid',
          payment_unit: 'Hour',
          flsa_status: 'Nonexempt',
          adjust_for_minimum_wage: false,
          effective_date: '2099-01-01',
          rate: '100.00',
        },
        { status: 201 },
      )
    })

    server.use(
      handleUpdateEmployeeJob(updateJobResolver),
      handleCreateCompensation(createCompensationResolver),
    )

    const user = userEvent.setup()

    renderWithProviders(
      <EditCompensation employeeId="employee-uuid" jobId="job-uuid" onEvent={() => {}} />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    const titleInput = screen.getByLabelText('Job title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Senior Engineer')

    await fillEffectiveDate(user, '2099-01-01')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(createCompensationResolver).toHaveBeenCalledTimes(1)
    })

    expect(createCompensationBody).toMatchObject({ title: 'Senior Engineer' })
    // withTitleField: false strips `title` from the job submission entirely.
    expect(updateJobBody).not.toHaveProperty('title')
  })

  it('shows the secondary-jobs warning when scheduling a future FLSA change away from Nonexempt', async () => {
    // Scheduling a future non-Nonexempt comp will delete secondary jobs at the
    // effective date. The warning must fire in create mode too — the date field
    // stays editable (unlike update mode where it is forced to today).
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
      ),
    )

    const user = userEvent.setup()

    renderWithProviders(
      <EditCompensation employeeId="employee-uuid" jobId="job-uuid" onEvent={() => {}} />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    const flsaSelect = screen.getByRole('button', { name: /Paid by the hour/i, expanded: false })
    await user.click(flsaSelect)
    await user.click(screen.getByRole('option', { name: /Salary\/No overtime/i }))

    expect(
      await screen.findByText(
        "Scheduling this classification change will delete the employee's additional jobs when it goes into effect.",
      ),
    ).toBeInTheDocument()

    // Effective date must remain editable — the deletion happens at the future
    // date the user picks, not immediately.
    const dateInput = screen.getByLabelText('Effective date')
    expect(dateInput).not.toHaveAttribute('aria-disabled', 'true')
  })
})
