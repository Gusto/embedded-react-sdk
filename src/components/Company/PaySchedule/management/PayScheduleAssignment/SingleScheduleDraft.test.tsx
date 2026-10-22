import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PayScheduleAssignment } from './PayScheduleAssignment'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'

const companyPath = `${API_BASE_URL}/v1/companies/:company_id`

describe('single-schedule assignment draft', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(
      http.get(`${companyPath}/departments`, () => HttpResponse.json([])),
      http.get(`${companyPath}/pay_schedules/assignments`, () =>
        HttpResponse.json({ type: 'single', default_pay_schedule_uuid: 'weekly' }),
      ),
      http.get(`${companyPath}/pay_schedules`, () =>
        HttpResponse.json([
          {
            uuid: 'weekly',
            version: 'v1',
            frequency: 'Every week',
            custom_name: 'Weekly',
            active: true,
          },
          {
            uuid: 'monthly',
            version: 'v2',
            frequency: 'Monthly',
            custom_name: 'Monthly',
            active: false,
          },
        ]),
      ),
    )
  })

  async function editSchedule() {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    renderWithProviders(<PayScheduleAssignment companyId="123" onEvent={onEvent} />, {
      unstableFeatures: { managePaySchedules: true },
    })
    await user.click(await screen.findByRole('button', { name: /continue/i }))
    await user.click(await screen.findByRole('button', { name: /weekly/i }))
    await user.click(screen.getByRole('option', { name: /monthly/i }))
    return { user, onEvent }
  }

  it('preserves the pick after Back and Continue', async () => {
    const { user, onEvent } = await editSchedule()
    await user.click(screen.getByRole('button', { name: /^back$/i }))
    expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_ASSIGNMENT_BACK, {
      defaultPayScheduleUuid: 'monthly',
    })
    await user.click(await screen.findByRole('button', { name: /continue/i }))
    expect(await screen.findByRole('button', { name: /monthly/i })).toBeInTheDocument()
  })

  it('preserves the pick when adding a schedule is cancelled', async () => {
    const { user, onEvent } = await editSchedule()
    await user.click(screen.getByRole('button', { name: /add pay schedule/i }))
    expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_CREATE, {
      defaultPayScheduleUuid: 'monthly',
    })
    await user.click(await screen.findByRole('button', { name: /cancel/i }))
    expect(await screen.findByRole('button', { name: /monthly/i })).toBeInTheDocument()
  })
})
