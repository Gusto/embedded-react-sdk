import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { SuspensionSummary } from './SuspensionSummary'
import { server } from '@/test/mocks/server'
import { handleGetCompanySuspensions } from '@/test/mocks/apis/company_suspensions'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const unstable = { unstableFeatures: { companySuspension: true } } as const

describe('SuspensionSummary', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('summarizes a pay-taxes suspension and emits done when acknowledged', async () => {
    const user = userEvent.setup()
    const mockOnEvent = vi.fn()

    server.use(
      handleGetCompanySuspensions(() =>
        HttpResponse.json([
          {
            uuid: 'suspension-1',
            company_uuid: 'company_id',
            effective_date: '2026-05-15',
            reason: 'shutting_down',
            reconcile_tax_method: 'pay_taxes',
            file_quarterly_forms: true,
            file_yearly_forms: false,
          },
        ]),
      ),
    )

    renderWithProviders(
      <SuspensionSummary companyId="company_id" onEvent={mockOnEvent} />,
      unstable,
    )

    await screen.findByText('Your payroll account has been canceled')
    expect(screen.getByText(/keep your bank account active/i)).toBeInTheDocument()
    expect(screen.getByText(/We'll file your company's Q2 2026 forms\./i)).toBeInTheDocument()
    expect(screen.getByText(/We'll pay all outstanding tax payments\./i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Done/i }))
    expect(mockOnEvent).toHaveBeenCalledWith(companyEvents.COMPANY_SUSPENSION_DONE)
  })

  it('renders the refund table for a refund-taxes suspension', async () => {
    server.use(
      handleGetCompanySuspensions(() =>
        HttpResponse.json([
          {
            uuid: 'suspension-2',
            company_uuid: 'company_id',
            effective_date: '2026-02-01',
            reason: 'switching_provider',
            reconcile_tax_method: 'refund_taxes',
            file_quarterly_forms: false,
            file_yearly_forms: false,
            tax_refunds: [
              { description: 'Federal Unemployment', amount: '100.00' },
              { description: 'State Unemployment', amount: '50.50' },
            ],
          },
        ]),
      ),
    )

    renderWithProviders(<SuspensionSummary companyId="company_id" onEvent={() => {}} />, unstable)

    await screen.findByText('Your payroll account has been canceled')
    expect(screen.getByText(/We will also refund the following taxes:/i)).toBeInTheDocument()
    expect(screen.getByText('Federal Unemployment')).toBeInTheDocument()
    expect(screen.getByText('$150.50')).toBeInTheDocument()
    expect(screen.queryByText(/keep your bank account active/i)).toBeNull()
  })

  it('renders an empty state when no suspension exists', async () => {
    server.use(handleGetCompanySuspensions(() => HttpResponse.json([])))

    renderWithProviders(<SuspensionSummary companyId="company_id" onEvent={() => {}} />, unstable)

    await screen.findByText('No suspension found')
  })
})
