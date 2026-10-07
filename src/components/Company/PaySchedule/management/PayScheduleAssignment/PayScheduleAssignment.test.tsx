import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { PayScheduleAssignment } from './PayScheduleAssignment'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import {
  getPaySchedules,
  createPaySchedule,
  previewPayScheduleAssignment,
  assignPaySchedules,
} from '@/test/mocks/apis/payschedule'
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

const twoPaySchedulesMock = http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, () =>
  HttpResponse.json([
    {
      uuid: 'schedule-1',
      frequency: 'Every week',
      anchor_pay_date: '2024-01-01',
      anchor_end_of_pay_period: '2024-01-07',
      custom_name: 'Weekly Schedule',
      active: true,
      version: 'v1',
    },
    {
      uuid: 'schedule-2',
      frequency: 'Every other week',
      anchor_pay_date: '2024-01-01',
      anchor_end_of_pay_period: '2024-01-14',
      custom_name: 'Biweekly Schedule',
      active: false,
      version: 'v2',
    },
  ]),
)

const renderAssignment = ({
  onEvent = vi.fn(),
}: { onEvent?: OnEventType<EventType, unknown> } = {}) => {
  renderWithProviders(<PayScheduleAssignment companyId="123" onEvent={onEvent} />, {
    unstableFeatures: { managePaySchedules: true },
  })
  return { onEvent }
}

async function continueThroughTypeStep(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /choose schedule type/i })).toBeInTheDocument()
  })
  await user.click(screen.getByRole('button', { name: /continue/i }))
}

async function continueThroughScheduleStep(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /assign employees/i })).toBeInTheDocument()
  })
  await user.click(screen.getByRole('button', { name: /continue/i }))
}

