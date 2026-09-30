import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
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
})
