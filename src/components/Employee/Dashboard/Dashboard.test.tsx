import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver, type PathParams } from 'msw'
import type {
  DeleteV1JobsJobIdRequest,
  DeleteV1JobsJobIdResponse,
} from '@gusto/embedded-api/models/operations/deletev1jobsjobid'
import { Dashboard, type DashboardProps } from './Dashboard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { handleGetEmployeeForms, i9Form } from '@/test/mocks/apis/employee_forms'
import { handleGetEmployee, handleDeleteEmployeeJob } from '@/test/mocks/apis/employees'
import { handleDeleteCompensation } from '@/test/mocks/apis/compensations'
import { componentEvents } from '@/shared/constants'
import { assertDefined } from '@/test-utils/assertions'
import { getFixture } from '@/test/mocks/fixtures/getFixture'

type GarnishmentFixture = {
  uuid: string
  version: string
  active: boolean
  amount: string
  description: string
  recurring: boolean
  deduct_as_percentage: boolean
  court_ordered: boolean
  times: number | null
  annual_maximum: string | null
  pay_period_maximum: string | null
  total_amount: string | null
}

const buildGarnishment = (
  overrides: Partial<GarnishmentFixture> & { uuid: string },
): GarnishmentFixture => ({
  active: true,
  amount: '50',
  description: 'Health Insurance',
  recurring: true,
  deduct_as_percentage: false,
  court_ordered: false,
  times: null,
  annual_maximum: null,
  pay_period_maximum: null,
  total_amount: null,
  version: `version-${overrides.uuid}`,
  ...overrides,
})

const stubGarnishmentsList = (garnishments: GarnishmentFixture[]) => {
  server.use(
    http.get(`${API_BASE_URL}/v1/employees/:employee_id/garnishments`, () =>
      HttpResponse.json(garnishments),
    ),
  )
}

const openJobAndPayTab = async (user: ReturnType<typeof userEvent.setup>) => {
  await waitFor(() => {
    expect(screen.getByText('Legal name')).toBeTruthy()
  })
  await user.click(screen.getByRole('tab', { name: 'Job and pay' }))
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Deductions' })).toBeInTheDocument()
  })
}

const PRIMARY_JOB_UUID = '428a653a-0745-4db4-9c80-558288d416fa'
const SECONDARY_JOB_UUID = 'secondary-job-uuid'

async function getSingleNonexemptJobFixture() {
  const employeeFixture = (await getFixture('get-v1-employees')) as Record<string, unknown>
  return {
    ...employeeFixture,
    jobs: [
      {
        uuid: PRIMARY_JOB_UUID,
        version: 'primary-version',
        employee_uuid: 'employee-123',
        current_compensation_uuid: 'primary-comp-uuid',
        payment_unit: 'Hour',
        primary: true,
        title: 'Office Admin',
        compensations: [
          {
            uuid: 'primary-comp-uuid',
            version: 'primary-comp-version',
            payment_unit: 'Hour',
            flsa_status: 'Nonexempt',
            job_uuid: PRIMARY_JOB_UUID,
            effective_date: '2019-06-06',
            rate: '32.00',
            adjust_for_minimum_wage: false,
            minimum_wages: [],
          },
        ],
        rate: '32.00',
        hire_date: '2019-06-06',
      },
    ],
  }
}

async function getMultiJobFixture() {
  const employeeFixture = (await getFixture('get-v1-employees')) as Record<string, unknown>
  return {
    ...employeeFixture,
    jobs: [
      {
        uuid: PRIMARY_JOB_UUID,
        version: 'primary-version',
        employee_uuid: 'employee-123',
        current_compensation_uuid: 'primary-comp-uuid',
        payment_unit: 'Hour',
        primary: true,
        title: 'Administrator',
        compensations: [
          {
            uuid: 'primary-comp-uuid',
            version: 'primary-comp-version',
            payment_unit: 'Hour',
            flsa_status: 'Nonexempt',
            job_uuid: PRIMARY_JOB_UUID,
            effective_date: '2019-04-05',
            rate: '35.00',
            adjust_for_minimum_wage: false,
            minimum_wages: [],
          },
        ],
        rate: '35.00',
        hire_date: '2019-04-05',
      },
      {
        uuid: SECONDARY_JOB_UUID,
        version: 'secondary-version',
        employee_uuid: 'employee-123',
        current_compensation_uuid: 'secondary-comp-uuid',
        payment_unit: 'Hour',
        primary: false,
        title: 'Administrative Supervisor',
        compensations: [
          {
            uuid: 'secondary-comp-uuid',
            version: 'secondary-comp-version',
            payment_unit: 'Hour',
            flsa_status: 'Nonexempt',
            job_uuid: SECONDARY_JOB_UUID,
            effective_date: '2026-05-01',
            rate: '35.00',
            adjust_for_minimum_wage: false,
            minimum_wages: [],
          },
        ],
        rate: '35.00',
        hire_date: '2026-05-01',
      },
    ],
  }
}