describe('PayScheduleAssignment', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(
      paymentConfigsMock,
      getPaySchedules,
      createPaySchedule,
      previewPayScheduleAssignment,
      assignPaySchedules,
    )
  })

  it('starts on the type step and advances to the schedule step on Continue', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderAssignment()

    await continueThroughTypeStep(user)

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.PAY_SCHEDULE_ASSIGNMENT_TYPE_SELECTED,
      expect.objectContaining({ type: 'single' }),
    )
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /assign employees/i })).toBeInTheDocument()
    })
  })

  it('selects the compensation type option on the type step', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderAssignment()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /choose schedule type/i })).toBeInTheDocument()
    })
    await user.click(
      screen.getByRole('radio', { name: /separate schedules by compensation type/i }),
    )
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.PAY_SCHEDULE_ASSIGNMENT_TYPE_SELECTED,
      expect.objectContaining({ type: 'hourly_salaried' }),
    )
  })

  it('fires PAY_SCHEDULE_ASSIGNMENT_CANCEL when Back is clicked on the type step', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderAssignment()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /choose schedule type/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /back/i }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_ASSIGNMENT_CANCEL, undefined)
  })

  it('returns to the type step when Back is clicked on the schedule step', async () => {
    const user = userEvent.setup()
    renderAssignment()

    await continueThroughTypeStep(user)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /assign employees/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /back/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /choose schedule type/i })).toBeInTheDocument()
    })
  })

  it('opens the create pay schedule form from Add pay schedule, and Cancel returns to the schedule step', async () => {
    const user = userEvent.setup()
    renderAssignment()

    await continueThroughTypeStep(user)
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

  it('shows no employee changes when the preview returns none, and submits the assignment', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderAssignment()

    await continueThroughTypeStep(user)
    await continueThroughScheduleStep(user)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /there are no changes to review/i }),
      ).toBeInTheDocument()
    })
    expect(screen.getByText(/if you intended to make changes, please go back/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_ASSIGNED, {
        type: 'single',
        defaultPayScheduleUuid: 'schedule-1',
        employeeChanges: [],
      })
    })
  })

  it('renders employee changes from the preview', async () => {
    server.use(
      http.post(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/assignment_preview`, () =>
        HttpResponse.json({
          type: 'single',
          employee_changes: [
            {
              employee_uuid: 'employee-1',
              first_name: 'Ada',
              last_name: 'Lovelace',
              pay_frequency: 'Every week',
            },
          ],
        }),
      ),
    )

    const user = userEvent.setup()
    renderAssignment()

    await continueThroughTypeStep(user)
    await continueThroughScheduleStep(user)

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
  })

  it('returns to the schedule step when Back is clicked on the review step', async () => {
    const user = userEvent.setup()
    renderAssignment()

    await continueThroughTypeStep(user)
    await continueThroughScheduleStep(user)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /there are no changes to review/i }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /back/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /assign employees/i })).toBeInTheDocument()
    })
  })

  describe('assignment by compensation type', () => {
    let previewBody: unknown
    let assignBody: unknown
    let previewResolver: ReturnType<typeof vi.fn<HttpResponseResolver>>
    let assignResolver: ReturnType<typeof vi.fn<HttpResponseResolver>>

    beforeEach(() => {
      previewBody = null
      assignBody = null
      previewResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        previewBody = await request.json()
        return HttpResponse.json({ employee_changes: [] })
      })
      assignResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        assignBody = await request.json()
        return new HttpResponse(null, { status: 200 })
      })

      server.use(
        twoPaySchedulesMock,
        http.post(
          `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/assignment_preview`,
          previewResolver,
        ),
        http.post(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules/assign`, assignResolver),
      )
    })

    async function continueThroughCompensationTypeStep(user: ReturnType<typeof userEvent.setup>) {
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /choose schedule type/i })).toBeInTheDocument()
      })
      await user.click(
        screen.getByRole('radio', { name: /separate schedules by compensation type/i }),
      )
      await user.click(screen.getByRole('button', { name: /continue/i }))
    }

    async function selectSchedule(
      user: ReturnType<typeof userEvent.setup>,
      fieldLabel: RegExp,
      scheduleLabel: RegExp,
    ) {
      await user.click(await screen.findByRole('button', { name: fieldLabel }))
      await user.click(screen.getByRole('option', { name: scheduleLabel }))
    }

    it('offers a pay schedule dropdown for each compensation type', async () => {
      const user = userEvent.setup()
      renderAssignment()

      await continueThroughCompensationTypeStep(user)

      expect(await screen.findByRole('button', { name: /hourly employees/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /salaried employees/i })).toBeInTheDocument()
    })

    it('submits both schedules when hourly and salaried differ', async () => {
      const user = userEvent.setup()
      const { onEvent } = renderAssignment()

      await continueThroughCompensationTypeStep(user)
      await selectSchedule(user, /salaried employees/i, /biweekly schedule/i)
      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(previewResolver).toHaveBeenCalledTimes(1)
      })
      expect(previewBody).toEqual({
        type: 'hourly_salaried',
        hourly_pay_schedule_uuid: 'schedule-1',
        salaried_pay_schedule_uuid: 'schedule-2',
      })

      await user.click(await screen.findByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_ASSIGNED, {
          type: 'hourly_salaried',
          hourlyPayScheduleUuid: 'schedule-1',
          salariedPayScheduleUuid: 'schedule-2',
          employeeChanges: [],
        })
      })
      expect(assignBody).toEqual({
        type: 'hourly_salaried',
        hourly_pay_schedule_uuid: 'schedule-1',
        salaried_pay_schedule_uuid: 'schedule-2',
      })
    })

    it('collapses to a single assignment when both compensation types land on one schedule', async () => {
      const user = userEvent.setup()
      const { onEvent } = renderAssignment()

      await continueThroughCompensationTypeStep(user)
      // Both dropdowns default to the active schedule, so continuing without changing either
      // is the same-schedule case.
      await user.click(await screen.findByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(previewResolver).toHaveBeenCalledTimes(1)
      })
      expect(previewBody).toEqual({
        type: 'single',
        default_pay_schedule_uuid: 'schedule-1',
      })

      await user.click(await screen.findByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_ASSIGNED, {
          type: 'single',
          defaultPayScheduleUuid: 'schedule-1',
          employeeChanges: [],
        })
      })
      expect(assignBody).toEqual({
        type: 'single',
        default_pay_schedule_uuid: 'schedule-1',
      })
    })

    it('keeps the picked schedules when the user re-confirms the same assignment type', async () => {
      const user = userEvent.setup()
      renderAssignment()

      await continueThroughCompensationTypeStep(user)
      await selectSchedule(user, /salaried employees/i, /biweekly schedule/i)
      await user.click(screen.getByRole('button', { name: /continue/i }))

      await user.click(await screen.findByRole('button', { name: /back/i }))
      expect(await screen.findByRole('button', { name: /salaried employees/i })).toHaveTextContent(
        'Biweekly Schedule — Every other week',
      )

      await user.click(screen.getByRole('button', { name: /back/i }))
      await continueThroughCompensationTypeStep(user)

      expect(await screen.findByRole('button', { name: /salaried employees/i })).toHaveTextContent(
        'Biweekly Schedule — Every other week',
      )
    })

    it('resets the picked schedules when the assignment type changes away and back', async () => {
      const user = userEvent.setup()
      renderAssignment()

      await continueThroughCompensationTypeStep(user)
      await selectSchedule(user, /salaried employees/i, /biweekly schedule/i)
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await user.click(await screen.findByRole('button', { name: /back/i }))

      await user.click(await screen.findByRole('button', { name: /back/i }))
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /choose schedule type/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('radio', { name: /everyone on one schedule/i }))
      await user.click(screen.getByRole('button', { name: /continue/i }))

      await user.click(await screen.findByRole('button', { name: /back/i }))
      await continueThroughCompensationTypeStep(user)

      expect(await screen.findByRole('button', { name: /salaried employees/i })).toHaveTextContent(
        'Weekly Schedule — Every week',
      )
    })
  })
})
