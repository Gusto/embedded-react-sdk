import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocationForm } from './LocationForm'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { setupMswForTest } from '@/test/mocks/setupMswForTest'

// Setup MSW server for this test file since it uses API mocking
setupMswForTest()
import { companyEvents } from '@/shared/constants'
import { getCompanyLocation } from '@/test/mocks/apis/company_locations'
import { server } from '@/test/mocks/server'
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
