import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { Address } from './Address'
import { server } from '@/test/mocks/server'
import {
  handleGetContractor,
  handleGetContractorAddress,
  handleUpdateContractorAddress,
} from '@/test/mocks/apis/contractor_address'
import {
  buildContractorDocumentsList,
  handleGetContractorDocuments,
} from '@/test/mocks/apis/contractor_documents'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { contractorEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const emptyAddressResponse = {
  version: 'contractor-address-version',
  street_1: null,
  street_2: null,
  city: null,
  state: null,
  zip: null,
  country: 'USA',
}

const exampleUpdatedAddress = {
  version: 'contractor-address-version-updated',
  country: 'USA',
  street_1: '123 Main St',
  street_2: 'Apt 4B',
  city: 'Denver',
  state: 'CO',
  zip: '80202',
}

async function selectState(user: ReturnType<typeof userEvent.setup>, stateName: RegExp) {
  const stateControl = screen.getByRole('button', {
    name: /Select state.../i,
    expanded: false,
  })
  await user.click(stateControl)
  const option = screen.getByRole('option', { name: stateName })
  await user.click(option)
}

async function fillAllFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Street 1'), '123 Main St')
  await user.type(screen.getByLabelText(/Street 2/i), 'Apt 4B')
  await user.type(screen.getByLabelText('City'), 'Denver')
  await selectState(user, /Colorado/i)
  await user.type(screen.getByLabelText('Zip'), '80202')
}

