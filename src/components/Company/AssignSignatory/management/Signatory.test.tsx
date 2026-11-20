import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { Signatory } from './Signatory'
import { server } from '@/test/mocks/server'
import { handleGetAllSignatories } from '@/test/mocks/apis/company_signatories'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const COMPANY_ID = 'company-123'
const unstableFeatures = { companySettingsDashboard: true }

const fixtureSignatory = {
  uuid: 'signatory-1',
  first_name: 'Ada',
  last_name: 'Lovelace',
  email: 'ada@example.com',
  title: 'PRESIDENT',
  identity_verification_status: 'Pass',
  version: 'signatory-version',
}

describe('CompanyManagement.Signatory', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(handleGetAllSignatories(() => HttpResponse.json([fixtureSignatory])))
  })

  it('renders the SDK error card instead of the block without the companySettingsDashboard flag', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<Signatory companyId={COMPANY_ID} onEvent={onEvent} />)

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit signatory' })).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('opens on the card', async () => {
    renderWithProviders(<Signatory companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit signatory' })).toBeEnabled()
    })
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })

  it('returns from the editor to the card via its own back header, not a generic cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Signatory companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit signatory' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit signatory' }))

    // The assign-signatory screens are submit-only, so this header is the only way back.
    await user.click(await screen.findByRole('button', { name: 'Back to signatory' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit signatory' })).toBeInTheDocument()
    })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_CANCELLED,
      undefined,
    )
  })

  it('carries the current signatory id into the editor so it amends that record', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Signatory companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit signatory' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit signatory' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_REQUESTED,
      { companyId: COMPANY_ID, signatoryId: fixtureSignatory.uuid },
    )
  })
})