const ONE_YEAR_AHEAD = (() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().split('T')[0]!
})()
const TWO_YEARS_AHEAD = (() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 2)
  return d.toISOString().split('T')[0]!
})()

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', () => {
  const useContainerBreakpoints = () => ['small', 'medium', 'large']
  return {
    useContainerBreakpoints,
    default: useContainerBreakpoints,
  }
})

describe('Dashboard', () => {
  const onEvent = vi.fn<DashboardProps['onEvent']>()

  beforeEach(() => {
    onEvent.mockClear()
    setupApiTestMocks()
  })

  it('renders dashboard and loads employee data', async () => {
    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Legal name')).toBeInTheDocument())

    expect(screen.getByText('Home address')).toBeInTheDocument()
    expect(screen.getByText('Work address')).toBeInTheDocument()
  })

  it('displays employee basic details', async () => {
    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Legal name')).toBeInTheDocument())

    expect(screen.getByText('Date of birth')).toBeInTheDocument()
    expect(screen.getByText('Personal email')).toBeInTheDocument()
  })

  it('emits EMPLOYEE_UPDATE event when clicking edit basic details', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Legal name')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_UPDATE, {
      employeeId: 'employee-123',
    })
  })

  it('emits EMPLOYEE_HOME_ADDRESS event when clicking manage home address', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Home address')).toBeInTheDocument())

    const homeAddressBox = screen
      .getByRole('heading', { name: 'Home address' })
      .closest<HTMLElement>('[data-testid="data-box"]')
    assertDefined(homeAddressBox)
    await user.click(within(homeAddressBox).getByRole('button', { name: 'Manage' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_HOME_ADDRESS, {
      employeeId: 'employee-123',
    })
  })

  it('emits EMPLOYEE_WORK_ADDRESS event when clicking manage work address', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Work address')).toBeInTheDocument())

    const workAddressBox = screen
      .getByRole('heading', { name: 'Work address' })
      .closest<HTMLElement>('[data-testid="data-box"]')
    assertDefined(workAddressBox)
    await user.click(within(workAddressBox).getByRole('button', { name: 'Manage' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_WORK_ADDRESS, {
      employeeId: 'employee-123',
    })
  })

  it('shows an empty Compensation card with Add job CTA when the employee has no jobs', async () => {
    const user = userEvent.setup()

    const employeeFixture = (await getFixture('get-v1-employees')) as Record<string, unknown>
    server.use(handleGetEmployee(() => HttpResponse.json({ ...employeeFixture, jobs: [] })))

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    await user.click(screen.getByRole('tab', { name: 'Job and pay' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Compensation' })).toBeInTheDocument()
    })

    expect(screen.getByText('No compensation')).toBeInTheDocument()
    expect(screen.getByText('Compensation will appear here once added')).toBeInTheDocument()

    const addJobButton = screen.getByRole('button', { name: 'Add job' })
    expect(addJobButton).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()

    await user.click(addJobButton)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_JOB_ADD, {
      employeeId: 'employee-123',
    })
  })

  describe('Job and pay > Deductions', () => {
    it('renders active deduction rows with formatted withheld amount', async () => {
      stubGarnishmentsList([
        buildGarnishment({ uuid: 'd-1', description: 'Health Insurance', amount: '120' }),
        buildGarnishment({
          uuid: 'd-2',
          description: 'Parking Fee',
          amount: '5',
          deduct_as_percentage: true,
        }),
        buildGarnishment({
          uuid: 'd-inactive',
          description: 'Old Deduction',
          active: false,
        }),
      ])
      const user = userEvent.setup()

      renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
      await openJobAndPayTab(user)

      expect(screen.getByText('Health Insurance')).toBeInTheDocument()
      expect(screen.getByText('Parking Fee')).toBeInTheDocument()
      // Inactive rows are filtered out by the hook
      expect(screen.queryByText('Old Deduction')).toBeNull()
    })

    it('emits EMPLOYEE_DEDUCTION_ADD when clicking the Add deduction button', async () => {
      stubGarnishmentsList([])
      const user = userEvent.setup()

      renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
      await openJobAndPayTab(user)

      await user.click(screen.getByRole('button', { name: 'Add deduction' }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_DEDUCTION_ADD, {
        employeeId: 'employee-123',
      })
    })

    it('emits EMPLOYEE_DEDUCTION_EDIT with the garnishment when clicking Edit', async () => {
      stubGarnishmentsList([
        buildGarnishment({ uuid: 'd-1', description: 'Health Insurance', amount: '120' }),
      ])
      const user = userEvent.setup()

      renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
      await openJobAndPayTab(user)

      await user.click(screen.getByRole('button', { name: 'Deduction actions menu' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Edit deduction' }))

      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_DEDUCTION_EDIT,
        expect.objectContaining({ uuid: 'd-1', description: 'Health Insurance' }),
      )
    })

    it('soft-deletes via PUT and emits EMPLOYEE_DEDUCTION_DELETED on confirm', async () => {
      const target = buildGarnishment({ uuid: 'd-1', description: 'Health Insurance' })
      stubGarnishmentsList([target])

      let updatePath: string | null = null
      let updateBody: Record<string, unknown> | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        updatePath = new URL(request.url).pathname
        updateBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...target, active: false })
      })
      server.use(http.put(`${API_BASE_URL}/v1/garnishments/:garnishment_id`, updateResolver))

      const user = userEvent.setup()
      renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
      await openJobAndPayTab(user)

      await user.click(screen.getByRole('button', { name: 'Deduction actions menu' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Delete deduction' }))

      const dialog = await screen.findByRole('dialog')
      await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
      expect(updatePath).toBe('/v1/garnishments/d-1')
      expect(updateBody).toMatchObject({ active: false, version: 'version-d-1' })
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_DEDUCTION_DELETED,
        expect.objectContaining({ uuid: 'd-1', active: false }),
      )
    })
  })

  it('emits EMPLOYEE_COMPENSATION_CREATE with the primary job when clicking the single-job Edit CTA', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    await user.click(screen.getByRole('tab', { name: 'Job and pay' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Compensation' })).toBeInTheDocument()
    })

    const compensationHeading = screen.getByRole('heading', { name: 'Compensation' })
    const compensationCard = compensationHeading.closest('[data-testid="data-box"]')!
    await user.click(within(compensationCard as HTMLElement).getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_COMPENSATION_CREATE,
      expect.objectContaining({
        employeeId: 'employee-123',
        job: expect.objectContaining({ uuid: PRIMARY_JOB_UUID, primary: true }),
      }),
    )
  })

  it('does not show an Add another job CTA when the single primary job is exempt', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    await user.click(screen.getByRole('tab', { name: 'Job and pay' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Compensation' })).toBeInTheDocument()
    })

    const compensationCard = screen
      .getByRole('heading', { name: 'Compensation' })
      .closest('[data-testid="data-box"]')! as HTMLElement

    expect(within(compensationCard).getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(
      within(compensationCard).queryByRole('button', { name: 'Add another job' }),
    ).not.toBeInTheDocument()
  })

  it('shows the single-job detail view with both Edit and Add another job when the primary job is nonexempt', async () => {
    const user = userEvent.setup()

    const fixture = await getSingleNonexemptJobFixture()
    server.use(handleGetEmployee(() => HttpResponse.json(fixture)))

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    await user.click(screen.getByRole('tab', { name: 'Job and pay' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Compensation' })).toBeInTheDocument()
    })

    const compensationCard = screen
      .getByRole('heading', { name: 'Compensation' })
      .closest('[data-testid="data-box"]')! as HTMLElement

    expect(within(compensationCard).getByText('Office Admin')).toBeInTheDocument()
    expect(within(compensationCard).getByText('Wage')).toBeInTheDocument()
    expect(within(compensationCard).getByText(/\$32\.00 per hour/)).toBeInTheDocument()
    expect(within(compensationCard).getByRole('button', { name: 'Edit' })).toBeInTheDocument()

    const addAnother = within(compensationCard).getByRole('button', { name: 'Add another job' })
    await user.click(addAnother)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_JOB_ADD_ANOTHER, {
      employeeId: 'employee-123',
    })
  })

  it('renders a jobs table with no header Edit CTA when the employee has multiple nonexempt jobs', async () => {
    const user = userEvent.setup()

    const multiJobFixture = await getMultiJobFixture()
    server.use(handleGetEmployee(() => HttpResponse.json(multiJobFixture)))

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    await user.click(screen.getByRole('tab', { name: 'Job and pay' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Compensation' })).toBeInTheDocument()
    })

    const compensationCard = screen
      .getByRole('heading', { name: 'Compensation' })
      .closest('[data-testid="data-box"]')! as HTMLElement

    expect(within(compensationCard).getByText('Administrator')).toBeInTheDocument()
    expect(within(compensationCard).getByText('Administrative Supervisor')).toBeInTheDocument()
    expect(within(compensationCard).getAllByText('Paid by the hour').length).toBe(2)
    expect(within(compensationCard).queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(
      within(compensationCard).getByRole('button', { name: 'Add another job' }),
    ).toBeInTheDocument()
  })

  it('hides Delete on the primary job and shows Edit + Delete on the non-primary job', async () => {
    const user = userEvent.setup()

    const multiJobFixture = await getMultiJobFixture()
    server.use(handleGetEmployee(() => HttpResponse.json(multiJobFixture)))

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    await user.click(screen.getByRole('tab', { name: 'Job and pay' }))

    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument()
    })

    const primaryRow = screen.getByText('Administrator').closest('[role="row"]')! as HTMLElement
    await user.click(within(primaryRow).getByRole('button', { name: 'Job actions' }))

    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument()

    // Close the primary menu by clicking outside (Escape via Esc key keeps focus tidy)
    await user.keyboard('{Escape}')

    const secondaryRow = screen
      .getByText('Administrative Supervisor')
      .closest('[role="row"]')! as HTMLElement
    await user.click(within(secondaryRow).getByRole('button', { name: 'Job actions' }))

    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
  })

  it('emits EMPLOYEE_COMPENSATION_CREATE with the row job when clicking the per-row Edit menu item', async () => {
    const user = userEvent.setup()

    const multiJobFixture = await getMultiJobFixture()
    server.use(handleGetEmployee(() => HttpResponse.json(multiJobFixture)))

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    await user.click(screen.getByRole('tab', { name: 'Job and pay' }))

    await waitFor(() => {
      expect(screen.getByText('Administrative Supervisor')).toBeInTheDocument()
    })

    const secondaryRow = screen
      .getByText('Administrative Supervisor')
      .closest('[role="row"]')! as HTMLElement
    await user.click(within(secondaryRow).getByRole('button', { name: 'Job actions' }))
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_COMPENSATION_CREATE,
      expect.objectContaining({
        employeeId: 'employee-123',
        job: expect.objectContaining({ uuid: SECONDARY_JOB_UUID, primary: false }),
      }),
    )
  })

  it('opens the delete dialog and calls the delete API when confirming a non-primary job deletion', async () => {
    const user = userEvent.setup()

    const multiJobFixture = await getMultiJobFixture()
    server.use(handleGetEmployee(() => HttpResponse.json(multiJobFixture)))

    let deletePath: string | null = null
    const deleteJobResolver = vi.fn<
      HttpResponseResolver<PathParams, DeleteV1JobsJobIdRequest, DeleteV1JobsJobIdResponse>
    >(({ request }) => {
      deletePath = new URL(request.url).pathname
      return new HttpResponse(null, { status: 204 }) as unknown as ReturnType<
        HttpResponseResolver<PathParams, DeleteV1JobsJobIdRequest, DeleteV1JobsJobIdResponse>
      >
    })
    server.use(handleDeleteEmployeeJob(deleteJobResolver))

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    await user.click(screen.getByRole('tab', { name: 'Job and pay' }))

    await waitFor(() => {
      expect(screen.getByText('Administrative Supervisor')).toBeInTheDocument()
    })

    const secondaryRow = screen
      .getByText('Administrative Supervisor')
      .closest('[role="row"]')! as HTMLElement
    await user.click(within(secondaryRow).getByRole('button', { name: 'Job actions' }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Delete job?')).toBeInTheDocument()
    expect(within(dialog).getByText(/Administrative Supervisor/)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(deleteJobResolver).toHaveBeenCalledTimes(1)
    })
    expect(deletePath).toBe(`/v1/jobs/${SECONDARY_JOB_UUID}`)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_JOB_DELETED, {
        employeeId: 'employee-123',
        jobId: SECONDARY_JOB_UUID,
      })
    })
  })

  it('emits EMPLOYEE_JOB_ADD_ANOTHER when clicking the Add another job CTA in the multi-job view', async () => {
    const user = userEvent.setup()

    const multiJobFixture = await getMultiJobFixture()
    server.use(handleGetEmployee(() => HttpResponse.json(multiJobFixture)))

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Legal name')).toBeTruthy()
    })

    await user.click(screen.getByRole('tab', { name: 'Job and pay' }))

    const addAnother = await screen.findByRole('button', { name: 'Add another job' })
    await user.click(addAnother)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_JOB_ADD_ANOTHER, {
      employeeId: 'employee-123',
    })
  })

  describe('Compensation pending changes', () => {
    type Compensation = {
      uuid: string
      version: string
      payment_unit: string
      flsa_status: string
      job_uuid: string
      effective_date: string
      rate: string
      title?: string
      adjust_for_minimum_wage?: boolean
      minimum_wages?: Array<{ uuid: string; wage: string }>
    }

    type JobFixture = {
      uuid: string
      version: string
      employee_uuid: string
      current_compensation_uuid: string
      payment_unit: string
      primary: boolean
      title: string
      compensations: Compensation[]
      rate: string
      hire_date: string
    }

    const buildEmployeeWithJobs = async (jobs: JobFixture[]): Promise<Record<string, unknown>> => {
      const base = (await getFixture('get-v1-employees')) as Record<string, unknown>
      return { ...base, jobs }
    }

    const overrideEmployee = (employee: Record<string, unknown>) => {
      server.use(handleGetEmployee(() => HttpResponse.json(employee)))
    }

    const goToJobAndPayTab = async (user: ReturnType<typeof userEvent.setup>) => {
      await waitFor(() => {
        expect(screen.getByText('Legal name')).toBeTruthy()
      })
      await user.click(screen.getByRole('tab', { name: 'Job and pay' }))
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Compensation' })).toBeInTheDocument()
      })
    }

    const baseJob = (overrides: Partial<JobFixture> = {}, compensations: Compensation[] = []): JobFixture => ({
      uuid: 'job-1',
      version: 'job-v1',
      employee_uuid: 'employee-uuid',
      current_compensation_uuid: 'comp-current',
      payment_unit: 'Hour',
      primary: true,
      title: 'Cashier',
      rate: '30.00',
      hire_date: '2024-01-01',
      compensations,
      ...overrides,
    })

    const baseComp = (overrides: Partial<Compensation> = {}): Compensation => ({
      uuid: 'comp-current',
      version: 'comp-v1',
      payment_unit: 'Hour',
      flsa_status: 'Nonexempt',
      job_uuid: 'job-1',
      effective_date: '2024-01-01',
      rate: '30.00',
      title: 'Cashier',
      adjust_for_minimum_wage: false,
      minimum_wages: [],
      ...overrides,
    })

    it('does not render any pending-change alert when no compensations are future-dated', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
      await goToJobAndPayTab(user)

      expect(screen.queryByRole('alert')).toBeNull()
    })

    it('renders an inline alert with bullet details and a Cancel button for a single-job pending change', async () => {
      const user = userEvent.setup()
      const employee = await buildEmployeeWithJobs([
        baseJob({}, [
          baseComp(),
          baseComp({
            uuid: 'comp-future',
            rate: '35.00',
            title: 'Senior Cashier',
            effective_date: ONE_YEAR_AHEAD,
          }),
        ]),
      ])
      overrideEmployee(employee)

      renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
      await goToJobAndPayTab(user)

      const alert = await screen.findByRole('alert')
      expect(within(alert).getByText(/Compensation will change on/)).toBeInTheDocument()
      expect(within(alert).getByText('Job title will change to Senior Cashier')).toBeInTheDocument()
      expect(within(alert).getByText('Pay will change to $35.00 per hour')).toBeInTheDocument()
      expect(within(alert).getByRole('button', { name: 'Cancel change' })).toBeInTheDocument()
    })

    it('shows the nearest upcoming change when a single job has stacked future compensations', async () => {
      const user = userEvent.setup()
      const employee = await buildEmployeeWithJobs([
        baseJob({}, [
          baseComp(),
          baseComp({
            uuid: 'comp-future-near',
            rate: '32.00',
            effective_date: ONE_YEAR_AHEAD,
          }),
          baseComp({
            uuid: 'comp-future-far',
            rate: '35.00',
            effective_date: TWO_YEARS_AHEAD,
          }),
        ]),
      ])
      overrideEmployee(employee)

      renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
      await goToJobAndPayTab(user)

      const alert = await screen.findByRole('alert')
      expect(within(alert).getByText('Pay will change to $32.00 per hour')).toBeInTheDocument()
      expect(within(alert).queryByText('Pay will change to $35.00 per hour')).toBeNull()
    })

    it('cancel-change: fires DELETE with the right path, refetches, emits the event', async () => {
      const user = userEvent.setup()
      let deletePath: string | null = null
      const deleteResolver = vi.fn<HttpResponseResolver>(({ request }) => {
        deletePath = new URL(request.url).pathname
        return new HttpResponse(null, { status: 204 })
      })

      const futureCompensation = baseComp({
        uuid: 'comp-future',
        rate: '35.00',
        effective_date: ONE_YEAR_AHEAD,
      })
      const employeeBefore = await buildEmployeeWithJobs([
        baseJob({}, [baseComp(), futureCompensation]),
      ])
      const employeeAfter = await buildEmployeeWithJobs([baseJob({}, [baseComp()])])

      let getCallCount = 0
      server.use(
        handleGetEmployee(() => {
          getCallCount += 1
          return HttpResponse.json(getCallCount === 1 ? employeeBefore : employeeAfter)
        }),
      )
      server.use(handleDeleteCompensation(deleteResolver))

      renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
      await goToJobAndPayTab(user)

      const alert = await screen.findByRole('alert')
      await user.click(within(alert).getByRole('button', { name: 'Cancel change' }))

      await waitFor(() => {
        expect(deleteResolver).toHaveBeenCalledTimes(1)
      })
      expect(deletePath).toBe('/v1/compensations/comp-future')

      await waitFor(() => {
        expect(screen.queryByRole('alert')).toBeNull()
      })

      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_COMPENSATION_CHANGE_CANCELLED, {
        employeeId: 'employee-123',
        compensationId: 'comp-future',
      })
    })

    it('surfaces a DELETE failure through the error surface and does not emit the success event', async () => {
      const user = userEvent.setup()
      const deleteResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json(
          { errors: [{ category: 'invalid_attribute_value', message: 'Cannot cancel' }] },
          { status: 422 },
        ),
      )

      const futureCompensation = baseComp({
        uuid: 'comp-future',
        rate: '35.00',
        effective_date: ONE_YEAR_AHEAD,
      })
      const employee = await buildEmployeeWithJobs([baseJob({}, [baseComp(), futureCompensation])])
      overrideEmployee(employee)
      server.use(handleDeleteCompensation(deleteResolver))

      renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
      await goToJobAndPayTab(user)

      const pendingAlert = await screen.findByRole('alert')
      await user.click(within(pendingAlert).getByRole('button', { name: 'Cancel change' }))

      await waitFor(() => {
        expect(deleteResolver).toHaveBeenCalledTimes(1)
      })

      await waitFor(() => {
        expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(2)
      })

      expect(onEvent).not.toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_COMPENSATION_CHANGE_CANCELLED,
        expect.anything(),
      )
    })

    it('renders a summary alert with a Review button when the employee has multiple jobs with pending changes', async () => {
      const user = userEvent.setup()
      const employee = await buildEmployeeWithJobs([
        baseJob({ uuid: 'job-primary', current_compensation_uuid: 'comp-primary-current' }, [
          baseComp({ uuid: 'comp-primary-current', job_uuid: 'job-primary' }),
          baseComp({
            uuid: 'comp-primary-future',
            job_uuid: 'job-primary',
            rate: '35.00',
            effective_date: ONE_YEAR_AHEAD,
          }),
        ]),
        baseJob(
          {
            uuid: 'job-secondary',
            primary: false,
            title: 'Stock Associate',
            current_compensation_uuid: 'comp-secondary-current',
          },
          [
            baseComp({
              uuid: 'comp-secondary-current',
              job_uuid: 'job-secondary',
              title: 'Stock Associate',
              rate: '22.00',
            }),
            baseComp({
              uuid: 'comp-secondary-future',
              job_uuid: 'job-secondary',
              title: 'Stock Associate',
              rate: '24.00',
              effective_date: TWO_YEARS_AHEAD,
            }),
          ],
        ),
      ])
      overrideEmployee(employee)

      renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
      await goToJobAndPayTab(user)

      const alert = await screen.findByRole('alert')
      expect(within(alert).getByText(/multiple pending changes/)).toBeInTheDocument()
      expect(within(alert).getByRole('button', { name: 'Review' })).toBeInTheDocument()
    })

    it('opens the review modal listing pending changes chronologically when Review is clicked', async () => {
      const user = userEvent.setup()
      const employee = await buildEmployeeWithJobs([
        baseJob({ uuid: 'job-primary', current_compensation_uuid: 'comp-primary-current' }, [
          baseComp({ uuid: 'comp-primary-current', job_uuid: 'job-primary' }),
          baseComp({
            uuid: 'comp-primary-future',
            job_uuid: 'job-primary',
            rate: '35.00',
            effective_date: TWO_YEARS_AHEAD,
          }),
        ]),
        baseJob(
          {
            uuid: 'job-secondary',
            primary: false,
            title: 'Stock Associate',
            current_compensation_uuid: 'comp-secondary-current',
          },
          [
            baseComp({
              uuid: 'comp-secondary-current',
              job_uuid: 'job-secondary',
              title: 'Stock Associate',
              rate: '22.00',
            }),
            baseComp({
              uuid: 'comp-secondary-future',
              job_uuid: 'job-secondary',
              title: 'Stock Associate',
              rate: '24.00',
              effective_date: ONE_YEAR_AHEAD,
            }),
          ],
        ),
      ])
      overrideEmployee(employee)

      renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
      await goToJobAndPayTab(user)

      const alert = await screen.findByRole('alert')
      await user.click(within(alert).getByRole('button', { name: 'Review' }))

      const dialog = await screen.findByRole('dialog')
      const cards = within(dialog).getAllByText(/Pay will change to/)
      expect(cards).toHaveLength(2)
      expect(cards[0]!.textContent).toContain('$24.00')
      expect(cards[1]!.textContent).toContain('$35.00')
    })

    it('confirms cancel from inside the review modal and only removes the cancelled change', async () => {
      const user = userEvent.setup()
      const deleteResolver = vi.fn<HttpResponseResolver>(
        () => new HttpResponse(null, { status: 204 }),
      )

      const futurePrimary = baseComp({
        uuid: 'comp-primary-future',
        job_uuid: 'job-primary',
        rate: '35.00',
        effective_date: TWO_YEARS_AHEAD,
      })
      const futureSecondary = baseComp({
        uuid: 'comp-secondary-future',
        job_uuid: 'job-secondary',
        title: 'Stock Associate',
        rate: '24.00',
        effective_date: ONE_YEAR_AHEAD,
      })

      const employeeBefore = await buildEmployeeWithJobs([
        baseJob({ uuid: 'job-primary', current_compensation_uuid: 'comp-primary-current' }, [
          baseComp({ uuid: 'comp-primary-current', job_uuid: 'job-primary' }),
          futurePrimary,
        ]),
        baseJob(
          {
            uuid: 'job-secondary',
            primary: false,
            title: 'Stock Associate',
            current_compensation_uuid: 'comp-secondary-current',
          },
          [
            baseComp({
              uuid: 'comp-secondary-current',
              job_uuid: 'job-secondary',
              title: 'Stock Associate',
              rate: '22.00',
            }),
            futureSecondary,
          ],
        ),
      ])
      const employeeAfter = await buildEmployeeWithJobs([
        baseJob({ uuid: 'job-primary', current_compensation_uuid: 'comp-primary-current' }, [
          baseComp({ uuid: 'comp-primary-current', job_uuid: 'job-primary' }),
          futurePrimary,
        ]),
        baseJob(
          {
            uuid: 'job-secondary',
            primary: false,
            title: 'Stock Associate',
            current_compensation_uuid: 'comp-secondary-current',
          },
          [
            baseComp({
              uuid: 'comp-secondary-current',
              job_uuid: 'job-secondary',
              title: 'Stock Associate',
              rate: '22.00',
            }),
          ],
        ),
      ])

      let getCallCount = 0
      server.use(
        handleGetEmployee(() => {
          getCallCount += 1
          return HttpResponse.json(getCallCount === 1 ? employeeBefore : employeeAfter)
        }),
      )
      server.use(handleDeleteCompensation(deleteResolver))

      renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
      await goToJobAndPayTab(user)

      const alert = await screen.findByRole('alert')
      await user.click(within(alert).getByRole('button', { name: 'Review' }))

      const modal = await screen.findByRole('dialog')
      const cancelButtons = within(modal).getAllByRole('button', { name: 'Cancel change' })
      await user.click(cancelButtons[0]!)

      await waitFor(() => {
        expect(deleteResolver).toHaveBeenCalledTimes(1)
      })
      expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_COMPENSATION_CHANGE_CANCELLED, {
        employeeId: 'employee-123',
        compensationId: 'comp-secondary-future',
      })
    })

    describe('multi-job alert variants', () => {
      it('single hourly job with a comp update: shows inline alert with standard copy', async () => {
        const user = userEvent.setup()
        const employee = await buildEmployeeWithJobs([
          baseJob({}, [
            baseComp(),
            baseComp({ uuid: 'comp-future', rate: '35.00', effective_date: ONE_YEAR_AHEAD }),
          ]),
        ])
        overrideEmployee(employee)

        renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
        await goToJobAndPayTab(user)

        const alert = await screen.findByRole('alert')
        expect(within(alert).getByText(/Compensation will change on/)).toBeInTheDocument()
        expect(within(alert).queryByText(/Compensation for/)).toBeNull()
        expect(within(alert).getByRole('button', { name: 'Cancel change' })).toBeInTheDocument()
      })

      it('multiple hourly jobs with a single comp update: shows inline alert including the job title', async () => {
        const user = userEvent.setup()
        const employee = await buildEmployeeWithJobs([
          baseJob(
            {
              uuid: 'job-primary',
              title: 'Cashier',
              current_compensation_uuid: 'comp-primary-current',
            },
            [
              baseComp({ uuid: 'comp-primary-current', job_uuid: 'job-primary' }),
              baseComp({
                uuid: 'comp-primary-future',
                job_uuid: 'job-primary',
                rate: '35.00',
                effective_date: ONE_YEAR_AHEAD,
              }),
            ],
          ),
          baseJob(
            {
              uuid: 'job-secondary',
              primary: false,
              title: 'Stock Associate',
              current_compensation_uuid: 'comp-secondary-current',
            },
            [
              baseComp({
                uuid: 'comp-secondary-current',
                job_uuid: 'job-secondary',
                title: 'Stock Associate',
                rate: '22.00',
              }),
            ],
          ),
        ])
        overrideEmployee(employee)

        renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
        await goToJobAndPayTab(user)

        const alert = await screen.findByRole('alert')
        expect(
          within(alert).getByText(/Compensation for Cashier will change on/),
        ).toBeInTheDocument()
        expect(within(alert).queryByText(/multiple pending changes/)).toBeNull()
        expect(within(alert).getByRole('button', { name: 'Cancel change' })).toBeInTheDocument()
      })

      it('multiple hourly jobs with multiple comp updates: shows summary alert with Review CTA', async () => {
        const user = userEvent.setup()
        const employee = await buildEmployeeWithJobs([
          baseJob({ uuid: 'job-primary', current_compensation_uuid: 'comp-primary-current' }, [
            baseComp({ uuid: 'comp-primary-current', job_uuid: 'job-primary' }),
            baseComp({
              uuid: 'comp-primary-future',
              job_uuid: 'job-primary',
              rate: '35.00',
              effective_date: ONE_YEAR_AHEAD,
            }),
          ]),
          baseJob(
            {
              uuid: 'job-secondary',
              primary: false,
              title: 'Stock Associate',
              current_compensation_uuid: 'comp-secondary-current',
            },
            [
              baseComp({
                uuid: 'comp-secondary-current',
                job_uuid: 'job-secondary',
                title: 'Stock Associate',
                rate: '22.00',
              }),
              baseComp({
                uuid: 'comp-secondary-future',
                job_uuid: 'job-secondary',
                title: 'Stock Associate',
                rate: '24.00',
                effective_date: TWO_YEARS_AHEAD,
              }),
            ],
          ),
        ])
        overrideEmployee(employee)

        renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)
        await goToJobAndPayTab(user)

        const alert = await screen.findByRole('alert')
        expect(within(alert).getByText(/multiple pending changes/)).toBeInTheDocument()
        expect(within(alert).getByRole('button', { name: 'Review' })).toBeInTheDocument()
        expect(within(alert).queryByRole('button', { name: 'Cancel change' })).toBeNull()
      })
    })
  })

  it('emits EMPLOYEE_STATE_TAXES_EDIT with only employeeId when clicking state taxes edit', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Legal name')).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: 'Taxes' }))

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'State taxes' })).toBeInTheDocument(),
    )

    const stateTaxesBox = screen
      .getByRole('heading', { name: 'State taxes' })
      .closest<HTMLElement>('[data-testid="data-box"]')
    assertDefined(stateTaxesBox)
    await user.click(within(stateTaxesBox).getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_STATE_TAXES_EDIT, {
      employeeId: 'employee-123',
    })
  })

  it('shows employee forms on the Documents tab', async () => {
    server.use(handleGetEmployeeForms(() => HttpResponse.json([i9Form])))
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Legal name')).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: 'Documents' }))

    await waitFor(() => expect(screen.getByText('Form I-9')).toBeInTheDocument())
  })

  it('emits EMPLOYEE_VIEW_FORM_TO_SIGN with employeeId and formId when clicking View on a form', async () => {
    server.use(handleGetEmployeeForms(() => HttpResponse.json([i9Form])))
    const user = userEvent.setup()

    renderWithProviders(<Dashboard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => expect(screen.getByText('Legal name')).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: 'Documents' }))

    await waitFor(() => expect(screen.getByText('Form I-9')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'View' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN, {
      employeeId: 'employee-123',
      formId: 'i9-form-123',
    })
  })
})
