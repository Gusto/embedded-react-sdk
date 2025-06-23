import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { Address } from './Address'
import { server } from '@/test/mocks/server'
import {
  handleGetContractor,
  handleGetContractorAddress,
  handleUpdateContractorAddress,
} from '@/test/mocks/apis/contractor_address'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { contractorEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Contractor/Address', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('when API has minimal address details', () => {
    const exampleUpdatedAddress = {
      version: 'contractor-address-version-updated',
      country: 'USA',
      street_1: '123 Main St',
      street_2: 'Apt 4B',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
    }

    beforeEach(() => {
      server.use(
        handleGetContractorAddress(() =>
          HttpResponse.json({
            version: 'contractor-address-version',
            street_1: null,
            street_2: null,
            city: null,
            state: null,
            zip: null,
            country: 'USA',
          }),
        ),
        handleUpdateContractorAddress(() => HttpResponse.json(exampleUpdatedAddress)),
      )
    })

    it('should allow submitting the form', async () => {
      const user = userEvent.setup()
      const mockOnEvent = vi.fn()

      renderWithProviders(<Address contractorId="contractor_id" onEvent={mockOnEvent} />)

      await screen.findByText('Home address')

      await user.type(screen.getByLabelText('Street 1'), '123 Main St')
      await user.type(screen.getByLabelText(/Street 2/i), 'Apt 4B')
      await user.type(screen.getByLabelText('City'), 'Denver')

      const stateControl = screen.getByRole('button', {
        name: /Select state.../i,
        expanded: false,
      })
      await user.click(stateControl)
      const coloradoOption = screen.getByRole('option', {
        name: /Colorado/i,
      })
      await user.click(coloradoOption)

      await user.type(screen.getByLabelText('Zip'), '80202')

      const continueButton = screen.getByRole('button', {
        name: /Continue/i,
      })
      await user.click(continueButton)

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
            type: 'Business',
            uuid: 'contractor_id',
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
})
