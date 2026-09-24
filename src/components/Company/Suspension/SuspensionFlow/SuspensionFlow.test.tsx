import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { SuspensionFlow } from './SuspensionFlow'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { API_BASE_URL } from '@/test/constants'
import { companyEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const unstable = { unstableFeatures: { companySuspension: true } } as const

function mockCompany(isSuspended: boolean) {
  server.use(
    http.get(`${API_BASE_URL}/v1/companies/:company_id`, ({ params }) =>
      HttpResponse.json({
        uuid: params.company_id,
        name: 'Test Company',
        is_suspended: isSuspended,
        company_status: isSuspended ? 'Suspended' : 'Approved',
      }),
    ),
  )
}

describe('SuspensionFlow', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('opens on the form for a company that is not suspended', async () => {
    mockCompany(false)
    renderWithProviders(<SuspensionFlow companyId="company_id" onEvent={() => {}} />, unstable)

    await screen.findByRole('heading', { name: 'Cancel account' })
    expect(
      screen.getByLabelText('Why are you cancelling your account?'),
    ).toBeInTheDocument()
  })

  it('opens directly on the summary for an already-suspended company', async () => {
    mockCompany(true)
    renderWithProviders(<SuspensionFlow companyId="company_id" onEvent={() => {}} />, unstable)

    await screen.findByText('Your payroll account has been canceled')
    expect(screen.queryByText('Cancel account')).toBeNull()
  })

  it('transitions from the form to the summary after submitting', async () => {
    mockCompany(false)
    const user = userEvent.setup()
    const mockOnEvent = vi.fn()

    renderWithProviders(
      <SuspensionFlow companyId="company_id" onEvent={mockOnEvent} />,
      unstable,
    )

    await screen.findByRole('heading', { name: 'Cancel account' })
    await user.click(screen.getByLabelText('Why are you cancelling your account?'))
    await user.click(await screen.findByRole('option', { name: /My company is shutting down/i }))
    await user.click(screen.getByRole('radio', { name: /pay all outstanding company taxes/i }))
    await user.click(screen.getByRole('button', { name: /Cancel account/i }))

    await screen.findByText('Your payroll account has been canceled')
    await waitFor(() => {
      expect(mockOnEvent).toHaveBeenCalledWith(
        companyEvents.COMPANY_SUSPENSION_CREATED,
        expect.anything(),
      )
    })
  })
})
