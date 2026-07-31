import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { Compensation } from './Compensation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetContractor, handleUpdateContractor } from '@/test/mocks/apis/contractors'
import { componentEvents } from '@/shared/constants'

const contractorWithHourlyPay = {
  uuid: 'contractor-123',
  type: 'Individual',
  is_active: true,
  version: 'v1',
  wage_type: 'Hourly',
  hourly_rate: '45.00',
  file_new_hire_report: false,
}

describe('Compensation (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(handleGetContractor(() => HttpResponse.json(contractorWithHourlyPay)))
  })

  it('renders the card initially with the Compensation title and Edit button', async () => {
    renderWithProviders(<Compensation contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByText('Compensation')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
  })

  it('transitions card → editCompensation when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Compensation contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_REQUESTED,
      { contractorId: 'contractor-123' },
    )
  })

  it('returns to the card without an alert when Cancel is clicked from edit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Compensation contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })
    expect(screen.queryByText('Compensation updated')).toBeNull()
  })

  it('returns to the card with the compensationUpdated alert after a successful save', async () => {
    const user = userEvent.setup()
    server.use(
      handleUpdateContractor(
        vi.fn<HttpResponseResolver>(async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({ ...contractorWithHourlyPay, ...body, version: 'v2' })
        }),
      ),
    )

    renderWithProviders(<Compensation contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(
      () => {
        expect(screen.getByText('Compensation updated')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_UPDATED,
      expect.any(Object),
    )
  })
})
