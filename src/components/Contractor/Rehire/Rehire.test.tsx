import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { Rehire } from './Rehire'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { handleGetContractor, handleScheduleContractorRehire } from '@/test/mocks/apis/contractors'

const dismissedContractor = {
  uuid: 'contractor-123',
  company_uuid: 'company-123',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  start_date: '2024-03-15',
  dismissal_date: '2025-06-30',
  wage_type: 'Hourly',
  hourly_rate: '50.00',
  is_active: false,
  version: 'version-123',
  onboarded: true,
  onboarding_status: 'onboarding_completed',
}

async function fillStartDate(user: ReturnType<typeof userEvent.setup>) {
  const dateGroup = screen.getByRole('group', { name: /Start date/i })
  await user.type(within(dateGroup).getByRole('spinbutton', { name: /^month/i }), '09')
  await user.type(within(dateGroup).getByRole('spinbutton', { name: /^day/i }), '01')
  await user.type(within(dateGroup).getByRole('spinbutton', { name: /^year/i }), '2026')
}

describe('Rehire', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(handleGetContractor(() => HttpResponse.json(dismissedContractor)))
  })

  it('schedules the rehire and emits contractor/rehire/scheduled with the chosen date', async () => {
    const rehireResolver = vi.fn<HttpResponseResolver>(
      () => new HttpResponse(null, { status: 204 }),
    )
    server.use(handleScheduleContractorRehire(rehireResolver))

    const user = userEvent.setup()
    renderWithProviders(<Rehire contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByRole('heading', { name: 'Rehire Ada Lovelace' })
    await fillStartDate(user)
    await user.click(screen.getByRole('button', { name: 'Rehire contractor' }))

    await vi.waitFor(() => {
      expect(rehireResolver).toHaveBeenCalledTimes(1)
    })
    await vi.waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith('contractor/rehire/scheduled', {
        contractorId: 'contractor-123',
        startDate: '2026-09-01',
        message: 'Rehire scheduled',
      })
    })
  })

  it('shows a validation error and does not call the API when no date is entered', async () => {
    const rehireResolver = vi.fn<HttpResponseResolver>(
      () => new HttpResponse(null, { status: 204 }),
    )
    server.use(handleScheduleContractorRehire(rehireResolver))

    const user = userEvent.setup()
    renderWithProviders(<Rehire contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByRole('heading', { name: 'Rehire Ada Lovelace' })
    await user.click(screen.getByRole('button', { name: 'Rehire contractor' }))

    expect(await screen.findByText('Enter a start date')).toBeInTheDocument()
    expect(rehireResolver).not.toHaveBeenCalled()
  })

  it('emits CANCEL when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Rehire contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByRole('heading', { name: 'Rehire Ada Lovelace' })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onEvent).toHaveBeenCalledWith('CANCEL')
  })
})
