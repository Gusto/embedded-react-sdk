import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { Locations } from './Locations'
import { server } from '@/test/mocks/server'
import {
  basicLocation,
  getLocation,
  getMinimumWages,
  handleGetCompanyLocations,
} from '@/test/mocks/apis/company_locations'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const COMPANY_ID = 'company-123'
const unstableFeatures = { companySettingsDashboard: true }

/**
 * The list's add button, which reads "+ Add another address" — onboarding-flavoured copy
 * carried over with the screen. Same pre-existing gap as the "Continue" CTAs elsewhere in
 * this stack; tracked separately from the structural work.
 */
const ADD_ADDRESS_CTA = /Add another address/i

async function openEditor(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Manage locations' })).toBeEnabled()
  })
  await user.click(screen.getByRole('button', { name: 'Manage locations' }))
}

describe('CompanyManagement.Locations', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      handleGetCompanyLocations(() => HttpResponse.json([basicLocation])),
      getLocation,
      getMinimumWages,
      http.put(`${API_BASE_URL}/v1/locations/:location_id`, () => HttpResponse.json(basicLocation)),
    )
  })

  it('renders the SDK error card instead of the block without the companySettingsDashboard flag', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<Locations companyId={COMPANY_ID} onEvent={onEvent} />)

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Manage locations' })).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('opens on the card and swaps to the address list without an onboarding Continue', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Locations companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openEditor(user)

    expect(await screen.findByRole('button', { name: ADD_ADDRESS_CTA })).toBeInTheDocument()
    // The management list is a resting screen; the block's back header is the way out, so the
    // onboarding Continue that advances the setup flow must not render here.
    expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull()
  })

  it('returns an inner address form to the list on cancel, not to the card', async () => {
    // The address sub-flow transitions on a bare CANCEL to return its form to the list, and
    // Flow re-emits that upward. If the block's machine declared its own CANCEL transition,
    // cancelling one address form would close the whole block. This is the regression net
    // for that.
    const user = userEvent.setup()
    renderWithProviders(<Locations companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openEditor(user)
    await user.click(await screen.findByRole('button', { name: ADD_ADDRESS_CTA }))
    await screen.findByLabelText('Street 1')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    // Back on the list, still inside the block.
    expect(await screen.findByRole('button', { name: ADD_ADDRESS_CTA })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Manage locations' })).toBeNull()
  })

  it('keeps the editor open on save and surfaces the alert only once the user leaves', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Locations companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openEditor(user)

    await user.click(await screen.findByRole('button', { name: 'Location actions' }))
    await user.click(await screen.findByTestId('edit-location'))
    await screen.findByLabelText('Street 1')
    await user.click(await screen.findByTestId('location-submit'))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.COMPANY_MANAGEMENT_LOCATIONS_UPDATED,
        expect.anything(),
      )
    })
    // A save must not eject the user mid-task, so no alert yet and the list is still shown.
    expect(await screen.findByRole('button', { name: ADD_ADDRESS_CTA })).toBeInTheDocument()
    expect(screen.queryByText('Locations updated.')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Back to locations' }))

    expect(await screen.findByText('Locations updated.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Manage locations' })).toBeInTheDocument()
  })

  it('returns without an alert when nothing was saved during the visit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Locations companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openEditor(user)
    await user.click(await screen.findByRole('button', { name: 'Back to locations' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage locations' })).toBeInTheDocument()
    })
    expect(screen.queryByText('Locations updated.')).toBeNull()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_CANCELLED,
      undefined,
    )
  })
})
