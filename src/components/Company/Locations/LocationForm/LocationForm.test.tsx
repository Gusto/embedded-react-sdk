import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocationForm } from './LocationForm'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
import { basicLocation, getCompanyLocation, getLocation } from '@/test/mocks/apis/company_locations'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('LocationForm', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getCompanyLocation)
    renderWithProviders(<LocationForm companyId="company-123" onEvent={onEvent} />)
  })

  it('renders empty location form', async () => {
    await waitFor(() => {
      expect(screen.getByLabelText('Street 1')).toBeInTheDocument()
    })
  })

  it('fails to submit with empty form', async () => {
    const submitButton = await screen.findByTestId('location-submit')
    await user.click(submitButton)

    const cityField = await screen.findByLabelText('City')
    expect(cityField).toHaveAttribute('aria-invalid', 'true')
    expect(onEvent).not.toHaveBeenCalledWith(companyEvents.COMPANY_LOCATION_CREATED)
  })

  //TODO: will re-enable after speakeasy transition
  // it('submits sucessfully with correct data', async () => {
  //   await waitFor(() => {
  //     expect(screen.getByLabelText('Street 1')).toBeInTheDocument()
  //   })

  //   await user.type(screen.getByLabelText('Street 1'), '123 Main street')
  //   await user.type(screen.getByLabelText('City'), 'New York')
  //   await user.click(screen.getByLabelText('State'))
  //   await user.click(screen.getByRole('option', { name: 'New York' }))
  //   await user.type(screen.getByLabelText('Zip'), '10005')
  //   await user.type(screen.getByLabelText(/Phone Number/i), '9558799898')

  //   const submitButton = await screen.findByTestId('location-submit')
  //   await user.click(submitButton)
  //   await waitFor(() => {
  //     // expect(screen.).toHaveAttribute('aria-invalid', 'true')
  //     expect(onEvent).toHaveBeenCalledWith(companyEvents.COMPANY_LOCATION_CREATED)
  //   })
  // })
})

describe('LocationForm (edit mode)', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    onEvent.mockReset()
    setupApiTestMocks()
    server.use(getLocation)
    renderWithProviders(
      <LocationForm companyId="company-123" locationId={basicLocation.uuid} onEvent={onEvent} />,
    )
  })

  it('prepopulates address-type checkboxes from the existing location', async () => {
    const mailingCheckbox = await screen.findByRole('checkbox', { name: /mailing address/i })
    const filingCheckbox = await screen.findByRole('checkbox', { name: /filing address/i })

    expect(mailingCheckbox).toBeChecked()
    expect(filingCheckbox).not.toBeChecked()
  })

  it('disables the mailing-address checkbox when the location is already the mailing address', async () => {
    const mailingCheckbox = await screen.findByRole('checkbox', { name: /mailing address/i })
    const filingCheckbox = await screen.findByRole('checkbox', { name: /filing address/i })

    expect(mailingCheckbox).toBeDisabled()
    expect(filingCheckbox).not.toBeDisabled()
  })

  it('omits already-set address-type fields from the PUT request body', async () => {
    let capturedRequestBody: Record<string, unknown> | undefined
    server.use(
      http.put(`${API_BASE_URL}/v1/locations/:location_id`, async ({ request }) => {
        capturedRequestBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          ...basicLocation,
          version: '2.0',
        })
      }),
    )

    const submitButton = await screen.findByTestId('location-submit')
    await user.click(submitButton)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        companyEvents.COMPANY_LOCATION_UPDATED,
        expect.anything(),
      )
    })

    expect(capturedRequestBody).toBeDefined()
    expect(capturedRequestBody).not.toHaveProperty('mailing_address')
    expect(capturedRequestBody).toHaveProperty('filing_address', false)
  })
})
