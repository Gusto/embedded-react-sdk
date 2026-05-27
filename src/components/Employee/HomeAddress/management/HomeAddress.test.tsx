import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http, type HttpResponseResolver } from 'msw'
import { HomeAddress } from './HomeAddress'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'

describe('HomeAddress', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    onEvent.mockClear()
    setupApiTestMocks()
  })

  it('renders management copy and current home address from fixtures', async () => {
    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByText(/100 5th Ave/)).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(screen.getByRole('heading', { name: 'Manage home address' })).toBeInTheDocument()
    expect(screen.getByText('Current home address')).toBeInTheDocument()
    expect(screen.getByText(/New York/)).toBeInTheDocument()
  })

  it('lists prior home addresses in history', async () => {
    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByText(/644 Fay Vista/)).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(screen.getByRole('heading', { name: 'Home address history' })).toBeInTheDocument()
    expect(screen.getByText(/Richmond/)).toBeInTheDocument()
  })

  it('opens the add-address modal when Change address is clicked', async () => {
    const user = userEvent.setup()

    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Change address' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: 'Change address' }))

    expect(screen.getByRole('heading', { name: 'Add a new home address' })).toBeInTheDocument()
  })

  it('marks the Start date as required in the Add address modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Change address' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: 'Change address' }))

    const dialog = await screen.findByRole('dialog')
    const startDateLabel = within(dialog).getByText('Start date').closest('label')
    expect(startDateLabel).not.toBeNull()
    expect(startDateLabel?.textContent ?? '').not.toMatch(/\(optional\)/i)
  })

  it('keeps the Add address modal open and surfaces inline validation when Save is clicked with empty fields', async () => {
    const user = userEvent.setup()
    const createResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}, { status: 201 }))
    server.use(
      http.post(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, createResolver),
    )

    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Change address' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: 'Change address' }))

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('heading', { name: 'Add a new home address' }),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    expect(await within(dialog).findByText('Street address is required')).toBeInTheDocument()
    expect(
      within(dialog).getByRole('heading', { name: 'Add a new home address' }),
    ).toBeInTheDocument()
    expect(createResolver).not.toHaveBeenCalled()
  })

  it('clears entered values when the Add address modal is closed and reopened', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomeAddress employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'Change address' })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: 'Change address' }))

    const firstOpenDialog = await screen.findByRole('dialog')
    const street1FirstOpen = within(firstOpenDialog).getByLabelText(/Street 1/i)
    await user.type(street1FirstOpen, '999 Throwaway Lane')
    expect(street1FirstOpen).toHaveValue('999 Throwaway Lane')

    await user.click(within(firstOpenDialog).getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Add a new home address' })).toBeNull()
    })

    await user.click(screen.getByRole('button', { name: 'Change address' }))

    const reopenedDialog = await screen.findByRole('dialog')
    expect(within(reopenedDialog).getByLabelText(/Street 1/i)).toHaveValue('')
  })
})
