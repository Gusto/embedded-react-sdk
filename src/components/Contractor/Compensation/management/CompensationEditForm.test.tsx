import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { CompensationEditForm } from './CompensationEditForm'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetContractor, handleUpdateContractor } from '@/test/mocks/apis/contractors'
import { componentEvents } from '@/shared/constants'

function mockContractor(overrides: Record<string, unknown> = {}) {
  server.use(
    handleGetContractor(() =>
      HttpResponse.json({
        uuid: 'contractor-123',
        type: 'Individual',
        is_active: true,
        version: 'v1',
        wage_type: 'Hourly',
        hourly_rate: '45.00',
        file_new_hire_report: false,
        ...overrides,
      }),
    ),
  )
}

describe('CompensationEditForm', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    mockContractor()
  })

  it('shows the hourly rate field pre-filled for an Hourly contractor', async () => {
    renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByLabelText('Hourly')).toBeChecked()
    expect(screen.getByLabelText('Hourly rate')).toHaveValue('45.00')
  })

  it('hides the hourly rate field when Fixed is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByLabelText('Hourly')
    await user.click(screen.getByLabelText('Fixed'))

    await waitFor(() => {
      expect(screen.queryByLabelText('Hourly rate')).not.toBeInTheDocument()
    })
  })

  it('saves successfully and fires CONTRACTOR_MANAGEMENT_COMPENSATION_UPDATED', async () => {
    let requestBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      requestBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        uuid: 'contractor-123',
        type: 'Individual',
        is_active: true,
        version: 'v2',
        wage_type: 'Hourly',
        hourly_rate: '50.00',
        file_new_hire_report: false,
      })
    })
    server.use(handleUpdateContractor(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByLabelText('Hourly')
    const rateField = screen.getByLabelText('Hourly rate')
    await user.clear(rateField)
    await user.type(rateField, '50')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(requestBody).toMatchObject({ type: 'Individual', wage_type: 'Hourly' })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_UPDATED,
      expect.objectContaining({ hourlyRate: '50.00' }),
    )
  })

  it('fires CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_CANCELLED when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CompensationEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByLabelText('Hourly')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_CANCELLED,
    )
  })
})
