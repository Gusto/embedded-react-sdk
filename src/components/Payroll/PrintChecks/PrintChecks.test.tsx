import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { PrintChecks } from './PrintChecks'
import {
  handlePayrollsGeneratePrintableChecks,
  handleGeneratedDocumentsGet,
  createPayrollCheck,
  createGeneratedDocument,
} from '@/test/mocks/apis/printable_payroll_checks'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { printChecksEvents } from '@/shared/constants'

const checkCompensation = {
  employeeUuid: 'emp-check-1',
  excluded: false,
  paymentMethod: 'Check',
}

vi.mock('@gusto/embedded-api/react-query/payrollsGet', () => ({
  usePayrollsGet: () => ({
    data: {
      payrollShow: {
        processed: true,
        employeeCompensations: [checkCompensation],
      },
    },
  }),
}))

describe('PrintChecks', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  const defaultProps = {
    companyId: 'company-1',
    payrollId: 'payroll-1',
    onEvent,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // The download is triggered via a synthetic anchor click rather than a real navigation —
    // jsdom throws "Not implemented: navigation" if this isn't stubbed.
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  it('opens the form from the banner CTA and cancels back to the banner', async () => {
    renderWithProviders(<PrintChecks {...defaultProps} />)

    await user.click(await screen.findByRole('button', { name: 'View and print checks' }))

    expect(await screen.findByText('Choose check stock')).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(printChecksEvents.PRINT_CHECKS_START, undefined)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByText('Choose check stock')).toBeNull()
    })
  })

  it('walks through a successful generate flow to the summary screen and back', async () => {
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

    renderWithProviders(<PrintChecks {...defaultProps} />)

    await user.click(await screen.findByRole('button', { name: 'View and print checks' }))
    await user.click(screen.getByRole('button', { name: 'View checks' }))

    expect(await screen.findByText('Your checks are ready')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View checks' })).toHaveAttribute(
      'href',
      'https://example.com/checks.pdf',
    )

    await user.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(screen.queryByText('Your checks are ready')).toBeNull()
    })
  })

  it('walks through a failed generate flow and allows retrying', async () => {
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

    renderWithProviders(<PrintChecks {...defaultProps} />)

    await user.click(await screen.findByRole('button', { name: 'View and print checks' }))
    await user.click(screen.getByRole('button', { name: 'View checks' }))

    expect(await screen.findByText("We couldn't generate your checks")).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('Choose check stock')).toBeInTheDocument()
  })
})
