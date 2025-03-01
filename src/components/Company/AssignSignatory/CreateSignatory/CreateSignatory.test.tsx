import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { CreateSignatory } from './CreateSignatory'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
import {
  handleGetAllSignatories,
  handleCreateSignatory,
  handleUpdateSignatory,
} from '@/test/mocks/apis/company_signatories'
import { server } from '@/test/mocks/server'

describe('CreateSignatory', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    mockOnEvent.mockClear()
    vi.resetModules()
  })

  describe('when user is creating a signatory', () => {
    beforeEach(() => {
      server.use(
        handleCreateSignatory(() =>
          HttpResponse.json({
            uuid: 'new-signatory-uuid',
            first_name: 'Michael',
            last_name: 'Bluth',
            email: 'michael.bluth@example.com',
            title: 'President',
          }),
        ),
      )
    })

    it('fires the correct created events when form is submitted successfully', async () => {
      const user = userEvent.setup()

      render(
        <GustoTestApiProvider>
          <CreateSignatory companyId="company-123" onEvent={mockOnEvent} />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Signatory person details')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('First name'), 'John')
      await user.type(screen.getByLabelText('Last name'), 'Doe')
      await user.type(screen.getByLabelText('Email address'), 'john.doe@example.com')
      await user.type(screen.getByLabelText('Phone number'), '5551234567')
      await user.type(screen.getByLabelText('Social security number'), '123456789')

      const titleControl = screen.getByRole('button', {
        name: /Select an item/i,
        expanded: false,
      })
      await user.click(titleControl)
      const ownerOption = screen.getByRole('option', { name: 'Owner' })
      await user.click(ownerOption)

      const dateOfBirthInput = screen.getByRole('group', { name: 'Date of birth' })
      await user.type(within(dateOfBirthInput).getByRole('spinbutton', { name: /month/i }), '01')
      await user.type(within(dateOfBirthInput).getByRole('spinbutton', { name: /day/i }), '01')
      await user.type(within(dateOfBirthInput).getByRole('spinbutton', { name: /year/i }), '1995')

      await user.type(screen.getByLabelText('Street 1'), '123 Main St')
      await user.type(screen.getByLabelText('City'), 'San Francisco')

      const stateControl = screen.getByLabelText('State')
      await user.click(stateControl)
      const californiaOption = screen.getByRole('option', { name: 'California' })
      await user.click(californiaOption)

      await user.type(screen.getByLabelText('Zip'), '94105')

      const submitButton = screen.getByRole('button', { name: 'Sign documents' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(companyEvents.COMPANY_SIGNATORY_CREATED, {
          uuid: 'new-signatory-uuid',
          first_name: 'Michael',
          last_name: 'Bluth',
          email: 'michael.bluth@example.com',
          title: 'President',
        })
        expect(mockOnEvent).toHaveBeenCalledWith(companyEvents.COMPANY_CREATE_SIGNATORY_DONE)
      })
    })
  })

  describe('when user is updating a signatory', () => {
    beforeEach(() => {
      const testSignatory = {
        uuid: 'signatory-123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        title: 'CEO',
        has_ssn: true,
        phone: '(555) 123-4567',
        birthday: '1980-01-01',
        home_address: {
          street_1: '123 Main St',
          street_2: 'Apt 4B',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA',
        },
      }

      server.use(
        handleGetAllSignatories(() => HttpResponse.json([testSignatory])),
        handleUpdateSignatory(() => HttpResponse.json(testSignatory)),
      )
    })

    it('disables email input', async () => {
      render(
        <GustoTestApiProvider>
          <CreateSignatory
            companyId="company-123"
            signatoryId="signatory-123"
            onEvent={mockOnEvent}
          />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Signatory person details')).toBeInTheDocument()
      })

      expect(screen.getByLabelText('Email address')).toBeDisabled()
    })

    it('fires the correct updated events when form is submitted successfully', async () => {
      const user = userEvent.setup()

      render(
        <GustoTestApiProvider>
          <CreateSignatory
            companyId="company-123"
            signatoryId="signatory-123"
            onEvent={mockOnEvent}
          />
        </GustoTestApiProvider>,
      )

      await waitFor(() => {
        expect(screen.getByText('Signatory person details')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: 'Sign documents' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(companyEvents.COMPANY_SIGNATORY_UPDATED, {
          uuid: 'signatory-123',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          title: 'CEO',
          has_ssn: true,
          phone: '(555) 123-4567',
          birthday: '1980-01-01',
          home_address: {
            street_1: '123 Main St',
            street_2: 'Apt 4B',
            city: 'San Francisco',
            state: 'CA',
            zip: '94105',
            country: 'USA',
          },
        })
        expect(mockOnEvent).toHaveBeenCalledWith(companyEvents.COMPANY_CREATE_SIGNATORY_DONE)
      })
    })
  })
})
