import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { SuspensionForm } from './SuspensionForm'
import { server } from '@/test/mocks/server'
import { handleSuspendCompany, defaultSuspension } from '@/test/mocks/apis/company_suspensions'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const unstable = { unstableFeatures: { companySuspension: true } } as const

async function selectReason(user: ReturnType<typeof userEvent.setup>, optionText: RegExp) {
  await user.click(screen.getByLabelText('Why are you cancelling your account?'))
  await user.click(await screen.findByRole('option', { name: optionText }))
}

describe('SuspensionForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('shows the provider field only when switching providers, and clears it otherwise', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SuspensionForm companyId="company_id" onEvent={() => {}} />, unstable)

    await screen.findByRole('heading', { name: 'Cancel account' })
    expect(screen.queryByLabelText('Which provider are you switching to?')).toBeNull()

    await selectReason(user, /switching to a new payroll provider/i)
    expect(screen.getByLabelText('Which provider are you switching to?')).toBeInTheDocument()

    await selectReason(user, /My company is shutting down/i)
    expect(screen.queryByLabelText('Which provider are you switching to?')).toBeNull()
  })

  it('warns when the reason requires Customer Support (FEIN or entity type change)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SuspensionForm companyId="company_id" onEvent={() => {}} />, unstable)

    await screen.findByRole('heading', { name: 'Cancel account' })
    await selectReason(user, /changing our FEIN or entity type/i)

    expect(screen.getByText(/reach out to our support team/i)).toBeInTheDocument()
  })

  it('switches the comments label to the required variant when leaving for "other"', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SuspensionForm companyId="company_id" onEvent={() => {}} />, unstable)

    await screen.findByRole('heading', { name: 'Cancel account' })
    await selectReason(user, /switching to a new payroll provider/i)

    expect(screen.getByLabelText(/^Comments \(optional\)$/i)).toBeInTheDocument()

    await user.click(screen.getByLabelText('Which provider are you switching to?'))
    await user.click(await screen.findByRole('option', { name: /^Other$/i }))

    expect(
      screen.getByLabelText(/Comments, including which provider you're switching to \(required\)/i),
    ).toBeInTheDocument()
  })

  it('toggles the tax-filing checkboxes and the future-filings warning by reconcile method', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SuspensionForm companyId="company_id" onEvent={() => {}} />, unstable)

    await screen.findByRole('heading', { name: 'Cancel account' })

    // No reconcile method selected yet: neither the checkboxes nor the warning are shown.
    expect(screen.queryByLabelText(/All quarterly tax filings/i)).toBeNull()
    expect(screen.queryByText(/responsible for all future tax payments/i)).toBeNull()

    await user.click(screen.getByRole('radio', { name: /pay all outstanding company taxes/i }))
    expect(screen.getByLabelText(/All quarterly tax filings/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/All year-end tax filings/i)).toBeInTheDocument()
    expect(screen.queryByText(/responsible for all future tax payments/i)).toBeNull()

    await user.click(screen.getByRole('radio', { name: /refund all outstanding taxes/i }))
    expect(screen.queryByLabelText(/All quarterly tax filings/i)).toBeNull()
    expect(screen.getByText(/responsible for all future tax payments/i)).toBeInTheDocument()
  })

  it('submits the expected request body and emits the created event', async () => {
    const user = userEvent.setup()
    const mockOnEvent = vi.fn()

    let suspendBody: Record<string, unknown> | null = null
    const suspendResolver = vi.fn<HttpResponseResolver>(async ({ request, params }) => {
      suspendBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        ...defaultSuspension,
        ...suspendBody,
        company_uuid: params.company_uuid,
      })
    })
    server.use(handleSuspendCompany(suspendResolver))

    renderWithProviders(<SuspensionForm companyId="company_id" onEvent={mockOnEvent} />, unstable)

    await screen.findByRole('heading', { name: 'Cancel account' })
    await selectReason(user, /My company is shutting down/i)
    await user.click(screen.getByRole('radio', { name: /pay all outstanding company taxes/i }))
    await user.click(screen.getByLabelText(/All quarterly tax filings/i))
    await user.click(screen.getByLabelText(/All year-end tax filings/i))
    await user.click(screen.getByRole('button', { name: /Cancel account/i }))

    await waitFor(() => {
      expect(suspendResolver).toHaveBeenCalledTimes(1)
    })
    expect(suspendBody).toEqual({
      reason: 'shutting_down',
      reconcile_tax_method: 'pay_taxes',
      file_quarterly_forms: true,
      file_yearly_forms: true,
    })
    expect(mockOnEvent).toHaveBeenCalledWith(
      companyEvents.COMPANY_SUSPENSION_CREATED,
      expect.objectContaining({ reason: 'shutting_down' }),
    )
  })

  it('includes leavingFor and clears the checkboxes when refunding taxes', async () => {
    const user = userEvent.setup()
    const mockOnEvent = vi.fn()

    let suspendBody: Record<string, unknown> | null = null
    const suspendResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      suspendBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(defaultSuspension)
    })
    server.use(handleSuspendCompany(suspendResolver))

    renderWithProviders(<SuspensionForm companyId="company_id" onEvent={mockOnEvent} />, unstable)

    await screen.findByRole('heading', { name: 'Cancel account' })
    await selectReason(user, /switching to a new payroll provider/i)
    await user.click(screen.getByLabelText('Which provider are you switching to?'))
    await user.click(await screen.findByRole('option', { name: /Rippling/i }))
    await user.click(screen.getByRole('radio', { name: /refund all outstanding taxes/i }))
    await user.click(screen.getByRole('button', { name: /Cancel account/i }))

    await waitFor(() => {
      expect(suspendResolver).toHaveBeenCalledTimes(1)
    })
    expect(suspendBody).toEqual({
      reason: 'switching_provider',
      leaving_for: 'rippling',
      reconcile_tax_method: 'refund_taxes',
      file_quarterly_forms: false,
      file_yearly_forms: false,
    })
  })
})
