import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { PayrollList } from './PayrollList'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

const sharedHandlers = [
  http.get(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, () => {
    return HttpResponse.json([])
  }),

  http.get(`${API_BASE_URL}/v1/companies/:company_uuid/payrolls/blockers`, () => {
    return HttpResponse.json([])
  }),

  http.get(`${API_BASE_URL}/v1/companies/:company_uuid/wire_in_requests`, () => {
    return HttpResponse.json([])
  }),
]

describe('PayrollList', () => {
  const defaultProps = {
    companyId: 'company-123',
    onEvent: vi.fn(),
  }

  let capturedPayrollListUrl: URL | null = null

  beforeEach(() => {
    capturedPayrollListUrl = null

    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, ({ request }) => {
        capturedPayrollListUrl = new URL(request.url)
        return HttpResponse.json([])
      }),
      ...sharedHandlers,
    )
  })

  it('includes future endDate in API query to show future-dated off-cycle payrolls', async () => {
    renderWithProviders(<PayrollList {...defaultProps} />)

    await waitFor(() => {
      expect(capturedPayrollListUrl).not.toBeNull()
    })

    const endDateParam = capturedPayrollListUrl!.searchParams.get('end_date')
    expect(endDateParam).toBeTruthy()

    const endDate = new Date(endDateParam!)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expect(endDate.getTime()).toBeGreaterThan(today.getTime())
  })

  it('includes page and per params in the API request', async () => {
    renderWithProviders(<PayrollList {...defaultProps} />)

    await waitFor(() => {
      expect(capturedPayrollListUrl).not.toBeNull()
    })

    expect(capturedPayrollListUrl!.searchParams.get('page')).toBeTruthy()
    expect(capturedPayrollListUrl!.searchParams.get('per')).toBeTruthy()
  })

  it('renders pagination controls when totalCount exceeds page size', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, ({ request }) => {
        capturedPayrollListUrl = new URL(request.url)
        return HttpResponse.json([], {
          headers: {
            'x-total-pages': '3',
            'x-total-count': '15',
          },
        })
      }),
      ...sharedHandlers,
    )

    renderWithProviders(<PayrollList {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('pagination-control')).toBeInTheDocument()
    })
  })
})
