import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PayScheduleAssignment } from './PayScheduleAssignment'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'
import { getFixture } from '@/test/mocks/fixtures/getFixture'

const companyPath = `${API_BASE_URL}/v1/companies/:company_id`

describe('compensation assignment draft', () => {
  beforeEach(() => {
    setupApiTestMocks()
    let created = false
    server.use(
      http.get(`${companyPath}/pay_schedules/assignments`, () =>
        HttpResponse.json({
          type: 'hourly_salaried',
          hourly_pay_schedule_uuid: 'weekly',
          salaried_pay_schedule_uuid: 'weekly',
        }),
      ),
      http.post(`${companyPath}/pay_schedules`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        const fixture = await getFixture('post-v1-companies-company_id-pay_schedules')
        created = true
        return HttpResponse.json({ ...fixture, ...body, uuid: 'new-schedule' }, { status: 201 })
      }),
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
          ...(created
            ? [
                {
                  uuid: 'new-schedule',
                  version: 'v3',
                  frequency: 'Every week',
                  custom_name: 'New schedule',
                  active: false,
                },
              ]
            : []),
        ]),
      ),
    )
  })

  it.each(['back', 'cancel', 'create'])('preserves selections after %s', async action => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    renderWithProviders(<PayScheduleAssignment companyId="123" onEvent={onEvent} />, {
      unstableFeatures: { managePaySchedules: true },
    })
    await user.click(await screen.findByRole('button', { name: /continue/i }))
    await user.click(await screen.findByRole('button', { name: /hourly/i }))
    await user.click(screen.getByRole('option', { name: /monthly/i }))
    await user.click(
      screen.getByRole('button', { name: action === 'back' ? /^back$/i : /add pay schedule/i }),
    )
    if (action !== 'back') {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.PAY_SCHEDULE_CREATE, {
        hourlyPayScheduleUuid: 'monthly',
        salariedPayScheduleUuid: 'weekly',
      })
    }
    if (action === 'back') {
      await user.click(await screen.findByRole('button', { name: /continue/i }))
    } else if (action === 'cancel') {
      await user.click(await screen.findByRole('button', { name: /cancel/i }))
    } else {
      await user.type(await screen.findByRole('textbox', { name: /^name/i }), 'New schedule')
      for (const [name, day] of [
        ['First pay date', '04'],
        ['First pay period end date', '03'],
      ] as const) {
        const field = screen.getByRole('group', { name })
        await user.type(within(field).getByRole('spinbutton', { name: /month/i }), '01')
        await user.type(within(field).getByRole('spinbutton', { name: /day/i }), day)
        await user.type(within(field).getByRole('spinbutton', { name: /year/i }), '2030')
      }
      await user.click(screen.getByRole('button', { name: /save/i }))
    }
    expect(await screen.findByRole('button', { name: /hourly/i })).toHaveTextContent('Monthly')
    expect(screen.getByRole('button', { name: /salaried/i })).toHaveTextContent('Weekly')
    if (action === 'create') {
      await user.click(screen.getByRole('button', { name: /hourly/i }))
      expect(screen.getByRole('option', { name: /new schedule/i })).toBeInTheDocument()
    }
  })
})
