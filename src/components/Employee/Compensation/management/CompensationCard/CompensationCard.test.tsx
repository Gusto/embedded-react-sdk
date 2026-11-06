import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { CompensationCard } from './CompensationCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeJobs, handleDeleteEmployeeJob } from '@/test/mocks/apis/employees'
import {
  buildCompensation,
  buildEmployeeWithJobs,
  buildJob,
} from '@/test/factories/jobsAndCompensations'
import { componentEvents } from '@/shared/constants'

describe('CompensationCard (standalone)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  describe.each(['single-job', 'multi-job'])('%s classification', layout => {
    it.each([
      {
        flsaStatus: 'Salaried Nonexempt',
        paymentUnit: 'Year',
        label: 'Salary/Eligible for overtime',
        wage: '$60,000.00 per year',
      },
      {
        flsaStatus: 'Exempt',
        paymentUnit: 'Month',
        label: 'Salary/No overtime',
        wage: '$60,000.00 per month',
      },
      {
        flsaStatus: 'Nonexempt',
        paymentUnit: 'Year',
        label: 'Paid by the hour',
        wage: '$60,000.00 per year',
      },
    ])('renders $flsaStatus independently of the $paymentUnit rate unit', async fixture => {
      const job = buildJob({ ...fixture, rate: '60000.00' })
      const jobs =
        layout === 'single-job'
          ? [job]
          : [
              job,
              buildJob({
                uuid: 'additional-job',
                currentCompensationUuid: 'additional-compensation',
                primary: false,
                title: 'Additional Job',
              }),
            ]
      server.use(handleGetEmployeeJobs(() => HttpResponse.json(jobs)))

      renderWithProviders(<CompensationCard employeeId="employee-uuid" onEvent={onEvent} />)

      const classification =
        layout === 'single-job'
          ? screen
          : within(await screen.findByRole('row', { name: /My Job/ }))
      expect(await classification.findByText(fixture.label)).toBeInTheDocument()
      expect(classification.getByText(fixture.wage)).toBeInTheDocument()
    })
  })

  it('uses the current compensation classification when a future compensation comes first', async () => {
    const job = buildJob({
      paymentUnit: 'Year',
      rate: '60000.00',
      compensations: [
        buildCompensation({
          uuid: 'future-compensation',
          flsa_status: 'Exempt',
          payment_unit: 'Year',
          rate: '60000.00',
          effective_date: '2099-01-01',
        }),
        buildCompensation({
          flsa_status: 'Salaried Nonexempt',
          payment_unit: 'Year',
          rate: '60000.00',
        }),
      ],
    })
    server.use(handleGetEmployeeJobs(() => HttpResponse.json([job])))

    renderWithProviders(<CompensationCard employeeId="employee-uuid" onEvent={onEvent} />)

    expect(await screen.findByText('Salary/Eligible for overtime')).toBeInTheDocument()
    expect(screen.getByText('$60,000.00 per year')).toBeInTheDocument()
  })

  it('shows a placeholder when the current compensation cannot be resolved', async () => {
    const job = buildJob({
      currentCompensationUuid: 'missing-compensation',
      paymentUnit: 'Year',
      compensations: [buildCompensation({ flsa_status: 'Exempt' })],
    })
    server.use(handleGetEmployeeJobs(() => HttpResponse.json([job])))

    renderWithProviders(<CompensationCard employeeId="employee-uuid" onEvent={onEvent} />)

    await screen.findByText('My Job')
    const descriptions = screen.getAllByRole('definition')
    const classification = descriptions[1]
    if (!classification) throw new Error('Expected a classification description')
    expect(within(classification).getByLabelText('No value')).toBeInTheDocument()
  })

  it('renders the empty state and emits CARD_ADD_REQUESTED from the Add job CTA', async () => {
    server.use(
      handleGetEmployeeJobs(() => HttpResponse.json(buildEmployeeWithJobs({ scenario: 'noJobs' }))),
    )

    const user = userEvent.setup()
    renderWithProviders(<CompensationCard employeeId="employee-uuid" onEvent={onEvent} />)

    expect(await screen.findByText('No compensation')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Add job' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_ADD_REQUESTED,
      { employeeId: 'employee-uuid' },
    )
  })

  it('renders a single job and emits CARD_EDIT_REQUESTED with that job from the Edit CTA', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders(<CompensationCard employeeId="employee-uuid" onEvent={onEvent} />)

    expect(await screen.findByText('My Job')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_EDIT_REQUESTED,
      expect.objectContaining({
        employeeId: 'employee-uuid',
        jobId: 'job-uuid',
      }),
    )
  })

  it('emits CARD_ADD_ANOTHER_REQUESTED from the Add another job CTA in the multi-job view', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders(<CompensationCard employeeId="employee-uuid" onEvent={onEvent} />)

    await screen.findByText('My Job')

    await user.click(screen.getByRole('button', { name: 'Add another job' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_ADD_ANOTHER_REQUESTED,
      { employeeId: 'employee-uuid' },
    )
  })

  it('deletes a secondary job and emits CARD_JOB_DELETED', async () => {
    server.use(
      handleGetEmployeeJobs(() =>
        HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
      ),
    )
    let deletePath: string | null = null
    server.use(
      handleDeleteEmployeeJob(({ request }) => {
        deletePath = new URL(request.url).pathname
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<CompensationCard employeeId="employee-uuid" onEvent={onEvent} />)

    await screen.findByText('My Job')

    // Open the secondary job's action menu and delete it.
    const menus = screen.getAllByRole('button', { name: 'Job actions' })
    await user.click(menus[menus.length - 1]!)
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_MANAGEMENT_COMPENSATION_CARD_JOB_DELETED,
        { employeeId: 'employee-uuid', jobId: 'job-uuid-2' },
      )
    })
    expect(deletePath).toBe('/v1/jobs/job-uuid-2')
  })
})
