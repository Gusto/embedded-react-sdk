import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { PaystubsCard } from './PaystubsCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'
import { NonceContext } from '@/contexts/NonceProvider'

const stubPayStubs = (
  payStubs: Array<Record<string, unknown>>,
  headers: Record<string, string> = { 'x-total-count': '0', 'x-total-pages': '1', 'x-page': '1' },
) => {
  server.use(
    http.get(`${API_BASE_URL}/v1/employees/:employee_uuid/pay_stubs`, () =>
      HttpResponse.json(payStubs, { headers }),
    ),
  )
}

const TWO_STUBS = [
  {
    uuid: 'stub-1',
    payroll_uuid: 'payroll-1',
    check_date: '2025-01-15',
    gross_pay: '2000.00',
    net_pay: '1500.00',
  },
  {
    uuid: 'stub-2',
    payroll_uuid: 'payroll-2',
    check_date: '2024-12-31',
    gross_pay: '1800.00',
    net_pay: '1300.00',
  },
]

describe('PaystubsCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the title and a download action per row once paystubs load', async () => {
    stubPayStubs(TWO_STUBS, { 'x-total-count': '2', 'x-total-pages': '1', 'x-page': '1' })

    renderWithProviders(<PaystubsCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Paystubs')).toBeInTheDocument()
    })

    const downloadButtons = await screen.findAllByRole('button', { name: 'Download paystub' })
    expect(downloadButtons).toHaveLength(2)
  })

  it('renders the empty state when the employee has no paystubs', async () => {
    stubPayStubs([])

    renderWithProviders(<PaystubsCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('No paystubs')).toBeInTheDocument()
    })

    expect(screen.getByText('Paystubs will appear here after payroll is run')).toBeInTheDocument()
  })

  it('fires EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOAD_REQUESTED and _DOWNLOADED when a row download succeeds', async () => {
    stubPayStubs(TWO_STUBS, { 'x-total-count': '2', 'x-total-pages': '1', 'x-page': '1' })
    const downloadResolver = vi.fn<HttpResponseResolver>(() => {
      return new HttpResponse(new Uint8Array([0x25, 0x50, 0x44, 0x46]), {
        headers: { 'content-type': 'application/pdf' },
      })
    })
    server.use(
      http.get(
        `${API_BASE_URL}/v1/payrolls/:payroll_id/employees/:employee_id/pay_stub`,
        downloadResolver,
      ),
    )

    // window.open returns null in jsdom — handleDownload tolerates this and skips
    // the new-tab loading UI. URL.createObjectURL needs a stub.
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock-blob-url')
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    try {
      const user = userEvent.setup()
      renderWithProviders(<PaystubsCard employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: 'Download paystub' })).toHaveLength(2)
      })

      const [firstDownload] = screen.getAllByRole('button', { name: 'Download paystub' })
      await user.click(firstDownload!)

      await waitFor(() => {
        expect(downloadResolver).toHaveBeenCalledTimes(1)
      })

      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOAD_REQUESTED,
        { employeeId: 'employee-123', payrollUuid: 'payroll-1' },
      )
      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOADED,
          { employeeId: 'employee-123', payrollUuid: 'payroll-1' },
        )
      })

      // Regression: the per-row loading spinner must clear once the download
      // finishes. Previously the UUID was added to `downloadingPayrollUuids`
      // but never removed, so the button stayed in its loading state forever.
      await waitFor(() => {
        const [firstAfter] = screen.getAllByRole('button', { name: 'Download paystub' })
        expect(firstAfter).not.toHaveAttribute('data-loading')
      })
    } finally {
      openSpy.mockRestore()
      createObjectURLSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    }
  })

  it('applies the CSP nonce from NonceContext to the popup style element', async () => {
    stubPayStubs(TWO_STUBS, { 'x-total-count': '2', 'x-total-pages': '1', 'x-page': '1' })
    server.use(
      http.get(`${API_BASE_URL}/v1/payrolls/:payroll_id/employees/:employee_id/pay_stub`, () =>
        HttpResponse.json({ document_url: 'http://example.com/paystub.pdf' }),
      ),
    )

    const popupDoc = document.implementation.createHTMLDocument('popup')
    const popupWindow = {
      document: popupDoc,
      addEventListener: vi.fn(),
      close: vi.fn(),
      location: { href: '' },
    } as unknown as Window
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(popupWindow)
    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock-blob-url')
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    try {
      const user = userEvent.setup()
      renderWithProviders(
        <NonceContext.Provider value="csp-test-nonce">
          <PaystubsCard employeeId="employee-123" onEvent={vi.fn()} />
        </NonceContext.Provider>,
      )

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: 'Download paystub' })).toHaveLength(2)
      })

      const [firstDownload] = screen.getAllByRole('button', { name: 'Download paystub' })
      await user.click(firstDownload!)

      await waitFor(() => {
        const popupStyle = popupDoc.head.querySelector<HTMLStyleElement>('style')
        expect(popupStyle?.nonce).toBe('csp-test-nonce')
      })
    } finally {
      openSpy.mockRestore()
      createObjectURLSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    }
  })
})
