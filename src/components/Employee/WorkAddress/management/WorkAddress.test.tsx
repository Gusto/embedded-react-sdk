import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, type HttpResponseResolver } from 'msw'
import { WorkAddress } from './WorkAddress'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { API_BASE_URL } from '@/test/constants'

describe('WorkAddress (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the card initially with the work-address title and Manage button', async () => {
    renderWithProviders(<WorkAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    expect(screen.getByText('Work address')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
  })

  it('transitions card → editWorkAddress when the Manage button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WorkAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { level: 1, name: 'Work address' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })

  it('returns to the card when the Back button is clicked from the edit screen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WorkAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Back' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument()
    })

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_CANCELLED,
      undefined,
    )
  })

  it('opens the edit modal for a history row without re-fetching that row individually', async () => {
    const user = userEvent.setup()

    // Block the single-address retrieve endpoint. With the cache-warming fix,
    // editing a list-known row should not hit it; without the fix, the call
    // would hang and the page would stay in a loading state.
    const retrieveResolver = vi.fn<HttpResponseResolver>(() => new Promise(() => {}) as never)
    server.use(http.get(`${API_BASE_URL}/v1/work_addresses/:work_address_uuid`, retrieveResolver))

    renderWithProviders(<WorkAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage' }))

    const menuButtons = await waitFor(
      () => {
        const buttons = screen.getAllByRole('button', { name: 'Open work address row actions' })
        expect(buttons.length).toBeGreaterThan(0)
        return buttons
      },
      { timeout: 5000 },
    )

    await user.click(menuButtons[0] as HTMLElement)
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Edit work address' })).toBeInTheDocument()
    expect(retrieveResolver).not.toHaveBeenCalled()
  })
})
