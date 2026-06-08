import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http, type HttpResponseResolver } from 'msw'
import { HomeAddress } from './HomeAddress'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { API_BASE_URL } from '@/test/constants'

describe('HomeAddress (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the card initially with the title and Manage CTA', async () => {
    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    expect(screen.getByText('Home address')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Manage home address' })).toBeNull()
  })

  it('transitions card → editHomeAddress when Manage is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage' }))

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Manage home address' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_HOME_ADDRESS_EDIT_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })

  it('returns to the card when Back is clicked in the edit form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage' }))

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Manage home address' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: 'Back' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument()
    })

    expect(screen.queryByRole('heading', { name: 'Manage home address' })).toBeNull()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_HOME_ADDRESS_EDIT_CANCELLED,
      undefined,
    )
  })

  it('keeps the Edit modal open and renders the submit error inside the modal when the API returns 422 (SDK-930)', async () => {
    const user = userEvent.setup()
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(
        {
          errors: [
            {
              error_key: 'street1',
              category: 'invalid_attribute_value',
              message: 'Could not be verified by USPS',
            },
          ],
        },
        { status: 422 },
      ),
    )
    server.use(http.put(`${API_BASE_URL}/v1/home_addresses/:uuid`, updateResolver))

    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage' }))

    const editButton = await screen.findByRole('button', { name: /^Edit$/ }, { timeout: 5000 })
    await user.click(editButton)

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Edit home address' })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    expect(updateResolver).toHaveBeenCalledTimes(1)

    // Error renders inside the modal.
    expect(await within(dialog).findByText("We couldn't save this address")).toBeInTheDocument()
    // API message appears at least once inside the dialog (alert + possible field-level echo).
    expect(within(dialog).getAllByText('Could not be verified by USPS').length).toBeGreaterThan(0)

    // Modal stays open.
    expect(within(dialog).getByRole('heading', { name: 'Edit home address' })).toBeInTheDocument()

    // Page-level alert outside the dialog is not the source of the submit error.
    // (BaseLayout would render an alert with role="alert" at the page level — assert none exist
    // outside the dialog scope.)
    const pageAlerts = screen.queryAllByRole('alert').filter(alert => !dialog.contains(alert))
    expect(pageAlerts).toHaveLength(0)
  })

  it('clears the submit error from the modal when it is closed and reopened (SDK-930)', async () => {
    const user = userEvent.setup()
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(
        {
          errors: [
            {
              error_key: 'street1',
              category: 'invalid_attribute_value',
              message: 'Could not be verified by USPS',
            },
          ],
        },
        { status: 422 },
      ),
    )
    server.use(http.put(`${API_BASE_URL}/v1/home_addresses/:uuid`, updateResolver))

    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage' }))

    const editButton = await screen.findByRole('button', { name: /^Edit$/ }, { timeout: 5000 })
    await user.click(editButton)
    const firstOpenDialog = await screen.findByRole('dialog')
    await user.click(within(firstOpenDialog).getByRole('button', { name: 'Save' }))
    await within(firstOpenDialog).findByText("We couldn't save this address")

    await user.click(within(firstOpenDialog).getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    await user.click(await screen.findByRole('button', { name: /^Edit$/ }))

    const reopenedDialog = await screen.findByRole('dialog')
    expect(within(reopenedDialog).queryByText("We couldn't save this address")).toBeNull()
  })

  it('keeps the Current home address card pinned to the active row when editing a history row', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage' }))

    // Fixture: 100 5th Ave is active, 644 Fay Vista is in history.
    await waitFor(
      () => {
        expect(screen.getByText(/100 5th Ave/)).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    const currentSection = screen
      .getByRole('heading', { name: 'Current home address' })
      .closest<HTMLElement>('[data-testid="data-box"]')
    expect(currentSection).not.toBeNull()
    expect(within(currentSection!).getByText(/100 5th Ave/)).toBeInTheDocument()

    // Open Edit on the (inactive) history row via the kebab menu.
    const menuButtons = screen.getAllByRole('button', {
      name: 'Open address row actions',
    })
    await user.click(menuButtons[0] as HTMLElement)
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    // The Current card must still show the active address — not the row being
    // edited. Without the fix, the card mirrors whichever uuid the edit form
    // is pointing at.
    expect(within(currentSection!).getByText(/100 5th Ave/)).toBeInTheDocument()
    expect(within(currentSection!).queryByText(/644 Fay Vista/)).toBeNull()
  })

  it('opens the edit modal for a history row without re-fetching that row individually', async () => {
    const user = userEvent.setup()

    // Block the single-address retrieve endpoint. With the cache-warming fix,
    // editing a list-known row should not hit it; without the fix, the call
    // would hang and the page would stay in a loading state.
    const retrieveResolver = vi.fn<HttpResponseResolver>(() => new Promise(() => {}) as never)
    server.use(http.get(`${API_BASE_URL}/v1/home_addresses/:uuid`, retrieveResolver))

    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage' }))

    await waitFor(
      () => {
        expect(screen.getByText(/644 Fay Vista/)).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    const menuButtons = screen.getAllByRole('button', {
      name: 'Open address row actions',
    })
    await user.click(menuButtons[0] as HTMLElement)
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Edit home address' })).toBeInTheDocument()
    expect(retrieveResolver).not.toHaveBeenCalled()
  })
})
