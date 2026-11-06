import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { Landing } from './Landing'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'

const EMPLOYEE_ID = '4b3f930f-82cd-48a8-b797-798686e12e5e'
const COMPANY_ID = 'a007e1ab-3595-43c2-ab4b-af7a5af2e365'

describe('Employee Landing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupApiTestMocks()
  })

  it('renders the company name sourced from the employee payload, not a separate company lookup', async () => {
    // The default getEmployee mock only returns company_name when the request's
    // include param asks for it (mirroring the real API) — so this heading assertion
    // breaks if Landing ever stops requesting include=company_name.
    const companyResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ uuid: COMPANY_ID, name: 'Should Not Be Used' }),
    )
    server.use(http.get(`${API_BASE_URL}/v1/companies/:company_id`, companyResolver))

    renderWithProviders(
      <Landing employeeId={EMPLOYEE_ID} companyId={COMPANY_ID} onEvent={vi.fn()} />,
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Hi, Isom. Welcome to Test Company!',
      )
    })

    expect(companyResolver).not.toHaveBeenCalled()
  })
})
