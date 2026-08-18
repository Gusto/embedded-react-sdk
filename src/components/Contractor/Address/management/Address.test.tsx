import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { Address } from './Address'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import {
  handleGetContractorAddress,
  handleUpdateContractorAddress,
} from '@/test/mocks/apis/contractor_address'
import { componentEvents } from '@/shared/constants'

const fullAddressResponse = {
  version: 'contractor-address-version',
  contractor_uuid: 'contractor-123',
  street_1: '999 Kiera Stravenue',
  street_2: 'Suite 541',
  city: 'San Francisco',
  state: 'CA',
  zip: '94107',
  country: 'USA',
  active: true,
}

describe('Address (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(handleGetContractorAddress(() => HttpResponse.json(fullAddressResponse)))
  })

  it('renders the card initially with the Address title and Edit button', async () => {
    renderWithProviders(<Address contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
  })

  it('transitions card → editAddress when the Edit button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Address contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_REQUESTED,
      { contractorId: 'contractor-123' },
    )
  })

  it('returns to the card without an alert when Cancel is clicked from edit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Address contractorId="contractor-123" onEvent={onEvent} />)

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

    expect(screen.queryByText('Address updated')).toBeNull()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_CANCELLED,
      undefined,
    )
  })

  it('returns to the card with the addressUpdated alert after a successful save', async () => {
    const user = userEvent.setup()
    server.use(
      handleGetContractorAddress(() => HttpResponse.json(fullAddressResponse)),
      handleUpdateContractorAddress(
        vi.fn<HttpResponseResolver>(async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({
            ...fullAddressResponse,
            ...body,
            version: 'contractor-address-version-2',
          })
        }),
      ),
    )

    renderWithProviders(<Address contractorId="contractor-123" onEvent={onEvent} />)

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
        expect(screen.getByText('Address updated')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_UPDATED,
      expect.any(Object),
    )
  })
})
