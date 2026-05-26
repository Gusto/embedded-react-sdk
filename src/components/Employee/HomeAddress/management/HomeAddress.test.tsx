import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomeAddress } from './HomeAddress'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

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