describe('Contractor/Address', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('when API has minimal address details', () => {
    beforeEach(() => {
      server.use(
        handleGetContractorAddress(() => HttpResponse.json(emptyAddressResponse)),
        handleUpdateContractorAddress(() => HttpResponse.json(exampleUpdatedAddress)),
      )
    })

    it('should allow submitting the form', async () => {
      const user = userEvent.setup()
      const mockOnEvent = vi.fn()

      renderWithProviders(<Address contractorId="contractor_id" onEvent={mockOnEvent} />)

      await screen.findByText('Home address')

      await fillAllFields(user)

      await user.click(screen.getByRole('button', { name: /Continue/i }))

      expect(mockOnEvent).toHaveBeenNthCalledWith(
        1,
        contractorEvents.CONTRACTOR_ADDRESS_UPDATED,
        expect.objectContaining({
          version: exampleUpdatedAddress.version,
          street1: exampleUpdatedAddress.street_1,
          street2: exampleUpdatedAddress.street_2,
          city: exampleUpdatedAddress.city,
          state: exampleUpdatedAddress.state,
          zip: exampleUpdatedAddress.zip,
          country: exampleUpdatedAddress.country,
        }),
      )

      expect(mockOnEvent).toHaveBeenNthCalledWith(2, contractorEvents.CONTRACTOR_ADDRESS_DONE)
    })

    it('should allow setting default values', async () => {
      renderWithProviders(
        <Address
          contractorId="contractor_id"
          onEvent={() => {}}
          defaultValues={{
            street1: '999 Default St',
            street2: 'Apt 123',
            city: 'Default City',
            state: 'CO',
            zip: '80202',
          }}
        />,
      )

      await screen.findByText('Home address')

      expect(screen.getByLabelText('Street 1')).toHaveValue('999 Default St')
      expect(screen.getByLabelText(/Street 2/i)).toHaveValue('Apt 123')
      expect(screen.getByLabelText('City')).toHaveValue('Default City')
      expect(
        screen.getByRole('button', {
          name: /Colorado/i,
          expanded: false,
        }),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Zip')).toHaveValue('80202')
    })
  })

  describe('required field validation', () => {
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(exampleUpdatedAddress),
    )

    beforeEach(() => {
      updateResolver.mockClear()
      server.use(
        handleGetContractorAddress(() => HttpResponse.json(emptyAddressResponse)),
        handleUpdateContractorAddress(updateResolver),
      )
    })

    it('blocks submission and surfaces every required message when all fields are empty', async () => {
      const user = userEvent.setup()
      const mockOnEvent = vi.fn()

      renderWithProviders(<Address contractorId="contractor_id" onEvent={mockOnEvent} />)

      await screen.findByText('Home address')

      await user.click(screen.getByRole('button', { name: /Continue/i }))

      expect(await screen.findByText('Street address is required')).toBeInTheDocument()
      expect(screen.getByText('Please provide valid city name')).toBeInTheDocument()
      expect(screen.getByText('Please select a state')).toBeInTheDocument()
      expect(screen.getByText('Please provide valid zip code')).toBeInTheDocument()

      expect(updateResolver).not.toHaveBeenCalled()
      expect(mockOnEvent).not.toHaveBeenCalled()
    })

    it('requires street1', async () => {
      const user = userEvent.setup()
      const mockOnEvent = vi.fn()

      renderWithProviders(<Address contractorId="contractor_id" onEvent={mockOnEvent} />)
      await screen.findByText('Home address')

      await user.type(screen.getByLabelText('City'), 'Denver')
      await selectState(user, /Colorado/i)
      await user.type(screen.getByLabelText('Zip'), '80202')

      await user.click(screen.getByRole('button', { name: /Continue/i }))

      expect(await screen.findByText('Street address is required')).toBeInTheDocument()
      expect(updateResolver).not.toHaveBeenCalled()
      expect(mockOnEvent).not.toHaveBeenCalled()
    })

    it('requires city', async () => {
      const user = userEvent.setup()
      const mockOnEvent = vi.fn()

      renderWithProviders(<Address contractorId="contractor_id" onEvent={mockOnEvent} />)
      await screen.findByText('Home address')

      await user.type(screen.getByLabelText('Street 1'), '123 Main St')
      await selectState(user, /Colorado/i)
      await user.type(screen.getByLabelText('Zip'), '80202')

      await user.click(screen.getByRole('button', { name: /Continue/i }))

      expect(await screen.findByText('Please provide valid city name')).toBeInTheDocument()
      expect(updateResolver).not.toHaveBeenCalled()
      expect(mockOnEvent).not.toHaveBeenCalled()
    })

    it('requires state', async () => {
      const user = userEvent.setup()
      const mockOnEvent = vi.fn()

      renderWithProviders(<Address contractorId="contractor_id" onEvent={mockOnEvent} />)
      await screen.findByText('Home address')

      await user.type(screen.getByLabelText('Street 1'), '123 Main St')
      await user.type(screen.getByLabelText('City'), 'Denver')
      await user.type(screen.getByLabelText('Zip'), '80202')

      await user.click(screen.getByRole('button', { name: /Continue/i }))

      expect(await screen.findByText('Please select a state')).toBeInTheDocument()
      expect(updateResolver).not.toHaveBeenCalled()
      expect(mockOnEvent).not.toHaveBeenCalled()
    })

    it('requires zip', async () => {
      const user = userEvent.setup()
      const mockOnEvent = vi.fn()

      renderWithProviders(<Address contractorId="contractor_id" onEvent={mockOnEvent} />)
      await screen.findByText('Home address')

      await user.type(screen.getByLabelText('Street 1'), '123 Main St')
      await user.type(screen.getByLabelText('City'), 'Denver')
      await selectState(user, /Colorado/i)

      await user.click(screen.getByRole('button', { name: /Continue/i }))

      expect(await screen.findByText('Please provide valid zip code')).toBeInTheDocument()
      expect(updateResolver).not.toHaveBeenCalled()
      expect(mockOnEvent).not.toHaveBeenCalled()
    })

    it('treats street2 as optional and submits without it', async () => {
      const user = userEvent.setup()
      const mockOnEvent = vi.fn()

      renderWithProviders(<Address contractorId="contractor_id" onEvent={mockOnEvent} />)
      await screen.findByText('Home address')

      await user.type(screen.getByLabelText('Street 1'), '123 Main St')
      await user.type(screen.getByLabelText('City'), 'Denver')
      await selectState(user, /Colorado/i)
      await user.type(screen.getByLabelText('Zip'), '80202')

      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
      expect(mockOnEvent).toHaveBeenCalledWith(
        contractorEvents.CONTRACTOR_ADDRESS_UPDATED,
        expect.anything(),
      )
    })
  })

  describe('update request contract', () => {
    let updatePath: string | null = null
    let updateBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updatePath = new URL(request.url).pathname
      updateBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(exampleUpdatedAddress)
    })

    beforeEach(() => {
      updatePath = null
      updateBody = null
      updateResolver.mockClear()
      server.use(
        handleGetContractorAddress(() => HttpResponse.json(emptyAddressResponse)),
        handleUpdateContractorAddress(updateResolver),
      )
    })

    it('issues a single PUT to the contractor address path with the version and field values', async () => {
      const user = userEvent.setup()

      renderWithProviders(<Address contractorId="contractor_id" onEvent={() => {}} />)
      await screen.findByText('Home address')

      await fillAllFields(user)
      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })

      expect(updatePath).toBe('/v1/contractors/contractor_id/address')
      expect(updateBody).toMatchObject({
        version: emptyAddressResponse.version,
        street_1: '123 Main St',
        street_2: 'Apt 4B',
        city: 'Denver',
        state: 'CO',
        zip: '80202',
      })
    })
  })

  describe('submit pending state', () => {
    beforeEach(() => {
      server.use(handleGetContractorAddress(() => HttpResponse.json(emptyAddressResponse)))
    })

    it('disables the submit button while the update is in flight', async () => {
      const user = userEvent.setup()
      let resolveUpdate: (() => void) | undefined
      const updateGate = new Promise<void>(resolve => {
        resolveUpdate = resolve
      })

      server.use(
        handleUpdateContractorAddress(async () => {
          await updateGate
          return HttpResponse.json(exampleUpdatedAddress)
        }),
      )

      renderWithProviders(<Address contractorId="contractor_id" onEvent={() => {}} />)
      await screen.findByText('Home address')

      await fillAllFields(user)

      const continueButton = screen.getByRole('button', { name: /Continue/i })
      await user.click(continueButton)

      await waitFor(() => {
        expect(continueButton).toBeDisabled()
      })

      resolveUpdate?.()

      await waitFor(() => {
        expect(continueButton).not.toBeDisabled()
      })
    })
  })

  describe('when API has full address details', () => {
    beforeEach(() => {
      server.use(
        handleGetContractorAddress(() =>
          HttpResponse.json({
            version: 'contractor-address-version',
            street_1: '999 Kiera Stravenue',
            street_2: 'Suite 541',
            city: 'San Francisco',
            state: 'CA',
            zip: '94107',
            country: 'USA',
          }),
        ),
      )
    })

    it('should defer to values from API over default values', async () => {
      renderWithProviders(
        <Address
          contractorId="contractor_id"
          onEvent={() => {}}
          defaultValues={{
            street1: '999 Default St',
            street2: 'Apt 123',
            city: 'Default City',
            state: 'CO',
            zip: '80202',
          }}
        />,
      )

      await screen.findByText('Home address')

      expect(screen.getByLabelText('Street 1')).toHaveValue('999 Kiera Stravenue')
      expect(screen.getByLabelText(/Street 2/i)).toHaveValue('Suite 541')
      expect(screen.getByLabelText('City')).toHaveValue('San Francisco')
      expect(
        screen.getByRole('button', {
          name: /California/i,
          expanded: false,
        }),
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Zip')).toHaveValue('94107')
    })

    it('submits the version from the loaded address', async () => {
      const user = userEvent.setup()
      let updateBody: Record<string, unknown> | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        updateBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(exampleUpdatedAddress)
      })
      server.use(handleUpdateContractorAddress(updateResolver))

      renderWithProviders(<Address contractorId="contractor_id" onEvent={() => {}} />)
      await screen.findByText('Home address')

      await user.click(screen.getByRole('button', { name: /Continue/i }))

      await waitFor(() => {
        expect(updateResolver).toHaveBeenCalledTimes(1)
      })
      expect(updateBody).toMatchObject({ version: 'contractor-address-version' })
    })
  })

  describe('contractor type in heading', () => {
    it('should show individual text when contractorType is Individual', async () => {
      renderWithProviders(<Address contractorId="contractor_id" onEvent={() => {}} />)

      expect(await screen.findByText('Home address')).toBeInTheDocument()
      expect(
        screen.getByText("Contractor's home mailing address, within the United States."),
      ).toBeInTheDocument()
    })

    it('should show business text when contractorType is Business', async () => {
      server.use(
        handleGetContractor(() => {
          return HttpResponse.json({
            uuid: 'contractor_id',
            type: 'Business',
            is_active: true,
            file_new_hire_report: false,
          })
        }),
      )

      renderWithProviders(<Address contractorId="contractor_id" onEvent={() => {}} />)

      expect(await screen.findByText('Business address')).toBeInTheDocument()
      expect(
        screen.getByText("Contractor's business address, within the United States."),
      ).toBeInTheDocument()
    })
  })

  describe('W-9 edit warning', () => {
    beforeEach(() => {
      setupApiTestMocks()
      server.use(handleGetContractorAddress(() => HttpResponse.json(emptyAddressResponse)))
    })

    it('renders the warning when the contractor has a signed W-9 on file', async () => {
      server.use(
        handleGetContractorDocuments(() =>
          HttpResponse.json(
            buildContractorDocumentsList([
              {
                uuid: 'signed-w9-uuid',
                title: 'W-9',
                name: 'taxpayer_identification_form_w_9',
                requires_signing: true,
                signed_at: '2025-01-01T00:00:00Z',
              },
            ]),
          ),
        ),
      )

      renderWithProviders(<Address contractorId="contractor_id" onEvent={() => {}} />)

      expect(
        await screen.findByText('Editing this address will require a new W-9'),
      ).toBeInTheDocument()
    })

    it('does not render the warning when the W-9 is unsigned', async () => {
      renderWithProviders(<Address contractorId="contractor_id" onEvent={() => {}} />)

      await screen.findByText('Home address')
      expect(
        screen.queryByText('Editing this address will require a new W-9'),
      ).not.toBeInTheDocument()
    })
  })
})
