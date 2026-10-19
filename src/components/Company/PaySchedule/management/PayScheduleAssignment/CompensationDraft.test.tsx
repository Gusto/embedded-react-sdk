import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PayScheduleAssignment } from './PayScheduleAssignment'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

const companyPath = `${API_BASE_URL}/v1/companies/:company_id`

describe('compensation assignment draft', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(
      http.get(`${companyPath}/departments`, () => HttpResponse.json([])),
      http.get(`${companyPath}/pay_schedules/assignments`, () =>
        HttpResponse.json({
          type: 'hourly_salaried',
          hourly_pay_schedule_uuid: 'weekly',
          salaried_pay_schedule_uuid: 'weekly',
        }),
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

  it.each(['back', 'add pay schedule'])('preserves selections after %s', async action => {
    const user = userEvent.setup()
    const onEvent = vi.fn()
    renderWithProviders(<PayScheduleAssignment companyId="123" onEvent={onEvent} />, {
      unstableFeatures: { managePaySchedules: true },
    })
    await user.click(await screen.findByRole('button', { name: /continue/i }))
    await user.click(await screen.findByRole('button', { name: /hourly/i }))
    await user.click(screen.getByRole('option', { name: /monthly/i }))
    await user.click(screen.getByRole('button', { name: new RegExp(`^${action}$`, 'i') }))
    if (action === 'back') {
      await user.click(await screen.findByRole('button', { name: /continue/i }))
    } else {
      await user.click(await screen.findByRole('button', { name: /cancel/i }))
    }
    expect(await screen.findByRole('button', { name: /hourly/i })).toHaveTextContent('Monthly')
    expect(screen.getByRole('button', { name: /salaried/i })).toHaveTextContent('Weekly')
    expect(onEvent.mock.calls.some(([type]) => type === 'assignmentDraftUpdated')).toBe(false)
  })
})
