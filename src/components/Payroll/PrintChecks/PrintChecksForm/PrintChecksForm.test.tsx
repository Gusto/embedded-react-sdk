import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { PrintChecksForm } from './PrintChecksForm'
import {
  handlePayrollsGeneratePrintableChecks,
  handleGeneratedDocumentsGet,
  createPayrollCheck,
  createGeneratedDocument,
} from '@/test/mocks/apis/printable_payroll_checks'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { printChecksEvents } from '@/shared/constants'
import { FlowContext } from '@/components/Flow/useFlow'

describe('PrintChecksForm', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  const flowContextValue = {
    component: null,
    onEvent,
  }

  const renderForm = () =>
    renderWithProviders(
      <FlowContext.Provider value={flowContextValue}>
        <PrintChecksForm payrollId="payroll-1" onEvent={onEvent} />
        <PrintChecksForm.Footer onEvent={onEvent} />
      </FlowContext.Provider>,
    )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('omits starting_check_number from the request body for custom check stock', async () => {
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

    renderForm()

    await user.click(await screen.findByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(generateResolver).toHaveBeenCalledTimes(1)
    })
    expect(capturedBody).toEqual({ printing_format: 'top' })
  })

  it('includes starting_check_number in the request body for blank check stock', async () => {
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

    renderForm()

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

    renderForm()

    await user.click(await screen.findByRole('radio', { name: 'Blank check stock' }))
    await user.click(screen.getByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(generateResolver).toHaveBeenCalledTimes(1)
    })
    expect(capturedBody).toEqual({ printing_format: 'bottom', starting_check_number: 0 })
  })

  it('calls the generate endpoint before the poll endpoint', async () => {
    const generateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(createPayrollCheck(), { status: 200 }),
    )
    const getDocumentResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(createGeneratedDocument({ status: 'succeeded' })),
    )
    server.use(handlePayrollsGeneratePrintableChecks(generateResolver))
    server.use(handleGeneratedDocumentsGet(getDocumentResolver))

    renderForm()

    await user.click(await screen.findByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(getDocumentResolver).toHaveBeenCalled()
    })
    expect(generateResolver.mock.invocationCallOrder[0]!).toBeLessThan(
      getDocumentResolver.mock.invocationCallOrder[0]!,
    )
  })

  it('fires PRINT_CHECKS_GENERATE_START on submit', async () => {
    server.use(
      handlePayrollsGeneratePrintableChecks(() =>
        HttpResponse.json(createPayrollCheck(), { status: 200 }),
      ),
    )
    server.use(
      handleGeneratedDocumentsGet(() =>
        HttpResponse.json(createGeneratedDocument({ status: 'pending' })),
      ),
    )

    renderForm()

    await user.click(await screen.findByRole('button', { name: 'View checks' }))

    expect(onEvent).toHaveBeenCalledWith(printChecksEvents.PRINT_CHECKS_GENERATE_START)
  })

  it('fires PRINT_CHECKS_GENERATE_SUCCEEDED with the document URL once the poll succeeds', async () => {
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

    renderForm()

    await user.click(await screen.findByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(printChecksEvents.PRINT_CHECKS_GENERATE_SUCCEEDED, {
        documentUrl: 'https://example.com/checks.pdf',
      })
    })
  })

  it('fires PRINT_CHECKS_GENERATE_FAILED when the poll reports failure', async () => {
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

    renderForm()

    await user.click(await screen.findByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(printChecksEvents.PRINT_CHECKS_GENERATE_FAILED, {
        errorMessage: null,
      })
    })
  })

  it('fires PRINT_CHECKS_GENERATE_FAILED with the server error message when the mutation itself is rejected', async () => {
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

    renderForm()

    await user.click(await screen.findByRole('button', { name: 'View checks' }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(printChecksEvents.PRINT_CHECKS_GENERATE_FAILED, {
        errorMessage: 'Cannot generate checks on an unprocessed payroll',
      })
    })
    expect(onEvent).not.toHaveBeenCalledWith(
      printChecksEvents.PRINT_CHECKS_GENERATE_SUCCEEDED,
      expect.anything(),
    )
  })

  it('fires PRINT_CHECKS_CANCEL when the Footer cancel button is clicked', async () => {
    renderForm()

    await user.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(onEvent).toHaveBeenCalledWith(printChecksEvents.PRINT_CHECKS_CANCEL)
  })
})
