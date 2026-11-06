import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { Landing } from './Landing'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'

const CONTRACTOR_ID = 'c9fc1ad3-c107-4e7b-aa21-2dd4b00a7a07'
const COMPANY_ID = 'b7457fec-3b76-43bb-9c6e-69cca4688942'

describe('Contractor Landing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupApiTestMocks()
  })

  it('renders the company name sourced from the contractor payload, not a separate company lookup', async () => {
    // The default getContractor mock only returns company_name when the request's
    // include param asks for it (mirroring the real API) — so this heading assertion
    // breaks if Landing ever stops requesting include=company_name.
    const companyResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ uuid: COMPANY_ID, name: 'Should Not Be Used' }),
    )
    server.use(http.get(`${API_BASE_URL}/v1/companies/:company_id`, companyResolver))

    renderWithProviders(
      <Landing contractorId={CONTRACTOR_ID} companyId={COMPANY_ID} onEvent={vi.fn()} />,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Welcome, Kory! Test Company has invited you to complete your onboarding.',
      )
    })

    expect(companyResolver).not.toHaveBeenCalled()
  })
})
