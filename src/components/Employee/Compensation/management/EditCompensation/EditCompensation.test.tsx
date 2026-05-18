import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { EditCompensation } from './EditCompensation'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import {
  handleGetEmployeeJobs,
  handleUpdateEmployeeJob,
  handleUpdateEmployeeCompensation,
} from '@/test/mocks/apis/employees'
import { handleGetCompanyFederalTaxes } from '@/test/mocks/apis/company_federal_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { getMinimumWages } from '@/test/mocks/apis/company_locations'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { buildEmployeeWithJobs } from '@/test/factories/jobsAndCompensations'

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
      <EditCompensation
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-uuid"
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    expect(screen.getByLabelText('Job title')).toHaveValue('My Job')
    expect(screen.getByLabelText('Wage')).toHaveValue('100.00')
    expect(
      screen.getByRole('button', { name: /Paid by the hour/i, expanded: false }),
    ).toBeInTheDocument()
  })

  it('does not expose the job title field (title belongs on the compensation form)', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )

    renderWithProviders(
      <EditCompensation
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-uuid"
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    // Only the compensation-form title field is rendered, never the job-form one.
    // useJobForm with withTitleField:false produces undefined for Fields.Title,
    // so just one labelled input should exist.
    expect(screen.getAllByLabelText('Job title')).toHaveLength(1)
  })

  it('submits PUT /v1/jobs/:id before PUT /v1/compensations/:id', async () => {
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

    const updateCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        uuid: 'compensation-uuid',
        version: 'compensation-version-next',
        job_uuid: 'job-uuid',
        payment_unit: body.paymentUnit ?? 'Hour',
        flsa_status: body.flsaStatus ?? 'Nonexempt',
        adjust_for_minimum_wage: false,
        effective_date: body.effectiveDate ?? '2099-01-01',
        rate: body.rate ?? '100.00',
      })
    })

    server.use(
      handleUpdateEmployeeJob(updateJobResolver),
      handleUpdateEmployeeCompensation(updateCompensationResolver),
    )

    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(
      <EditCompensation
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-uuid"
        onEvent={onEvent}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    const rateInput = screen.getByLabelText('Wage')
    await user.clear(rateInput)
    await user.type(rateInput, '125')
    await user.tab()

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
    })

    expect(updateJobResolver).toHaveBeenCalledTimes(1)
    expect(updateJobResolver.mock.invocationCallOrder[0]!).toBeLessThan(
      updateCompensationResolver.mock.invocationCallOrder[0]!,
    )

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_COMPENSATION_UPDATED,
        expect.objectContaining({ uuid: 'compensation-uuid' }),
      )
    })
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

    let updateCompensationBody: Record<string, unknown> | null = null
    const updateCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateCompensationBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        uuid: 'compensation-uuid',
        version: 'compensation-version-next',
        job_uuid: 'job-uuid',
        payment_unit: 'Hour',
        flsa_status: 'Nonexempt',
        adjust_for_minimum_wage: false,
        effective_date: '2024-12-24',
        rate: '100.00',
      })
    })

    server.use(
      handleUpdateEmployeeJob(updateJobResolver),
      handleUpdateEmployeeCompensation(updateCompensationResolver),
    )

    const user = userEvent.setup()

    renderWithProviders(
      <EditCompensation
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-uuid"
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    await user.click(screen.getByLabelText('This employee is a 2% shareholder'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateJobResolver).toHaveBeenCalledTimes(1)
    })

    expect(updateJobBody).toMatchObject({ two_percent_shareholder: true })
    expect(updateCompensationBody).not.toHaveProperty('two_percent_shareholder')
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

    let updateCompensationBody: Record<string, unknown> | null = null
    const updateCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateCompensationBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        uuid: 'compensation-uuid',
        version: 'compensation-version-next',
        job_uuid: 'job-uuid',
        payment_unit: 'Hour',
        flsa_status: 'Nonexempt',
        adjust_for_minimum_wage: false,
        effective_date: '2024-12-24',
        rate: '100.00',
      })
    })

    server.use(
      handleUpdateEmployeeJob(updateJobResolver),
      handleUpdateEmployeeCompensation(updateCompensationResolver),
    )

    const user = userEvent.setup()

    renderWithProviders(
      <EditCompensation
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-uuid"
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
    // withTitleField: false strips `title` from the job submission entirely.
    expect(updateJobBody).not.toHaveProperty('title')
  })

  it('shows the carve-out warning when switching primary FLSA off Nonexempt with secondaries', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
      ),
    )

    const user = userEvent.setup()

    renderWithProviders(
      <EditCompensation
        employeeId="employee-uuid"
        jobId="job-uuid"
        compensationId="compensation-uuid"
        onEvent={() => {}}
      />,
    )

    await screen.findByRole('heading', { name: 'Edit compensation' })

    const flsaSelect = screen.getByRole('button', {
      name: /Paid by the hour/i,
      expanded: false,
    })
    await user.click(flsaSelect)
    await user.click(screen.getByRole('option', { name: /Salary\/No overtime/i }))

    expect(
      await screen.findByText(
        "Changing this employee's classification will delete the employee's additional pay rates.",
      ),
    ).toBeInTheDocument()
  })
})
