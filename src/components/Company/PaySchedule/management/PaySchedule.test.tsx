import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { PaySchedule } from './PaySchedule'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import {
  createPaySchedule,
  getPaySchedules,
  getPaySchedule,
  getPaySchedulePreview,
  updatePaySchedule,
  previewPayScheduleAssignment,
  assignPaySchedules,
  getPayScheduleAssignments,
} from '@/test/mocks/apis/payschedule'
import { getFixture } from '@/test/mocks/fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

const paymentConfigsMock = http.get(
  `${API_BASE_URL}/v1/companies/:company_uuid/payment_configs`,
  () => {
    return HttpResponse.json({
      payment_speed: '2-day',
      fast_payment_limit: '5000000',
    })
  },
)

const renderPaySchedule = ({
  onEvent = vi.fn(),
  enableAutoPilot,
  enableMultipleSchedules,
}: {
  onEvent?: OnEventType<EventType, unknown>
  enableAutoPilot?: boolean
  enableMultipleSchedules?: boolean
} = {}) => {
  renderWithProviders(
    <PaySchedule
      companyId="123"
      onEvent={onEvent}
      enableAutoPilot={enableAutoPilot}
      enableMultipleSchedules={enableMultipleSchedules}
    />,
    { unstableFeatures: { managePaySchedules: true } },
  )
  return { onEvent }
}

