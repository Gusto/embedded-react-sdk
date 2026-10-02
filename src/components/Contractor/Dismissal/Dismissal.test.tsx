import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { Dismissal } from './Dismissal'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import {
  handleGetContractor,
  handleScheduleContractorDismissal,
} from '@/test/mocks/apis/contractors'

const baseContractor = {
  uuid: 'contractor-123',
  company_uuid: 'company-123',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  start_date: '2024-03-15',
  wage_type: 'Hourly',
  hourly_rate: '50.00',
  is_active: true,
  version: 'version-123',
  onboarded: true,
  onboarding_status: 'onboarding_completed',
}

async function fillEndDate(user: ReturnType<typeof userEvent.setup>) {
  const dateGroup = screen.getByRole('group', { name: /Dismissal date/i })
  await user.type(within(dateGroup).getByRole('spinbutton', { name: /^month/i }), '09')
  await user.type(within(dateGroup).getByRole('spinbutton', { name: /^day/i }), '01')
  await user.type(within(dateGroup).getByRole('spinbutton', { name: /^year/i }), '2026')
}

describe('Dismissal', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(handleGetContractor(() => HttpResponse.json(baseContractor)))
  })

  it('renders the contractor name in the heading', async () => {
    renderWithProviders(<Dismissal contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByRole('heading', { name: 'Dismiss Ada Lovelace' })).toBeInTheDocument()
  })

  it('schedules the dismissal and emits contractor/dismissal/scheduled with the chosen date', async () => {
    const dismissResolver = vi.fn<HttpResponseResolver>(
      () => new HttpResponse(null, { status: 204 }),
    )
    server.use(handleScheduleContractorDismissal(dismissResolver))

    const user = userEvent.setup()
    renderWithProviders(<Dismissal contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByRole('heading', { name: 'Dismiss Ada Lovelace' })
    await fillEndDate(user)
    await user.click(screen.getByRole('button', { name: 'Dismiss contractor' }))

    await vi.waitFor(() => {
      expect(dismissResolver).toHaveBeenCalledTimes(1)
    })
    expect(onEvent).toHaveBeenCalledWith('contractor/dismissal/scheduled', {
      contractorId: 'contractor-123',
      endDate: '2026-09-01',
      message: 'Dismissal scheduled',
    })
  })

  it('emits CANCEL when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dismissal contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByRole('heading', { name: 'Dismiss Ada Lovelace' })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onEvent).toHaveBeenCalledWith('CANCEL')
  })
})
