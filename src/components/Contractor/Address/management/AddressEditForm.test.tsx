import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { AddressEditForm } from './AddressEditForm'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import {
  handleGetContractor,
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

function mockContractor(overrides: Record<string, unknown> = {}) {
  server.use(
    handleGetContractor(() =>
      HttpResponse.json({
        uuid: 'contractor-123',
        type: 'Individual',
        is_active: true,
        file_new_hire_report: false,
        ...overrides,
      }),
    ),
  )
}

describe('AddressEditForm — individual contractor', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    mockContractor()
    server.use(handleGetContractorAddress(() => HttpResponse.json(fullAddressResponse)))
  })

  it('renders the home address title and pre-fills fields from the loaded address', async () => {
    renderWithProviders(<AddressEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('999 Kiera Stravenue')

    expect(screen.getByText('Home address')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Suite 541')).toBeInTheDocument()
    expect(screen.getByDisplayValue('San Francisco')).toBeInTheDocument()
    expect(screen.getByDisplayValue('94107')).toBeInTheDocument()
  })

  it('blocks submission when the street address is cleared', async () => {
    const updateResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json(fullAddressResponse))
    server.use(handleUpdateContractorAddress(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<AddressEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('999 Kiera Stravenue')
    await user.clear(screen.getByLabelText('Street 1'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('Street address is required')).toBeInTheDocument()
    })
    expect(updateResolver).not.toHaveBeenCalled()
    expect(onEvent).not.toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_UPDATED,
      expect.anything(),
    )
  })

  it('saves successfully, firing the updated event and showing a success alert', async () => {
    let requestBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      requestBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({ ...fullAddressResponse, city: 'Oakland' })
    })
    server.use(handleUpdateContractorAddress(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<AddressEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('999 Kiera Stravenue')
    await user.clear(screen.getByLabelText('City'))
    await user.type(screen.getByLabelText('City'), 'Oakland')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(requestBody).toMatchObject({ city: 'Oakland' })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_UPDATED,
      expect.objectContaining({ city: 'Oakland' }),
    )
    expect(await screen.findByText('Address updated')).toBeInTheDocument()
  })

  it('fires CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_CANCELLED when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AddressEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('999 Kiera Stravenue')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_CANCELLED,
    )
  })
})

describe('AddressEditForm — business contractor', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    mockContractor({ type: 'Business' })
    server.use(handleGetContractorAddress(() => HttpResponse.json(fullAddressResponse)))
  })

  it('renders the business address title', async () => {
    renderWithProviders(<AddressEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('999 Kiera Stravenue')
    expect(screen.getByText('Business address')).toBeInTheDocument()
  })
})