describe('PaySchedule (management)', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(
      paymentConfigsMock,
      getPaySchedules,
      // Out-ranks getPaySchedule, whose `:pay_schedule_id` pattern also matches /assignments.
      getPayScheduleAssignments,
      getPaySchedule,
      getPaySchedulePreview,
      createPaySchedule,
      updatePaySchedule,
      previewPayScheduleAssignment,
      assignPaySchedules,
    )
  })

  it('renders the pay schedule overview', async () => {
    renderPaySchedule({ enableAutoPilot: true, enableMultipleSchedules: true })

    await waitFor(() => {
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: /pay schedule/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument()
    expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
  })

  it('hides the Manage action when enableMultipleSchedules is false', async () => {
    renderPaySchedule({ enableMultipleSchedules: false })

    await waitFor(() => {
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /manage/i })).not.toBeInTheDocument()
  })

  it('hides the AutoPilot row when enableAutoPilot is false', async () => {
    renderPaySchedule({ enableAutoPilot: false })

    await waitFor(() => {
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    })

    expect(screen.queryByText(/autopilot/i)).not.toBeInTheDocument()
  })

  it('hides Manage and AutoPilot by default when neither prop is passed', async () => {
    renderPaySchedule()

    await waitFor(() => {
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /manage/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/autopilot/i)).not.toBeInTheDocument()
  })

  it('prefers the active schedule when the company has more than one', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, () =>
        HttpResponse.json([
          {
            uuid: 'schedule-inactive',
            frequency: 'Monthly',
            custom_name: 'Unassigned Monthly Schedule',
            active: false,
            version: 'v1',
          },
          {
            uuid: 'schedule-active',
            frequency: 'Every week',
            custom_name: 'Weekly Schedule',
            active: true,
            version: 'v1',
          },
        ]),
      ),
    )

    renderPaySchedule()

    await waitFor(() => {
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    })

    expect(screen.queryByText('Unassigned Monthly Schedule')).not.toBeInTheDocument()
  })

  it('navigates directly to the create form when the company has no pay schedules', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, () =>
        HttpResponse.json([]),
      ),
    )

    renderPaySchedule()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /add pay schedule/i })).toBeInTheDocument()
    })

    expect(screen.queryByRole('heading', { name: /^pay schedule$/i })).not.toBeInTheDocument()
  })

  it('returns to the overview after creating the first pay schedule', async () => {
    const user = userEvent.setup()

    let scheduleCreated = false
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, async () => {
        if (!scheduleCreated) return HttpResponse.json([])
        const responseFixture = await getFixture('get-v1-companies-company_id-pay_schedules')
        return HttpResponse.json(responseFixture.paySchedules)
      }),
      http.post(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, async ({ request }) => {
        const requestBody = (await request.json()) as Record<string, unknown>
        const responseFixture = await getFixture('post-v1-companies-company_id-pay_schedules')
        scheduleCreated = true
        return HttpResponse.json({ ...responseFixture, ...requestBody }, { status: 201 })
      }),
    )

    const { onEvent } = renderPaySchedule()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /add pay schedule/i })).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/name/i), 'New Schedule')

    const frequencySelect = screen.getByRole('button', { name: /frequency/i })
    await user.click(frequencySelect)
    await user.click(screen.getByRole('option', { name: /every week/i }))

    const payDateInput = screen.getByRole('group', { name: 'First pay date' })
    await user.type(within(payDateInput).getByRole('spinbutton', { name: /month/i }), '01')
    await user.type(within(payDateInput).getByRole('spinbutton', { name: /day/i }), '01')
    await user.type(within(payDateInput).getByRole('spinbutton', { name: /year/i }), '2025')

    const endDateInput = screen.getByRole('group', { name: 'First pay period end date' })
    await user.type(within(endDateInput).getByRole('spinbutton', { name: /month/i }), '01')
    await user.type(within(endDateInput).getByRole('spinbutton', { name: /day/i }), '07')
    await user.type(within(endDateInput).getByRole('spinbutton', { name: /year/i }), '2025')

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_CREATED, expect.any(Object))
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^pay schedule$/i })).toBeInTheDocument()
    })
    expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
  }, 10000)

  it('fires PAY_SCHEDULE_MANAGE_ASSIGNMENT when Manage is clicked, without navigating away', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderPaySchedule({ enableMultipleSchedules: true })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /manage/i }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_MANAGE_ASSIGNMENT, undefined)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /choose schedule type/i })).toBeInTheDocument()
    })
  })

  it('returns to the overview when the assignment flow is cancelled', async () => {
    const user = userEvent.setup()
    renderPaySchedule({ enableMultipleSchedules: true })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /manage/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /choose schedule type/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /back/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /pay schedule/i })).toBeInTheDocument()
    })
  })

  it('keeps the assignment draft on the schedule step when Add pay schedule is cancelled', async () => {
    const user = userEvent.setup()
    renderPaySchedule({ enableMultipleSchedules: true })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /manage/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /choose schedule type/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /assign employees/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /add pay schedule/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /add pay schedule/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /assign employees/i })).toBeInTheDocument()
    })
  })

  it('returns to the overview after submitting the assignment', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderPaySchedule({ enableMultipleSchedules: true })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /manage/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /choose schedule type/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /assign employees/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /there are no changes to review/i }),
      ).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_ASSIGNED, {
        type: 'single',
        defaultPayScheduleUuid: 'schedule-1',
        employeeChanges: [],
      })
    })
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /pay schedule/i })).toBeInTheDocument()
    })
    expect(screen.getByText('Pay schedule assignment updated.')).toBeInTheDocument()
  })

  it('dismisses the assignment success alert', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderPaySchedule({ enableMultipleSchedules: true })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /manage/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /choose schedule type/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /assign employees/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /there are no changes to review/i }),
      ).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText('Pay schedule assignment updated.')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /dismiss alert/i }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.PAY_SCHEDULE_MANAGEMENT_ALERT_DISMISSED,
      null,
    )
    expect(screen.queryByText('Pay schedule assignment updated.')).toBeNull()
  })

  it('opens the AutoPilot dialog when the AutoPilot Edit button is clicked, without navigating away', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderPaySchedule({ enableAutoPilot: true })

    await waitFor(() => {
      expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[editButtons.length - 1]!)

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.PAY_SCHEDULE_AUTO_PILOT_EDIT,
      expect.objectContaining({ schedule: expect.objectContaining({ uuid: expect.any(String) }) }),
    )
    expect(screen.getByRole('heading', { name: /pay schedule/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/enable autopilot/i)).toBeInTheDocument()
  })

  it('shows the known preflight blockers already on the schedule when the dialog opens', async () => {
    server.use(
      http.get(
        `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:pay_schedule_id`,
        async () => {
          const responseFixture = await getFixture('get-v1-companies-company_id-pay_schedules')
          return HttpResponse.json({
            ...responseFixture.paySchedules[0],
            auto_payroll_enablement_blockers: [{ key: 'employees_not_on_direct_deposit' }],
          })
        },
      ),
    )
    const user = userEvent.setup()
    renderPaySchedule({ enableAutoPilot: true })

    await waitFor(() => {
      expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[editButtons.length - 1]!)

    await waitFor(() => {
      expect(screen.getByText(/some employees aren't on direct deposit/i)).toBeInTheDocument()
    })
  })

  it('disables the toggle and never calls the update API when blockers prevent enabling', async () => {
    server.use(
      http.get(
        `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:pay_schedule_id`,
        async () => {
          const responseFixture = await getFixture('get-v1-companies-company_id-pay_schedules')
          return HttpResponse.json({
            ...responseFixture.paySchedules[0],
            auto_payroll_enablement_blockers: [{ key: 'employees_not_on_direct_deposit' }],
          })
        },
      ),
    )
    const updateResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
    server.use(
      http.put(
        `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:schedule_id`,
        updateResolver,
      ),
    )
    const user = userEvent.setup()
    const { onEvent } = renderPaySchedule({ enableAutoPilot: true })

    await waitFor(() => {
      expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[editButtons.length - 1]!)

    await waitFor(() => {
      expect(screen.getByText(/some employees aren't on direct deposit/i)).toBeInTheDocument()
    })
    const toggle = screen.getByLabelText(/enable autopilot/i)
    expect(toggle).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_AUTO_PILOT_DISMISSED, null)
    })
    expect(updateResolver).not.toHaveBeenCalled()
  })

  it('disables the toggle and never calls the update API when the eligibility check fails', async () => {
    server.use(
      http.get(
        `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:pay_schedule_id`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    // Re-assert the assignments handler so the 500 above applies only to the single-schedule
    // fetch the AutoPilot dialog makes.
    server.use(getPayScheduleAssignments)
    const updateResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
    server.use(
      http.put(
        `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:schedule_id`,
        updateResolver,
      ),
    )
    const user = userEvent.setup()
    const { onEvent } = renderPaySchedule({ enableAutoPilot: true })

    await waitFor(() => {
      expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[editButtons.length - 1]!)

    await waitFor(() => {
      expect(screen.getByText(/autopilot can't be enabled right now/i)).toBeInTheDocument()
    })
    const toggle = screen.getByLabelText(/enable autopilot/i)
    expect(toggle).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_AUTO_PILOT_DISMISSED, null)
    })
    expect(updateResolver).not.toHaveBeenCalled()
  })

  it('keeps the toggle enabled so an already-enabled schedule can still be disabled despite blockers', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, async () => {
        const responseFixture = await getFixture('get-v1-companies-company_id-pay_schedules')
        return HttpResponse.json([
          {
            ...responseFixture.paySchedules[0],
            auto_payroll: true,
            auto_payroll_enablement_blockers: [{ key: 'employees_not_on_direct_deposit' }],
          },
        ])
      }),
    )
    const updateResolver = vi.fn<HttpResponseResolver>(async () => {
      const responseFixture = await getFixture(
        'put-v1-companies-company_id-pay_schedules-pay_schedule_id',
      )
      return HttpResponse.json({ ...responseFixture, auto_payroll: false })
    })
    server.use(
      http.put(
        `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:schedule_id`,
        updateResolver,
      ),
    )
    const user = userEvent.setup()
    const { onEvent } = renderPaySchedule({ enableAutoPilot: true })

    await waitFor(() => {
      expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[editButtons.length - 1]!)

    const toggle = await screen.findByLabelText(/enable autopilot/i)
    expect(toggle).not.toBeDisabled()
    // The blocker list is enable-only messaging and shouldn't show for an already-enabled schedule.
    expect(screen.queryByText(/isn't available yet/i)).toBeNull()

    await user.click(toggle)
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_AUTO_PILOT_DISABLED, null)
    })
    expect(updateResolver).toHaveBeenCalledTimes(1)
  })

  it('fires DISMISSED without calling the update API when Save is clicked with no change', async () => {
    const updateResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
    server.use(
      http.put(
        `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:schedule_id`,
        updateResolver,
      ),
    )
    const user = userEvent.setup()
    const { onEvent } = renderPaySchedule({ enableAutoPilot: true })

    await waitFor(() => {
      expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[editButtons.length - 1]!)

    await screen.findByLabelText(/enable autopilot/i)
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_AUTO_PILOT_DISMISSED, null)
    })
    expect(updateResolver).not.toHaveBeenCalled()
  })

  it('enables AutoPilot and closes the dialog on save', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderPaySchedule({ enableAutoPilot: true })

    await waitFor(() => {
      expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[editButtons.length - 1]!)

    const toggle = await screen.findByLabelText(/enable autopilot/i)
    await user.click(toggle)
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_AUTO_PILOT_ENABLED, null)
    })
    expect(screen.queryByLabelText(/enable autopilot/i)).toBeNull()
  })

  it('closes the AutoPilot dialog without firing enabled/disabled when canceled', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderPaySchedule({ enableAutoPilot: true })

    await waitFor(() => {
      expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[editButtons.length - 1]!)

    await screen.findByLabelText(/enable autopilot/i)
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByLabelText(/enable autopilot/i)).toBeNull()
    })
    expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_AUTO_PILOT_DISMISSED, null)
    expect(onEvent).not.toHaveBeenCalledWith(
      componentEvents.PAY_SCHEDULE_AUTO_PILOT_ENABLED,
      expect.anything(),
    )
    expect(onEvent).not.toHaveBeenCalledWith(
      componentEvents.PAY_SCHEDULE_AUTO_PILOT_DISABLED,
      expect.anything(),
    )
  })

  it('shows a generic error when the AutoPilot save fails with an unclassified 422', async () => {
    server.use(
      http.put(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:schedule_id`, () => {
        return HttpResponse.json({ errors: [{ message: 'blocked' }] }, { status: 422 })
      }),
    )
    const user = userEvent.setup()
    renderPaySchedule({ enableAutoPilot: true })

    await waitFor(() => {
      expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[editButtons.length - 1]!)

    const toggle = await screen.findByLabelText(/enable autopilot/i)
    await user.click(toggle)
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/autopilot settings couldn't be saved/i)).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/enable autopilot/i)).toBeInTheDocument()
  })

  it('shows the backend-provided message when the AutoPilot save fails with a classified blocker', async () => {
    server.use(
      http.put(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:schedule_id`, () => {
        return HttpResponse.json(
          {
            errors: [
              {
                error_key: 'auto_payroll',
                category: 'invalid_attribute_value',
                message: "AutoPilot isn't available for schedules using next-day ACH.",
              },
            ],
          },
          { status: 422 },
        )
      }),
    )
    const user = userEvent.setup()
    renderPaySchedule({ enableAutoPilot: true })

    await waitFor(() => {
      expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[editButtons.length - 1]!)

    const toggle = await screen.findByLabelText(/enable autopilot/i)
    await user.click(toggle)
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/autopilot isn't available for schedules using next-day ach/i),
      ).toBeInTheDocument()
    })
    expect(screen.queryByText(/contact support if this continues/i)).toBeNull()
  })

  it('opens the existing edit form when the schedule Edit button is clicked', async () => {
    const user = userEvent.setup()
    renderPaySchedule()

    await waitFor(() => {
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    })

    await user.click(screen.getAllByRole('button', { name: /edit/i })[0]!)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit pay schedule/i })).toBeInTheDocument()
    })
    expect(screen.getByDisplayValue('Weekly Schedule')).toBeInTheDocument()
  })

  it('returns to the overview after canceling the edit form', async () => {
    const user = userEvent.setup()
    renderPaySchedule()

    await waitFor(() => {
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    })

    await user.click(screen.getAllByRole('button', { name: /edit/i })[0]!)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit pay schedule/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /pay schedule/i })).toBeInTheDocument()
    })
  })

  it('returns to the overview after a successful update', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderPaySchedule()

    await waitFor(() => {
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    })

    await user.click(screen.getAllByRole('button', { name: /edit/i })[0]!)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Weekly Schedule')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/name/i), ' Updated')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_UPDATED, expect.any(Object))
    })
    expect(screen.getByRole('heading', { name: /pay schedule/i })).toBeInTheDocument()
  })

  describe('assignment by compensation type', () => {
    const hourlySalariedSchedules = [
      {
        uuid: 'schedule-hourly',
        frequency: 'Every week',
        custom_name: 'Hourly Team',
        active: true,
        auto_payroll: false,
        version: 'v1',
      },
      {
        uuid: 'schedule-salaried',
        frequency: 'Twice per month',
        custom_name: 'Salaried Team',
        active: true,
        auto_payroll: true,
        version: 'v2',
      },
    ]

    const useHourlySalariedAssignment = (
      assignment: Record<string, unknown> = {
        type: 'hourly_salaried',
        hourly_pay_schedule_uuid: 'schedule-hourly',
        salaried_pay_schedule_uuid: 'schedule-salaried',
      },
    ) => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, () =>
          HttpResponse.json(hourlySalariedSchedules),
        ),
      )
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/assignments`, () =>
          HttpResponse.json(assignment),
        ),
      )
    }

    it('renders a row per compensation type', async () => {
      useHourlySalariedAssignment()
      renderPaySchedule({ enableAutoPilot: true, enableMultipleSchedules: true })

      await waitFor(() => {
        expect(screen.getByText('Salaried Team')).toBeInTheDocument()
      })

      // react-aria names each row by its first cell, i.e. the compensation type.
      const salariedRow = screen.getByRole('row', { name: 'Salaried' })
      expect(salariedRow).toHaveTextContent('Salaried Team')
      expect(salariedRow).toHaveTextContent('Twice per month')
      expect(salariedRow).toHaveTextContent('Enabled')

      const hourlyRow = screen.getByRole('row', { name: 'Hourly' })
      expect(hourlyRow).toHaveTextContent('Hourly Team')
      expect(hourlyRow).toHaveTextContent('Every week')
      expect(hourlyRow).toHaveTextContent('Disabled')

      expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument()
    })

    it('edits the schedule for the row whose menu was used', async () => {
      useHourlySalariedAssignment()
      const user = userEvent.setup()
      const { onEvent } = renderPaySchedule({ enableAutoPilot: true })

      await waitFor(() => {
        expect(screen.getByText('Hourly Team')).toBeInTheDocument()
      })

      const hourlyRow = screen.getByRole('row', { name: 'Hourly' })
      await user.click(within(hourlyRow).getByRole('button', { name: /pay schedule actions/i }))
      await user.click(screen.getByRole('menuitem', { name: /edit schedule/i }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_UPDATE, {
        uuid: 'schedule-hourly',
      })
    })

    it('opens the AutoPilot dialog for the row whose menu was used', async () => {
      useHourlySalariedAssignment()
      const user = userEvent.setup()
      const { onEvent } = renderPaySchedule({ enableAutoPilot: true })

      await waitFor(() => {
        expect(screen.getByText('Salaried Team')).toBeInTheDocument()
      })

      const salariedRow = screen.getByRole('row', { name: 'Salaried' })
      await user.click(within(salariedRow).getByRole('button', { name: /pay schedule actions/i }))
      await user.click(screen.getByRole('menuitem', { name: /^autopilot$/i }))

      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.PAY_SCHEDULE_AUTO_PILOT_EDIT,
        expect.objectContaining({
          schedule: expect.objectContaining({ uuid: 'schedule-salaried' }),
        }),
      )
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('omits the AutoPilot column and row action when enableAutoPilot is false', async () => {
      useHourlySalariedAssignment()
      const user = userEvent.setup()
      renderPaySchedule({ enableAutoPilot: false })

      await waitFor(() => {
        expect(screen.getByText('Hourly Team')).toBeInTheDocument()
      })

      expect(screen.queryByText(/autopilot/i)).not.toBeInTheDocument()

      const hourlyRow = screen.getByRole('row', { name: 'Hourly' })
      await user.click(within(hourlyRow).getByRole('button', { name: /pay schedule actions/i }))
      expect(screen.getAllByRole('menuitem')).toHaveLength(1)
    })

    it('omits a row whose assigned schedule is missing from the company schedules', async () => {
      useHourlySalariedAssignment({
        type: 'hourly_salaried',
        hourly_pay_schedule_uuid: 'schedule-gone',
        salaried_pay_schedule_uuid: 'schedule-salaried',
      })
      renderPaySchedule({ enableAutoPilot: true })

      await waitFor(() => {
        expect(screen.getByRole('row', { name: 'Salaried' })).toBeInTheDocument()
      })

      expect(screen.queryByRole('row', { name: 'Hourly' })).toBeNull()
    })

    it('falls back to the single-schedule overview for other assignment types', async () => {
      useHourlySalariedAssignment({ type: 'by_department', departments: [] })
      renderPaySchedule({ enableAutoPilot: true, enableMultipleSchedules: true })

      await waitFor(() => {
        expect(
          screen.getByText(/you have assigned everyone to be on one pay schedule/i),
        ).toBeInTheDocument()
      })
    })
  })
})
