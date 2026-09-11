import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PaySchedule } from './PaySchedule'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import {
  createPaySchedule,
  getPaySchedules,
  getPaySchedulePreview,
  updatePaySchedule,
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

  it('fires PAY_SCHEDULE_MANAGE_ASSIGNMENT and opens the assignment flow when Manage is clicked', async () => {
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
  })

  it('fires AUTO_PILOT_EDIT when the AutoPilot Edit button is clicked, without navigating away', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderPaySchedule({ enableAutoPilot: true })

    await waitFor(() => {
      expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[editButtons.length - 1]!)

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.AUTO_PILOT_EDIT,
      expect.objectContaining({ uuid: expect.any(String) }),
    )
    expect(screen.getByText(/autopilot/i)).toBeInTheDocument()
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
})
