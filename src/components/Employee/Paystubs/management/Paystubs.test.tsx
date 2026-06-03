import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { Paystubs } from './Paystubs'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'

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

describe('Paystubs (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the PaystubsCard inside BaseBoundaries / Flow', async () => {
    stubPayStubs(TWO_STUBS, { 'x-total-count': '2', 'x-total-pages': '1', 'x-page': '1' })

    renderWithProviders(<Paystubs employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Paystubs')).toBeInTheDocument()
    })

    expect(await screen.findAllByRole('button', { name: 'Download paystub' })).toHaveLength(2)
  })

  it('forwards EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOAD_REQUESTED through the block', async () => {
    stubPayStubs(TWO_STUBS, { 'x-total-count': '2', 'x-total-pages': '1', 'x-page': '1' })
    const downloadResolver = vi.fn<HttpResponseResolver>(
      () =>
        new HttpResponse(new Uint8Array([0x25, 0x50, 0x44, 0x46]), {
          headers: { 'content-type': 'application/pdf' },
        }),
    )
    server.use(
      http.get(
        `${API_BASE_URL}/v1/payrolls/:payroll_id/employees/:employee_id/pay_stub`,
        downloadResolver,
      ),
    )

    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock-blob-url')
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    try {
      const user = userEvent.setup()
      renderWithProviders(<Paystubs employeeId="employee-123" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: 'Download paystub' })).toHaveLength(2)
      })

      const [firstDownload] = screen.getAllByRole('button', { name: 'Download paystub' })
      await user.click(firstDownload!)

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOAD_REQUESTED,
          { employeeId: 'employee-123', payrollUuid: 'payroll-1' },
        )
      })
    } finally {
      openSpy.mockRestore()
      createObjectURLSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    }
  })
})
