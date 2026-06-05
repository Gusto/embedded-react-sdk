import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { HomeAddressCard } from './HomeAddressCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { componentEvents } from '@/shared/constants'

describe('HomeAddressCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the card title and active home address once loaded', async () => {
    renderWithProviders(<HomeAddressCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    expect(screen.getByText('Home address')).toBeInTheDocument()
    expect(screen.getByText(/100 5th Ave/)).toBeInTheDocument()
    expect(screen.getByText(/New York/)).toBeInTheDocument()
  })

  it('renders the empty-state copy when the employee has no addresses on file', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, () =>
        HttpResponse.json([]),
      ),
    )

    renderWithProviders(<HomeAddressCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    expect(screen.getByText('No home address on file')).toBeInTheDocument()
  })

  it('fires EMPLOYEE_MANAGEMENT_HOME_ADDRESS_EDIT_REQUESTED with { employeeId } when Manage is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomeAddressCard employeeId="employee-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.EMPLOYEE_MANAGEMENT_HOME_ADDRESS_EDIT_REQUESTED,
      { employeeId: 'employee-123' },
    )
  })
})
