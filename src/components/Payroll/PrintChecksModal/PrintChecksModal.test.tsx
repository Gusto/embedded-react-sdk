import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { PrintChecksModal } from './PrintChecksModal'
import {
  handlePayrollsGeneratePrintableChecks,
  handleGeneratedDocumentsGet,
  createPayrollCheck,
  createGeneratedDocument,
} from '@/test/mocks/apis/printable_payroll_checks'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

const mockOnEvent = vi.fn()

vi.mock('@/components/Base', () => ({
  useBase: () => ({
    onEvent: mockOnEvent,
    baseSubmitHandler: vi.fn(async (data: unknown, callback: (data: unknown) => Promise<void>) => {
      try {
        await callback(data)
      } catch {
        // The real baseSubmitHandler normalizes and swallows recognized API errors here;
        // this mock only needs to reproduce the swallow so failures surface as component
        // state instead of an unhandled rejection.
      }
    }),
    error: null,
    setError: vi.fn(),
  }),
}))

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  payrollUuid: 'payroll-1',
}

describe('PrintChecksModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // jsdom doesn't implement window.open and throws on any call; real browsers instead
    // return null when a popup is blocked, which is the behavior this simulates.
    vi.spyOn(window, 'open').mockReturnValue(null)
  })

  it('omits starting_check_number from the request body for custom check stock', async () => {
    const user = userEvent.setup()
    let capturedBody: Record<string, unknown> | null = null
    const generateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      capturedBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(createPayrollCheck(), { status: 200 })
    })
    server.use(handlePayrollsGeneratePrintableChecks(generateResolver))
    server.use(
      handleGeneratedDocumentsGet(() =>
        HttpResponse.json(createGeneratedDocument({ status: 'pending' })),
      ),
    )

    renderWithProviders(<PrintChecksModal {...defaultProps} />)

    await user.click(await screen.findByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(generateResolver).toHaveBeenCalledTimes(1)
    })
    expect(capturedBody).toEqual({ printing_format: 'top' })
  })

  it('includes starting_check_number in the request body for blank check stock', async () => {
    const user = userEvent.setup()
    let capturedBody: Record<string, unknown> | null = null
    const generateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      capturedBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(createPayrollCheck(), { status: 200 })
    })
    server.use(handlePayrollsGeneratePrintableChecks(generateResolver))
    server.use(
      handleGeneratedDocumentsGet(() =>
        HttpResponse.json(createGeneratedDocument({ status: 'pending' })),
      ),
    )

    renderWithProviders(<PrintChecksModal {...defaultProps} />)

    await user.click(await screen.findByRole('radio', { name: 'Blank check stock' }))
    const input = screen.getByLabelText(/Check number starts with/)
    await user.clear(input)
    await user.type(input, '1001')
    await user.click(screen.getByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(generateResolver).toHaveBeenCalledTimes(1)
    })
    expect(capturedBody).toEqual({ printing_format: 'bottom', starting_check_number: 1001 })
  })

  it('includes a starting_check_number of 0 in the request body for blank check stock', async () => {
    const user = userEvent.setup()
    let capturedBody: Record<string, unknown> | null = null
    const generateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      capturedBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(createPayrollCheck(), { status: 200 })
    })
    server.use(handlePayrollsGeneratePrintableChecks(generateResolver))
    server.use(
      handleGeneratedDocumentsGet(() =>
        HttpResponse.json(createGeneratedDocument({ status: 'pending' })),
      ),
    )

    renderWithProviders(<PrintChecksModal {...defaultProps} />)

    await user.click(await screen.findByRole('radio', { name: 'Blank check stock' }))
    await user.click(screen.getByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(generateResolver).toHaveBeenCalledTimes(1)
    })
    expect(capturedBody).toEqual({ printing_format: 'bottom', starting_check_number: 0 })
  })

  it('calls the generate endpoint before the poll endpoint', async () => {
    const user = userEvent.setup()
    const generateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(createPayrollCheck(), { status: 200 }),
    )
    const getDocumentResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(createGeneratedDocument({ status: 'succeeded' })),
    )
    server.use(handlePayrollsGeneratePrintableChecks(generateResolver))
    server.use(handleGeneratedDocumentsGet(getDocumentResolver))

    renderWithProviders(<PrintChecksModal {...defaultProps} />)

    await user.click(await screen.findByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(getDocumentResolver).toHaveBeenCalled()
    })
    expect(generateResolver.mock.invocationCallOrder[0]!).toBeLessThan(
      getDocumentResolver.mock.invocationCallOrder[0]!,
    )
  })

  it('shows a link to the checks and fires RUN_PAYROLL_PRINT_CHECKS_GENERATED once the poll succeeds', async () => {
    const user = userEvent.setup()
    server.use(
      handlePayrollsGeneratePrintableChecks(() =>
        HttpResponse.json(createPayrollCheck(), { status: 200 }),
      ),
    )
    server.use(
      handleGeneratedDocumentsGet(() =>
        HttpResponse.json(
          createGeneratedDocument({
            status: 'succeeded',
            document_urls: ['https://example.com/checks.pdf'],
          }),
        ),
      ),
    )

    renderWithProviders(<PrintChecksModal {...defaultProps} />)

    await user.click(await screen.findByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(screen.getByText('Your checks are ready')).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: 'View checks' })).toHaveAttribute(
      'href',
      'https://example.com/checks.pdf',
    )
    expect(mockOnEvent).toHaveBeenCalledWith(
      componentEvents.RUN_PAYROLL_PRINT_CHECKS_GENERATED,
      expect.objectContaining({ status: 'succeeded' }),
    )
  })

  it('shows the failed state and fires RUN_PAYROLL_PRINT_CHECKS_FAILED with the generated document when the poll reports failure', async () => {
    const user = userEvent.setup()
    server.use(
      handlePayrollsGeneratePrintableChecks(() =>
        HttpResponse.json(createPayrollCheck(), { status: 200 }),
      ),
    )
    server.use(
      handleGeneratedDocumentsGet(() =>
        HttpResponse.json(createGeneratedDocument({ status: 'failed', document_urls: [] })),
      ),
    )

    renderWithProviders(<PrintChecksModal {...defaultProps} />)

    await user.click(await screen.findByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(screen.getByText("We couldn't generate your checks")).toBeInTheDocument()
    })
    expect(mockOnEvent).toHaveBeenCalledWith(
      componentEvents.RUN_PAYROLL_PRINT_CHECKS_FAILED,
      expect.objectContaining({ status: 'failed' }),
    )
  })

  it('shows the server error message and fires RUN_PAYROLL_PRINT_CHECKS_FAILED (without a generated document) when the mutation itself is rejected', async () => {
    const user = userEvent.setup()
    server.use(
      handlePayrollsGeneratePrintableChecks(() =>
        HttpResponse.json(
          {
            errors: [
              {
                error_key: 'invalid_action',
                category: 'invalid_operation',
                message: 'Cannot generate checks on an unprocessed payroll',
              },
            ],
          },
          { status: 422 },
        ),
      ),
    )

    renderWithProviders(<PrintChecksModal {...defaultProps} />)

    await user.click(await screen.findByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(
        screen.getByText('Cannot generate checks on an unprocessed payroll'),
      ).toBeInTheDocument()
    })
    expect(mockOnEvent).not.toHaveBeenCalledWith(
      componentEvents.RUN_PAYROLL_PRINT_CHECKS_GENERATED,
      expect.anything(),
    )
    expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.RUN_PAYROLL_PRINT_CHECKS_FAILED)
  })

  it('fires RUN_PAYROLL_PRINT_CHECKS_REQUESTED with the mutation result on submit', async () => {
    const user = userEvent.setup()
    server.use(
      handlePayrollsGeneratePrintableChecks(() =>
        HttpResponse.json(createPayrollCheck({ request_uuid: 'req-99' }), { status: 200 }),
      ),
    )
    server.use(
      handleGeneratedDocumentsGet(() =>
        HttpResponse.json(createGeneratedDocument({ status: 'pending' })),
      ),
    )

    renderWithProviders(<PrintChecksModal {...defaultProps} />)

    await user.click(await screen.findByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(mockOnEvent).toHaveBeenCalledWith(
        componentEvents.RUN_PAYROLL_PRINT_CHECKS_REQUESTED,
        expect.objectContaining({ requestUuid: 'req-99' }),
      )
    })
  })
})
